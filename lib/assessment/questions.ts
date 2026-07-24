/**
 * Source of truth for the self-serve Free AI Assessment (marketing site).
 *
 * Distinct from `lib/intake/baseQuestions.ts` (the paid, admin-issued intake):
 * this one is anonymous, low-friction (mostly clickable options), scored
 * deterministically on submit, and feeds the Claude-generated instant report.
 *
 * Shared between client (form rendering) and server (validation, scoring,
 * report prompt) — keep it free of server-only imports.
 */

export type SelfQuestionType = "single" | "multi";

export type SelfOption = {
  value: string;
  label_es: string;
  label_en: string;
};

export type SelfQuestion = {
  /** Stable key — used as the answers-object key and DB column path. */
  key: string;
  type: SelfQuestionType;
  /** Section the question renders under (index into dictionary sections). */
  section: "company" | "tools" | "process";
  label_es: string;
  label_en: string;
  hint_es?: string;
  hint_en?: string;
  required: boolean;
  options: SelfOption[];
  /** When this option is selected, show a free-text "which?" input. */
  otherValue?: string;
};

const BOTTLENECK_OPTIONS: SelfOption[] = [
  { value: "leadgen", label_es: "Generar y calificar leads", label_en: "Generating and qualifying leads" },
  { value: "followup", label_es: "Dar seguimiento a prospectos", label_en: "Following up with prospects" },
  { value: "proposals", label_es: "Propuestas, cotizaciones y RFPs", label_en: "Proposals, quotes and RFPs" },
  { value: "support", label_es: "Responder a clientes a tiempo", label_en: "Responding to customers on time" },
  { value: "knowledge", label_es: "Conocimiento disperso / onboarding", label_en: "Scattered knowledge / onboarding" },
  { value: "reporting", label_es: "Pipeline, reportes y admin", label_en: "Pipeline, reporting and admin" },
];

export const SELF_QUESTIONS: SelfQuestion[] = [
  {
    key: "industry",
    type: "single",
    section: "company",
    label_es: "¿En qué industria opera tu empresa?",
    label_en: "What industry does your company operate in?",
    required: true,
    otherValue: "other",
    options: [
      { value: "it_resellers", label_es: "IT Resellers / Canal Tech", label_en: "IT Resellers / Tech Channel" },
      { value: "professional_services", label_es: "Servicios Profesionales", label_en: "Professional Services" },
      { value: "distribution_manufacturing", label_es: "Distribución / Manufactura", label_en: "Distribution / Manufacturing" },
      { value: "financial", label_es: "Servicios Financieros / Fintech", label_en: "Financial Services / Fintech" },
      { value: "healthcare", label_es: "Salud", label_en: "Healthcare" },
      { value: "other", label_es: "Otra", label_en: "Other" },
    ],
  },
  {
    key: "employees",
    type: "single",
    section: "company",
    label_es: "¿Cuántos empleados tiene tu empresa?",
    label_en: "How many employees does your company have?",
    required: true,
    options: [
      { value: "5-20", label_es: "5–20", label_en: "5–20" },
      { value: "21-50", label_es: "21–50", label_en: "21–50" },
      { value: "51-150", label_es: "51–150", label_en: "51–150" },
      { value: "151-500", label_es: "151–500", label_en: "151–500" },
      { value: "500+", label_es: "Más de 500", label_en: "500+" },
    ],
  },
  {
    key: "sales_team",
    type: "single",
    section: "company",
    label_es: "¿Cuántas personas tiene tu equipo de ventas?",
    label_en: "How many people are on your sales team?",
    required: true,
    options: [
      { value: "1-5", label_es: "1–5", label_en: "1–5" },
      { value: "6-15", label_es: "6–15", label_en: "6–15" },
      { value: "16-30", label_es: "16–30", label_en: "16–30" },
      { value: "30+", label_es: "Más de 30", label_en: "30+" },
    ],
  },
  {
    key: "roles",
    type: "multi",
    section: "company",
    label_es: "¿Qué roles tienen en el equipo?",
    label_en: "What roles does the team have?",
    hint_es: "Elige los que apliquen",
    hint_en: "Pick all that apply",
    required: true,
    otherValue: "other",
    options: [
      { value: "sdr", label_es: "SDR / Prospección", label_en: "SDR / Prospecting" },
      { value: "ae", label_es: "Account Executive", label_en: "Account Executive" },
      { value: "am", label_es: "Account Manager", label_en: "Account Manager" },
      { value: "cs", label_es: "Customer Success", label_en: "Customer Success" },
      { value: "salesops", label_es: "Sales Ops", label_en: "Sales Ops" },
      { value: "general", label_es: "Solo vendedores generales", label_en: "General salespeople only" },
      { value: "other", label_es: "Otro", label_en: "Other" },
    ],
  },
  {
    key: "crm_tools",
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
      { value: "zoho_monday", label_es: "Zoho / Monday", label_en: "Zoho / Monday" },
      { value: "whatsapp", label_es: "WhatsApp Business", label_en: "WhatsApp Business" },
      { value: "excel", label_es: "Excel / Sheets", label_en: "Excel / Sheets" },
      { value: "none", label_es: "Ninguno", label_en: "None" },
      { value: "other", label_es: "Otro", label_en: "Other" },
    ],
  },
  {
    key: "crm_usage",
    type: "single",
    section: "tools",
    label_es: "¿Qué tan bien aprovechan ese CRM / herramientas?",
    label_en: "How well do you leverage that CRM / those tools?",
    required: true,
    options: [
      { value: "none", label_es: "Casi no lo usamos", label_en: "We barely use it" },
      { value: "low", label_es: "Poco / desordenado", label_en: "A little / messy" },
      { value: "mid", label_es: "Bien, pero no a su potencial", label_en: "Well, but not to its potential" },
      { value: "high", label_es: "Lo aprovechamos muy bien", label_en: "We use it very well" },
    ],
  },
  {
    key: "lead_sources",
    type: "multi",
    section: "tools",
    label_es: "¿Cómo llegan sus leads hoy?",
    label_en: "How do your leads arrive today?",
    hint_es: "Elige los que apliquen",
    hint_en: "Pick all that apply",
    required: true,
    otherValue: "other",
    options: [
      { value: "outbound", label_es: "Prospección activa", label_en: "Active prospecting" },
      { value: "referral", label_es: "Referencias", label_en: "Referrals" },
      { value: "inbound", label_es: "Inbound (web/redes)", label_en: "Inbound (web/social)" },
      { value: "channel", label_es: "Canal / Partners", label_en: "Channel / Partners" },
      { value: "events", label_es: "Eventos", label_en: "Events" },
      { value: "other", label_es: "Otra fuente", label_en: "Other source" },
    ],
  },
  {
    key: "bottleneck_1",
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
    key: "bottleneck_2",
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
    key: "playbook",
    type: "single",
    section: "process",
    label_es: "¿Tienen documentado su proceso de ventas (playbook, guiones, objeciones)?",
    label_en: "Is your sales process documented (playbook, scripts, objections)?",
    required: true,
    options: [
      { value: "no", label_es: "No, está en la cabeza de cada vendedor", label_en: "No, it lives in each rep's head" },
      { value: "partial", label_es: "Parcialmente / desactualizado", label_en: "Partially / outdated" },
      { value: "yes", label_es: "Sí, documentado y en uso", label_en: "Yes, documented and in use" },
    ],
  },
  {
    key: "proposals",
    type: "single",
    section: "process",
    label_es: "¿Cómo elaboran propuestas y cotizaciones hoy?",
    label_en: "How do you build proposals and quotes today?",
    required: true,
    options: [
      { value: "manual", label_es: "Desde cero, cada vez (manual)", label_en: "From scratch, every time (manual)" },
      { value: "template", label_es: "Con plantillas que adaptamos", label_en: "With templates we adapt" },
      { value: "auto", label_es: "Con un sistema semi-automatizado", label_en: "With a semi-automated system" },
    ],
  },
  {
    key: "response_time",
    type: "single",
    section: "process",
    label_es: "Cuando un cliente escribe (WhatsApp / web / email), ¿en cuánto responden?",
    label_en: "When a customer writes (WhatsApp / web / email), how fast do you respond?",
    required: true,
    options: [
      { value: "week", label_es: "Días — dentro de la semana", label_en: "Days — within the week" },
      { value: "slow", label_es: "Horas o al día siguiente", label_en: "Hours or next day" },
      { value: "mid", label_es: "Menos de 1 hora en horario laboral", label_en: "Under 1 hour during business hours" },
      { value: "fast", label_es: "Casi inmediato, incluso fuera de horario", label_en: "Almost immediate, even after hours" },
    ],
  },
  {
    key: "cycle",
    type: "single",
    section: "process",
    label_es: "¿Cuánto tarda un deal típico del primer contacto al cierre?",
    label_en: "How long does a typical deal take from first contact to close?",
    required: true,
    options: [
      { value: "lt2w", label_es: "Menos de 2 semanas", label_en: "Under 2 weeks" },
      { value: "2-4w", label_es: "2–4 semanas", label_en: "2–4 weeks" },
      { value: "1-3m", label_es: "1–3 meses", label_en: "1–3 months" },
      { value: "3m+", label_es: "Más de 3 meses", label_en: "3+ months" },
    ],
  },
  {
    key: "ai_experience",
    type: "single",
    section: "process",
    label_es: "¿Han intentado usar IA o automatización en ventas antes?",
    label_en: "Have you tried AI or automation in sales before?",
    required: true,
    options: [
      { value: "never", label_es: "No, nunca", label_en: "No, never" },
      { value: "informal", label_es: "Sí, ChatGPT de forma informal", label_en: "Yes, ChatGPT informally" },
      { value: "structured", label_es: "Sí, un proyecto estructurado", label_en: "Yes, a structured project" },
      { value: "working", label_es: "Sí, ya tenemos algo funcionando", label_en: "Yes, we have something running" },
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
