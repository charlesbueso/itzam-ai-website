import "server-only";

import {
  SELF_QUESTIONS,
  answerLabel,
  type SelfAnswers,
} from "./questions";
import type { ScoreResult } from "./scoring";

/**
 * Flattens an assessment submission into a fixed-column row and POSTs it to
 * the Google Sheets Apps Script webhook (apps-script/assessment-webhook.gs).
 *
 * Headers are Spanish (team-facing, contact@itzam.ai) and column order is
 * stable so rows always line up. Answer values render in the respondent's
 * locale so the team sees exactly what the lead chose.
 *
 * Env: GOOGLE_SHEETS_ASSESSMENT_WEBHOOK_URL (required),
 *      GOOGLE_SHEETS_ASSESSMENT_SECRET (optional; must match the Apps Script
 *      script property if set there).
 */

const BAND_ES: Record<ScoreResult["band"], string> = {
  manual: "Manual / Punto de partida",
  in_motion: "En marcha",
  building: "Tomando impulso",
  ai_ready: "Listo para IA",
};

const DIM_ES: Record<string, string> = {
  data_crm: "Datos y CRM",
  documented_process: "Proceso documentado",
  proposals: "Propuestas",
  response_speed: "Velocidad de respuesta",
  ai_maturity: "Madurez en IA",
};

export type AssessmentSheetInput = {
  locale: "es" | "en";
  contact: { name: string; role: string; company: string; email: string; phone: string };
  answers: SelfAnswers;
  otherTexts: Record<string, string>;
  wish: string;
  comments: string;
  /** MXN/month value at stake, or null when not computed. */
  valueAtStakeMxn: number | null;
  score: ScoreResult;
  ip: string | null;
  userAgent: string | null;
};

/** Build the ordered [headers, values] for the sheet row. Exported for tests. */
export function buildSheetRow(input: AssessmentSheetInput): {
  headers: string[];
  values: string[];
} {
  const headers: string[] = [
    "Fecha",
    "Nombre",
    "Puesto",
    "Empresa",
    "Email",
    "Teléfono",
    "Idioma",
    "Score",
    "Nivel",
  ];
  const values: string[] = [
    new Date().toISOString(),
    input.contact.name,
    input.contact.role,
    input.contact.company,
    input.contact.email,
    input.contact.phone || "",
    input.locale,
    String(input.score.score),
    BAND_ES[input.score.band],
  ];

  // One column per question, in definition order.
  for (const q of SELF_QUESTIONS) {
    headers.push(q.label_es);
    let val = answerLabel(q, input.answers[q.key], input.locale);
    const other = input.otherTexts[q.key];
    if (other) val += ` (${other})`;
    values.push(val);
  }

  headers.push("Una cosa a resolver");
  values.push(input.wish || "");

  headers.push("Comentarios");
  values.push(input.comments || "");

  headers.push("Valor en riesgo (MXN/mes)");
  values.push(input.valueAtStakeMxn != null ? String(input.valueAtStakeMxn) : "");

  headers.push("Dimensiones");
  values.push(
    input.score.dimensions.map((d) => `${DIM_ES[d.key] ?? d.key}: ${d.value}`).join(" · ")
  );

  headers.push("IP");
  values.push(input.ip || "");
  headers.push("User Agent");
  values.push(input.userAgent || "");

  return { headers, values };
}

export function isSheetEnabled(): boolean {
  return Boolean(process.env.GOOGLE_SHEETS_ASSESSMENT_WEBHOOK_URL);
}

/**
 * Sends the row to the webhook. Throws on failure so the caller can decide
 * whether to surface an error (submission storage is the one hard dependency).
 */
export async function sendToSheet(input: AssessmentSheetInput): Promise<void> {
  const url = process.env.GOOGLE_SHEETS_ASSESSMENT_WEBHOOK_URL;
  if (!url) throw new Error("sheet_webhook_not_configured");
  const secret = process.env.GOOGLE_SHEETS_ASSESSMENT_SECRET || undefined;

  const { headers, values } = buildSheetRow(input);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, headers, values }),
  });
  const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!res.ok || !body || body.ok === false) {
    throw new Error(`sheet_webhook_${res.status}: ${body?.error ?? "unknown"}`);
  }
}
