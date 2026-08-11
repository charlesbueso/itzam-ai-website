/**
 * Source of truth for the self-serve Free AI Assessment (marketing site).
 *
 * 16 clickable questions (q1–q16) + two optional open-text fields handled in the
 * form (one_thing, comments) + contact. Value codes match the scoring tables in
 * scoring.ts EXACTLY — keep them in sync (see the QA checklist).
 *
 * Design rule (per q-review): every question must do at least one of —
 *   (a) feed a score dimension, (b) personalize the report narrative,
 *   (c) quantify ROI / cost of inaction, (d) qualify the lead (ICP + intent).
 *
 * Shared between client (form rendering) and server (validation, scoring,
 * report prompt) — keep it free of server-only imports.
 */

export type SelfQuestionType = "single" | "multi";

export type SelfSection = "company" | "scale" | "tools" | "process" | "ai";

export type SelfOption = {
  value: string;
  label_es: string;
  label_en: string;
};

export type SelfQuestion = {
  /** Stable key — used as the answers-object key and column path. */
  key: string;
  type: SelfQuestionType;
  section: SelfSection;
  label_es: string;
  label_en: string;
  /** Short parenthetical shown next to the label. */
  hint_es?: string;
  hint_en?: string;
  /** Longer helper line shown under the options. */
  helper_es?: string;
  helper_en?: string;
  required: boolean;
  options: SelfOption[];
  /** When this option is selected, show a free-text "which?" input. */
  otherValue?: string;
};

const BOTTLENECK_OPTIONS: SelfOption[] = [
  { value: "lead_gen", label_es: "Generar y calificar leads", label_en: "Generating and qualifying leads" },
  { value: "followup", label_es: "Dar seguimiento a prospectos", label_en: "Following up with prospects" },
  { value: "proposals", label_es: "Propuestas, cotizaciones y RFPs", label_en: "Proposals, quotes and RFPs" },
  { value: "response", label_es: "Responder a clientes a tiempo", label_en: "Responding to customers on time" },
  { value: "knowledge", label_es: "Conocimiento disperso / onboarding", label_en: "Scattered knowledge / onboarding" },
  { value: "pipeline", label_es: "Pipeline, reportes y admin", label_en: "Pipeline, reporting and admin" },
];

export const SELF_QUESTIONS: SelfQuestion[] = [
  // ── A · Your company ──────────────────────────────────────────────
  {
    key: "q1_industry",
    type: "single",
    section: "company",
    label_es: "¿En qué industria opera tu empresa?",
    label_en: "What industry does your company operate in?",
    required: true,
    otherValue: "other",
    options: [
      { value: "it_reseller", label_es: "IT Resellers / Canal Tech", label_en: "IT Resellers / Tech Channel" },
      { value: "prof_services", label_es: "Servicios Profesionales", label_en: "Professional Services" },
      { value: "distribution", label_es: "Distribución / Manufactura", label_en: "Distribution / Manufacturing" },
      { value: "retail", label_es: "Retail / eCommerce", label_en: "Retail / eCommerce" },
      { value: "logistics", label_es: "Logística / Cadena de suministro", label_en: "Logistics / Supply Chain" },
      { value: "fintech", label_es: "Servicios Financieros / Fintech", label_en: "Financial Services / Fintech" },
      { value: "healthcare", label_es: "Salud", label_en: "Healthcare" },
      { value: "other", label_es: "Otra", label_en: "Other" },
    ],
  },
  {
    key: "q2_employees",
    type: "single",
    section: "company",
    label_es: "¿Cuántos empleados tiene tu empresa?",
    label_en: "How many employees does your company have?",
    required: true,
    options: [
      { value: "e_5_20", label_es: "5–20", label_en: "5–20" },
      { value: "e_21_50", label_es: "21–50", label_en: "21–50" },
      { value: "e_51_150", label_es: "51–150", label_en: "51–150" },
      { value: "e_151_500", label_es: "151–500", label_en: "151–500" },
      { value: "e_500p", label_es: "Más de 500", label_en: "500+" },
    ],
  },
  {
    key: "q3_sales_team",
    type: "single",
    section: "company",
    label_es: "¿Cuántas personas tiene tu equipo de ventas?",
    label_en: "How many people are on your sales team?",
    required: true,
    options: [
      { value: "s_1_5", label_es: "1–5", label_en: "1–5" },
      { value: "s_6_15", label_es: "6–15", label_en: "6–15" },
      { value: "s_16_30", label_es: "16–30", label_en: "16–30" },
      { value: "s_30p", label_es: "Más de 30", label_en: "30+" },
    ],
  },

  // ── B · Scale & value ─────────────────────────────────────────────
  {
    key: "q4_leads_month",
    type: "single",
    section: "scale",
    label_es: "¿Cuántos leads/consultas nuevas recibes al mes?",
    label_en: "How many new leads/inquiries do you get per month?",
    required: true,
    options: [
      { value: "lt10", label_es: "Menos de 10", label_en: "Fewer than 10" },
      { value: "r10_30", label_es: "10–30", label_en: "10–30" },
      { value: "r30_100", label_es: "30–100", label_en: "30–100" },
      { value: "gt100", label_es: "Más de 100", label_en: "100+" },
    ],
  },
  {
    key: "q5_avg_ticket",
    type: "single",
    section: "scale",
    label_es: "¿Cuál es tu ticket / venta promedio?",
    label_en: "What's your average deal size?",
    helper_es: "Un rango aproximado basta — solo lo usamos para estimar tu potencial.",
    helper_en: "Rough range is fine — we only use it to estimate your upside.",
    required: false,
    options: [
      { value: "lt20k", label_es: "Menos de $20K MXN", label_en: "Under $20K MXN" },
      { value: "r20_80k", label_es: "$20K–$80K MXN", label_en: "$20K–$80K MXN" },
      { value: "r80_300k", label_es: "$80K–$300K MXN", label_en: "$80K–$300K MXN" },
      { value: "gt300k", label_es: "Más de $300K MXN", label_en: "$300K+ MXN" },
      { value: "na", label_es: "Prefiero no decir", label_en: "Prefer not to say" },
    ],
  },

  // ── C · Tools & leads ─────────────────────────────────────────────
  {
    key: "q6_crm_tools",
    type: "multi",
    section: "tools",
    label_es: "¿Qué CRM o herramientas usan hoy?",
    label_en: "What CRM or tools do you use today?",
    hint_es: "Elige los que apliquen",
    hint_en: "Pick all that apply",
    required: true,
    otherValue: "other",
    options: [
      { value: "hubspot", label_es: "HubSpot", label_en: "HubSpot" },
      { value: "salesforce", label_es: "Salesforce", label_en: "Salesforce" },
      { value: "zoho", label_es: "Zoho / Monday", label_en: "Zoho / Monday" },
      { value: "pipedrive", label_es: "Pipedrive", label_en: "Pipedrive" },
      { value: "bitrix24", label_es: "Bitrix24", label_en: "Bitrix24" },
      { value: "sugar", label_es: "Sugar CRM", label_en: "Sugar CRM" },
      { value: "whatsapp", label_es: "WhatsApp Business", label_en: "WhatsApp Business" },
      { value: "excel_sheets", label_es: "Excel / Sheets", label_en: "Excel / Sheets" },
      { value: "none", label_es: "Ninguno", label_en: "None" },
      { value: "other", label_es: "Otro", label_en: "Other" },
    ],
  },
  {
    key: "q7_crm_usage",
    type: "single",
    section: "tools",
    label_es: "¿Qué tan bien aprovechan ese CRM / herramientas?",
    label_en: "How well do you leverage that CRM / those tools?",
    required: true,
    options: [
      { value: "barely", label_es: "Casi no lo usamos", label_en: "We barely use it" },
      { value: "messy", label_es: "Poco / desordenado", label_en: "A little / messy" },
      { value: "underused", label_es: "Bien, pero no a su potencial", label_en: "Well, but not to its potential" },
      { value: "well", label_es: "Lo aprovechamos muy bien", label_en: "We use it very well" },
    ],
  },
  {
    key: "q8_lead_sources",
    type: "multi",
    section: "tools",
    label_es: "¿Cómo llegan sus leads hoy?",
    label_en: "How do your leads arrive today?",
    hint_es: "Elige los que apliquen",
    hint_en: "Pick all that apply",
    required: true,
    otherValue: "other",
    options: [
      { value: "prospecting", label_es: "Prospección activa", label_en: "Active prospecting" },
      { value: "referrals", label_es: "Referencias", label_en: "Referrals" },
      { value: "inbound", label_es: "Inbound (web/redes)", label_en: "Inbound (web/social)" },
      { value: "channel", label_es: "Canal / Partners", label_en: "Channel / Partners" },
      { value: "events", label_es: "Eventos", label_en: "Events" },
      { value: "other", label_es: "Otra fuente", label_en: "Other source" },
    ],
  },

  // ── D · Process & bottlenecks ─────────────────────────────────────
  {
    key: "q9_bottleneck_1",
    type: "single",
    section: "process",
    label_es: "¿Cuál es tu mayor cuello de botella en ventas?",
    label_en: "What's your biggest sales bottleneck?",
    hint_es: "El principal",
    hint_en: "The main one",
    required: true,
    options: BOTTLENECK_OPTIONS,
  },
  {
    key: "q10_bottleneck_2",
    type: "single",
    section: "process",
    label_es: "¿Y el segundo cuello de botella?",
    label_en: "And the second bottleneck?",
    hint_es: "Opcional",
    hint_en: "Optional",
    required: false,
    options: BOTTLENECK_OPTIONS,
  },
  {
    key: "q11_process_doc",
    type: "single",
    section: "process",
    label_es: "¿Tienen documentado su proceso de ventas (playbook, guiones, objeciones)?",
    label_en: "Is your sales process documented (playbook, scripts, objections)?",
    required: true,
    options: [
      { value: "in_heads", label_es: "No, está en la cabeza de cada vendedor", label_en: "No, it lives in each rep's head" },
      { value: "partial", label_es: "Parcialmente / desactualizado", label_en: "Partially / outdated" },
      { value: "documented", label_es: "Sí, documentado y en uso", label_en: "Yes, documented and in use" },
    ],
  },
  {
    key: "q12_proposals",
    type: "single",
    section: "process",
    label_es: "¿Cómo elaboran propuestas y cotizaciones hoy?",
    label_en: "How do you build proposals and quotes today?",
    required: true,
    options: [
      { value: "manual", label_es: "Desde cero, cada vez (manual)", label_en: "From scratch, every time (manual)" },
      { value: "templates", label_es: "Con plantillas que adaptamos", label_en: "With templates we adapt" },
      { value: "semi_auto", label_es: "Con un sistema semi-automatizado", label_en: "With a semi-automated system" },
    ],
  },
  {
    key: "q13_response_speed",
    type: "single",
    section: "process",
    label_es: "Cuando un cliente escribe (WhatsApp / web / email), ¿en cuánto responden?",
    label_en: "When a customer writes (WhatsApp/web/email), how fast do you respond?",
    required: true,
    options: [
      { value: "days_week", label_es: "Días — dentro de la semana", label_en: "Days — within the week" },
      { value: "hours_nextday", label_es: "Horas o al día siguiente", label_en: "Hours or next day" },
      { value: "under_1h", label_es: "Menos de 1 hora en horario laboral", label_en: "Under 1 hour during business hours" },
      { value: "immediate", label_es: "Casi inmediato, incluso fuera de horario", label_en: "Almost immediate, even after hours" },
    ],
  },
  {
    key: "q14_deal_length",
    type: "single",
    section: "process",
    label_es: "¿Cuánto tarda un deal típico del primer contacto al cierre?",
    label_en: "How long does a typical deal take from first contact to close?",
    required: true,
    options: [
      { value: "lt2w", label_es: "Menos de 2 semanas", label_en: "Under 2 weeks" },
      { value: "w2_4", label_es: "2–4 semanas", label_en: "2–4 weeks" },
      { value: "m1_3", label_es: "1–3 meses", label_en: "1–3 months" },
      { value: "m3p", label_es: "Más de 3 meses", label_en: "3+ months" },
    ],
  },

  // ── E · AI & priority ─────────────────────────────────────────────
  {
    key: "q15_ai_tried",
    type: "single",
    section: "ai",
    label_es: "¿Han intentado usar IA o automatización en ventas antes?",
    label_en: "Have you tried AI or automation in sales before?",
    required: true,
    options: [
      { value: "never", label_es: "No, nunca", label_en: "No, never" },
      { value: "chatgpt_informal", label_es: "Sí, ChatGPT de forma informal", label_en: "Yes, ChatGPT informally" },
      { value: "structured_project", label_es: "Sí, un proyecto estructurado", label_en: "Yes, a structured project" },
      { value: "running", label_es: "Sí, ya tenemos algo funcionando", label_en: "Yes, we have something running" },
    ],
  },
  {
    key: "q16_urgency",
    type: "single",
    section: "ai",
    label_es: "¿Cuándo quieres empezar a mejorar esto?",
    label_en: "When do you want to start improving this?",
    hint_es: "Opcional",
    hint_en: "Optional",
    required: false,
    options: [
      { value: "exploring", label_es: "Solo explorando", label_en: "Just exploring" },
      { value: "soon", label_es: "En los próximos 1–3 meses", label_en: "Next 1–3 months" },
      { value: "asap", label_es: "Lo antes posible", label_en: "As soon as possible" },
    ],
  },
];

/** Answers payload shape: question key → selected value(s). */
export type SelfAnswers = {
  [key: string]: string | string[] | undefined;
};

export function questionByKey(key: string): SelfQuestion | undefined {
  return SELF_QUESTIONS.find((q) => q.key === key);
}

/** Render an answer as a human-readable string in the given locale. */
export function answerLabel(
  q: SelfQuestion,
  value: string | string[] | undefined,
  locale: "es" | "en"
): string {
  if (value == null) return "";
  const labelFor = (v: string) => {
    const o = q.options.find((opt) => opt.value === v);
    if (!o) return v;
    return locale === "en" ? o.label_en : o.label_es;
  };
  if (Array.isArray(value)) return value.map(labelFor).join(", ");
  return labelFor(value);
}
