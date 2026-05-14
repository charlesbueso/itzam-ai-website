/**
 * Source of truth for the AI Opportunity Assessment intake form.
 * 16 questions in 5 blocks, bilingual ES/EN. Admins can also append extra
 * custom questions per-questionnaire (see `is_custom` column on `questions`).
 *
 * When an admin creates a new questionnaire we deep-clone these into the
 * `questions` table so they can be edited per-client without affecting
 * the template.
 */

export type QuestionType = "text" | "single" | "multi";

export type BaseOption = {
  value: string;
  label_es: string;
  label_en: string;
};

export type BaseQuestion = {
  position: number;
  block_es: string;
  block_en: string;
  type: QuestionType;
  label_es: string;
  label_en: string;
  required: boolean;
  options: BaseOption[];
  multiline?: boolean;
};

const BLOCK = {
  company: { es: "Tu empresa", en: "Your company" },
  ops: { es: "Tu operación de ventas", en: "Your sales operation" },
  tech: { es: "Herramientas y tecnología", en: "Tools & tech" },
  ai: { es: "IA y automatización", en: "AI & automation" },
  context: { es: "Contexto de decisión", en: "Decision context" },
};

export const BASE_QUESTIONS: BaseQuestion[] = [
  {
    position: 1,
    block_es: BLOCK.company.es,
    block_en: BLOCK.company.en,
    type: "text",
    label_es: "¿Cuál es el nombre de tu empresa y a qué se dedica?",
    label_en: "What's your company's name and what does it do?",
    required: true,
    options: [],
    multiline: true,
  },
  {
    position: 2,
    block_es: BLOCK.company.es,
    block_en: BLOCK.company.en,
    type: "single",
    label_es: "¿Cuántas personas tiene tu empresa en total?",
    label_en: "How many people does your company have in total?",
    required: true,
    options: [
      { value: "1-20", label_es: "1–20", label_en: "1–20" },
      { value: "21-50", label_es: "21–50", label_en: "21–50" },
      { value: "51-200", label_es: "51–200", label_en: "51–200" },
      { value: "201-500", label_es: "201–500", label_en: "201–500" },
      { value: "500+", label_es: "+500", label_en: "500+" },
    ],
  },
  {
    position: 3,
    block_es: BLOCK.company.es,
    block_en: BLOCK.company.en,
    type: "single",
    label_es: "¿En qué industria opera tu empresa?",
    label_en: "What industry does your company operate in?",
    required: true,
    options: [
      { value: "it_resellers", label_es: "IT Resellers / Canal Tech", label_en: "IT Resellers / Tech Channel" },
      { value: "distribution_logistics", label_es: "Distribución y Logística", label_en: "Distribution & Logistics" },
      { value: "financial_services", label_es: "Servicios Financieros", label_en: "Financial Services" },
      { value: "manufacturing", label_es: "Manufactura", label_en: "Manufacturing" },
      { value: "professional_services", label_es: "Servicios Profesionales", label_en: "Professional Services" },
      { value: "healthcare", label_es: "Salud", label_en: "Healthcare" },
      { value: "other", label_es: "Otro", label_en: "Other" },
    ],
  },
  {
    position: 4,
    block_es: BLOCK.company.es,
    block_en: BLOCK.company.en,
    type: "text",
    label_es:
      "¿Cuántas personas tiene tu equipo de ventas, incluyendo SDRs, ejecutivos y managers?",
    label_en:
      "How many people are on your sales team, including SDRs, AEs and managers?",
    required: true,
    options: [],
  },
  {
    position: 5,
    block_es: BLOCK.ops.es,
    block_en: BLOCK.ops.en,
    type: "text",
    label_es:
      "¿Cómo describirías tu proceso de ventas hoy? ¿Tienes etapas definidas o es más informal?",
    label_en:
      "How would you describe your current sales process? Defined stages or more informal?",
    required: true,
    options: [],
    multiline: true,
  },
  {
    position: 6,
    block_es: BLOCK.ops.es,
    block_en: BLOCK.ops.en,
    type: "text",
    label_es:
      "¿Cuál es tu ciclo de venta promedio — desde que identificas un prospecto hasta que cierras?",
    label_en:
      "What's your average sales cycle — from prospect identification to close?",
    required: true,
    options: [],
  },
  {
    position: 7,
    block_es: BLOCK.ops.es,
    block_en: BLOCK.ops.en,
    type: "text",
    label_es:
      "¿Cuáles son los 2–3 cuellos de botella más grandes en tu proceso de ventas hoy?",
    label_en:
      "What are the 2–3 biggest bottlenecks in your sales process today?",
    required: true,
    options: [],
    multiline: true,
  },
  {
    position: 8,
    block_es: BLOCK.ops.es,
    block_en: BLOCK.ops.en,
    type: "single",
    label_es:
      "¿Tu equipo maneja propuestas, cotizaciones o respuestas a RFPs? ¿Con qué frecuencia?",
    label_en:
      "Does your team handle proposals, quotes or RFP responses? How often?",
    required: true,
    options: [
      { value: "never", label_es: "Nunca", label_en: "Never" },
      { value: "occasionally", label_es: "Ocasionalmente", label_en: "Occasionally" },
      { value: "frequently", label_es: "Frecuentemente", label_en: "Frequently" },
      { value: "core", label_es: "Es parte central del trabajo", label_en: "It's core to the work" },
    ],
  },
  {
    position: 9,
    block_es: BLOCK.tech.es,
    block_en: BLOCK.tech.en,
    type: "multi",
    label_es: "¿Qué herramientas usa tu equipo de ventas hoy?",
    label_en: "What tools does your sales team use today?",
    required: true,
    options: [
      { value: "crm", label_es: "CRM", label_en: "CRM" },
      { value: "email", label_es: "Email", label_en: "Email" },
      { value: "sheets", label_es: "Excel o Sheets", label_en: "Excel or Sheets" },
      { value: "whatsapp", label_es: "WhatsApp", label_en: "WhatsApp" },
      { value: "whatsapp_business", label_es: "WhatsApp Business", label_en: "WhatsApp Business" },
      { value: "linkedin", label_es: "LinkedIn", label_en: "LinkedIn" },
      { value: "other", label_es: "Otras", label_en: "Other" },
    ],
  },
  {
    position: 10,
    block_es: BLOCK.tech.es,
    block_en: BLOCK.tech.en,
    type: "text",
    label_es: "¿Tienes algún CRM activo? ¿Cuál y qué tan bien lo usa el equipo?",
    label_en: "Do you have an active CRM? Which one and how well does the team use it?",
    required: true,
    options: [],
    multiline: true,
  },
  {
    position: 11,
    block_es: BLOCK.tech.es,
    block_en: BLOCK.tech.en,
    type: "text",
    label_es:
      "¿Hay procesos que hoy se hacen manualmente y que sientes que deberían estar automatizados?",
    label_en:
      "Are there processes done manually today that you feel should be automated?",
    required: true,
    options: [],
    multiline: true,
  },
  {
    position: 12,
    block_es: BLOCK.ai.es,
    block_en: BLOCK.ai.en,
    type: "text",
    label_es: "¿Tu empresa ha intentado usar IA o automatización antes? ¿Qué pasó?",
    label_en: "Has your company tried AI or automation before? What happened?",
    required: true,
    options: [],
    multiline: true,
  },
  {
    position: 13,
    block_es: BLOCK.ai.es,
    block_en: BLOCK.ai.en,
    type: "single",
    label_es: "¿Qué tanto conocimiento tiene tu equipo sobre herramientas de IA?",
    label_en: "How much does your team know about AI tools?",
    required: true,
    options: [
      { value: "none", label_es: "Ninguno", label_en: "None" },
      { value: "basic", label_es: "Básico — conocen ChatGPT", label_en: "Basic — they know ChatGPT" },
      { value: "intermediate", label_es: "Intermedio — usan herramientas regularmente", label_en: "Intermediate — use tools regularly" },
      { value: "advanced", label_es: "Avanzado — ya implementaron soluciones", label_en: "Advanced — already shipped solutions" },
    ],
  },
  {
    position: 14,
    block_es: BLOCK.context.es,
    block_en: BLOCK.context.en,
    type: "text",
    label_es: "¿Qué te llevó a buscar ayuda con IA ahora? ¿Hubo algo específico que lo detonó?",
    label_en: "What led you to seek AI help now? Was there a specific trigger?",
    required: true,
    options: [],
    multiline: true,
  },
  {
    position: 15,
    block_es: BLOCK.context.es,
    block_en: BLOCK.context.en,
    type: "text",
    label_es: "¿Quién más en tu empresa estaría involucrado en esta decisión?",
    label_en: "Who else in your company would be involved in this decision?",
    required: true,
    options: [],
  },
  {
    position: 16,
    block_es: BLOCK.context.es,
    block_en: BLOCK.context.en,
    type: "text",
    label_es:
      "¿Qué resultado concreto esperarías ver en los próximos 90 días si esto funciona bien?",
    label_en:
      "What concrete outcome would you expect in the next 90 days if this works well?",
    required: true,
    options: [],
    multiline: true,
  },
];
