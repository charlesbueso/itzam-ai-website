import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { SELF_QUESTIONS, answerLabel, type SelfAnswers } from "./questions";
import type { ScoreResult, DimensionKey } from "./scoring";

/**
 * Claude pipeline for the Free AI Assessment report.
 *
 *   1. legitCheck()  — Haiku 4.5, cheap gate: are the answers a real business
 *      or invented/spam? Runs BEFORE the expensive report call.
 *   2. generateReportContent() — Sonnet 5, structured output. Returns only the
 *      prose that fills the fixed PDF template (lib/assessment/pdf.tsx). The
 *      layout lives in code, so the format costs zero tokens per report; the
 *      stable system prompt is prompt-cached.
 *
 * Model IDs are env-overridable so cost/quality can be tuned without a deploy
 * (ASSESSMENT_LEGIT_MODEL, ASSESSMENT_REPORT_MODEL). Defaults are chosen to be
 * cheap-where-possible: Haiku to screen, Sonnet 5 for client-facing prose.
 *
 * Env: ANTHROPIC_API_KEY.
 */

const LEGIT_MODEL = process.env.ASSESSMENT_LEGIT_MODEL || "claude-haiku-4-5";
const REPORT_MODEL = process.env.ASSESSMENT_REPORT_MODEL || "claude-sonnet-5";
const TIMEOUT_MS = 55_000;

let cached: Anthropic | null = null;
function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  if (cached) return cached;
  cached = new Anthropic({ apiKey: key, timeout: TIMEOUT_MS, maxRetries: 1 });
  return cached;
}

export function isReportEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// ─────────────────────────── Legit check ───────────────────────────

const LegitSchema = z.object({
  legit: z.boolean().describe("true if the answers plausibly describe a real company's sales operation"),
  confidence: z.enum(["low", "medium", "high"]),
  reason: z.string().describe("one short sentence explaining the verdict"),
});
export type LegitResult = z.infer<typeof LegitSchema>;

// ─────────────────────────── Report content ───────────────────────────

const DimNote = z.object({
  status: z.string().describe("short 2-3 word status label, opportunity-framed, in the report's language (plain text, no label prefix)"),
  observation: z.string().describe("one sentence on what their answer reveals about this dimension, in the report's language, plain text"),
  cost: z.string().describe("one sentence stating what this is costing them, in the report's language. Do NOT prefix it with any label (the template already renders 'Qué te cuesta:' / 'What it costs you:'). Plain text, no markdown."),
});

export const ReportSchema = z.object({
  subtitle: z.string().describe("cover subtitle, ONE short line (max ~18 words), in the report's language, describing where AI can generate the most impact in their commercial operation"),
  exec_intro: z.array(z.string()).describe("exactly 2 paragraphs opening the executive summary, EACH 2-3 sentences max, addressing the lead by first name and naming their company"),
  score_blurb: z.string().describe("2 sentences max on what their score/band means for them"),
  cost_callout: z.string().describe("2-3 concise sentences on what their current manual operation is costing them (the highlighted box)"),
  findings: z
    .array(z.object({ title: z.string(), body: z.string() }))
    .describe("exactly 3 key findings; title is a bold lead-in (max ~10 words), body is ONE sentence"),
  dimensions: z
    .object({
      data_crm: DimNote,
      documented_process: DimNote,
      proposals: DimNote,
      response_speed: DimNote,
      ai_maturity: DimNote,
    })
    .describe("a note for each of the 5 scored dimensions"),
  opportunities: z
    .array(
      z.object({
        title: z.string().describe("numbered title in the report's language, e.g. '1. …'"),
        problem: z.string().describe("1-2 sentences, report's language, plain text, no label prefix"),
        ai_can_do: z.string().describe("1-2 sentences, report's language, plain text, no label prefix"),
        impact: z.string().describe("1 sentence, report's language, plain text, no label prefix"),
        solution: z.string().describe("short Itzam solution name from the catalog, e.g. 'Sales Playbook + RFP Generator'"),
      })
    )
    .describe("exactly 3 opportunities, ordered by impact, mapped to Itzam solutions"),
  quick_wins: z.array(z.string()).describe("exactly 3 quick wins, EACH a short phrase (max ~14 words), not a paragraph"),
  strategic_projects: z.array(z.string()).describe("exactly 3 deeper projects, EACH a short phrase (max ~16 words), not a paragraph"),
});

export type ReportContent = z.infer<typeof ReportSchema>;

const SERVICE_CATALOG = `Map each opportunity to the Itzam solution for that bottleneck (use these exact solution names):
- bottleneck "lead_gen" (generating/qualifying leads) -> "Customer Support Engine" (24/7 AI web chat that qualifies leads)
- bottleneck "response" (responding on time)          -> "Customer Support Engine"
- bottleneck "followup" (following up)                -> "Follow-up Automation" / "Automatización de seguimiento" (email + WhatsApp sequences)
- bottleneck "proposals" (proposals/quotes/RFPs)      -> "Sales Playbook + RFP Generator"
- bottleneck "knowledge" (scattered knowledge)        -> "Company AI Brain"
- bottleneck "pipeline" (pipeline/reporting/admin)    -> "Company AI Brain" / reporting automation
Opportunity #1 must map to the client's #1 bottleneck (q9). Reinforce it with the lowest-scoring dimension.`;

function systemPrompt(locale: "es" | "en"): string {
  if (locale === "en") {
    return `You are the senior analyst at Itzam.AI, a Mexican AI agency that automates sales operations for commercial teams in Mexico and LatAm.

You write the personalized content for a lead's Free AI Assessment report (a designed 6-page PDF; you only supply the prose, never the layout). Your text goes straight into a client-facing document.

Rules:
- Write EVERY field entirely in English — including short status labels and solution names. Never leave a word in Spanish.
- Plain text only: no markdown, no asterisks, no bullet characters, no label prefixes inside a value (the template renders labels like "What it costs you:" itself — never write "What it costs you:" or "Qué te cuesta:" inside the text).
- Direct, consultative, warm-but-professional. No hype, no inflated promises, no emoji.
- Ground EVERY claim in their concrete answers. Never invent numbers, tools, or facts they didn't provide.
- The bottleneck they marked #1 must be the first/biggest opportunity, connected to their weakest score dimensions.
- Be specific and operational ("generate proposal drafts in minutes from your catalog"), not vague ("use AI to improve processes").
- Do not restate the numeric score in prose; it is rendered separately.
- Match the requested counts exactly (2 intro paragraphs, 3 findings, 3 opportunities, 3 quick wins, 3 strategic projects).
- Be concise — this renders into a fixed one-page-per-section PDF. Keep paragraphs to 2-3 sentences; quick wins and strategic projects are short phrases, not paragraphs. Use the shortest wording that keeps the insight.
- If a value-at-stake MXN figure is provided, weave it into the cost_callout, phrased conditionally ("could be exposing on the order of…") — never as promised or lost revenue. If none is provided, do not invent one; speak only about volume and time.
- If the lead stated a "one thing to fix" or extra comments, reflect that back in the executive summary so they feel read.

${SERVICE_CATALOG}`;
  }
  return `Eres el analista senior de Itzam.AI, una agencia mexicana de IA que automatiza operaciones de ventas para equipos comerciales en México y LatAm.

Escribes el contenido personalizado del reporte del AI Free Assessment de un lead (un PDF diseñado de 6 páginas; tú solo aportas la prosa, nunca el diseño). Tu texto va directo a un documento que ve el cliente.

Reglas:
- Escribe TODOS los campos completamente en español — incluidas las etiquetas de estado y los nombres de solución. Nunca dejes palabras en inglés.
- Solo texto plano: sin markdown, sin asteriscos, sin viñetas, y sin prefijos de etiqueta dentro de un valor (la plantilla ya pone etiquetas como "Qué te cuesta:" — nunca escribas "Qué te cuesta:" dentro del texto).
- Tono directo y consultivo, cercano pero profesional. Sin hype, sin promesas infladas, sin emojis.
- Fundamenta CADA afirmación en sus respuestas concretas. Nunca inventes números, herramientas o datos que no dieron.
- El cuello de botella que marcaron como #1 debe ser la primera y mayor oportunidad, conectada con sus dimensiones más débiles del score.
- Sé específico y operativo ("generar borradores de propuestas en minutos desde tu catálogo"), no vago ("usar IA para mejorar procesos").
- No repitas el número del score en la prosa; se muestra por separado.
- Respeta exactamente las cantidades pedidas (2 párrafos de intro, 3 hallazgos, 3 oportunidades, 3 ganancias rápidas, 3 proyectos de fondo).
- Sé conciso — esto se renderiza en un PDF de una página por sección. Mantén los párrafos en 2-3 oraciones; las ganancias rápidas y los proyectos de fondo son frases cortas, no párrafos. Usa la redacción más breve que conserve la idea.
- Si se proporciona una cifra de valor en riesgo (MXN), inclúyela en el cost_callout, redactada en condicional ("podría estar exponiendo del orden de…") — nunca como ingreso perdido o prometido. Si no se proporciona, no la inventes; habla solo de volumen y tiempo.
- Si el lead indicó "una cosa a resolver" o comentarios extra, refléjalo en el resumen ejecutivo para que se sienta escuchado.

${SERVICE_CATALOG}`;
}

export type ReportInput = {
  locale: "es" | "en";
  firstName: string;
  fullName: string;
  role: string;
  company: string;
  industry: string;
  answers: SelfAnswers;
  otherTexts: Record<string, string>;
  wish: string;
  comments: string;
  /** MXN/month pipeline exposed to slow response, or null when not computable. */
  valueAtStakeMxn: number | null;
  valueAtStakeLeads: number | null;
  score: ScoreResult;
};

function mxn(n: number): string {
  return `$${n.toLocaleString("es-MX")} MXN`;
}

function answersBlock(input: ReportInput): string {
  const lines = SELF_QUESTIONS.map((q) => {
    const label = input.locale === "en" ? q.label_en : q.label_es;
    let val = answerLabel(q, input.answers[q.key], input.locale);
    const other = input.otherTexts[q.key];
    if (other) val += ` (${other})`;
    return `- ${label}: ${val || "—"}`;
  });
  const dims = input.score.dimensions.map((d) => `- ${d.key}: ${d.value}/100`).join("\n");

  // Value-at-stake: a directional figure the model must phrase conditionally.
  const vasLine =
    input.valueAtStakeMxn != null
      ? `Value at stake (directional — phrase conditionally, never as promised lost revenue): with ~${input.valueAtStakeLeads} leads/month and their ticket range, slow first response exposes on the order of ${mxn(input.valueAtStakeMxn)} of pipeline per month to a faster competitor. Weave this MXN figure into the cost_callout, hedged ("could be exposing on the order of…").`
      : `Value at stake: NOT computable (no ticket range given) — do NOT invent an MXN figure; speak only in terms of volume and time in the cost_callout.`;

  return [
    `Lead: ${input.fullName} — ${input.role} at ${input.company} (${input.industry})`,
    ``,
    `Answers:`,
    ...lines,
    input.wish ? `- Stated one thing to fix: ${input.wish}` : ``,
    input.comments ? `- Extra comments: ${input.comments}` : ``,
    ``,
    `AI Sales Readiness Score: ${input.score.score}/100 (band: ${input.score.band})`,
    `Dimension scores (weakest first):`,
    dims,
    ``,
    vasLine,
  ].join("\n");
}

/** Cheap Haiku gate. Returns null when disabled or on error (caller decides). */
export async function legitCheck(input: ReportInput): Promise<LegitResult | null> {
  const client = getClient();
  if (!client) return null;
  try {
    const res = await client.messages.parse({
      model: LEGIT_MODEL,
      max_tokens: 1024,
      output_config: { format: zodOutputFormat(LegitSchema) },
      system:
        "You screen inbound sales-assessment submissions for a B2B agency. Decide whether the answers plausibly describe a real company's sales operation, or look invented, contradictory, gibberish, or spammy (e.g. joke company, random text, impossible combinations). Be lenient with thin-but-coherent answers — only flag clearly fake or nonsensical ones.",
      messages: [{ role: "user", content: answersBlock(input) }],
    });
    return res.parsed_output ?? null;
  } catch (e) {
    console.warn("[assessment] legitCheck failed:", e instanceof Error ? e.message : String(e));
    return null;
  }
}

/** Generate the report prose. Returns null when disabled; throws on API error. */
export async function generateReportContent(
  input: ReportInput
): Promise<{ content: ReportContent; model: string } | null> {
  const client = getClient();
  if (!client) return null;

  const res = await client.messages.parse({
    model: REPORT_MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: zodOutputFormat(ReportSchema),
    },
    system: [
      {
        type: "text",
        text: systemPrompt(input.locale),
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: answersBlock(input) }],
  });

  if (res.stop_reason === "refusal" || !res.parsed_output) {
    console.warn("[assessment] report generation returned no output", res.stop_reason);
    return null;
  }
  return { content: res.parsed_output, model: REPORT_MODEL };
}

// ─────────────────────────── Shared render helpers ───────────────────────────

export const DIM_LABELS: Record<DimensionKey, { es: string; en: string }> = {
  data_crm: { es: "Datos y CRM", en: "Data & CRM" },
  documented_process: { es: "Proceso de ventas documentado", en: "Documented sales process" },
  proposals: { es: "Propuestas y cotizaciones", en: "Proposals & quotes" },
  response_speed: { es: "Velocidad de respuesta", en: "Response speed" },
  ai_maturity: { es: "Madurez en IA", en: "AI maturity" },
};

export const BAND_LABELS: Record<ScoreResult["band"], { es: string; en: string }> = {
  manual: { es: "Manual / Punto de partida", en: "Manual / Starting point" },
  in_motion: { es: "En marcha", en: "In motion" },
  building: { es: "Tomando impulso", en: "Building momentum" },
  ai_ready: { es: "Listo para IA", en: "AI-ready" },
};

/** Bar color by value — matches the sample: <40 red, 40-64 gold, else green. */
export function dimensionColor(value: number): string {
  return value < 40 ? "#E0574A" : value < 65 ? "#C9A84C" : "#4DBD74";
}
