import { NextResponse } from "next/server";
import { renderReportPdf, type ReportPdfData } from "@/lib/assessment/pdf";
import { renderReportDocx } from "@/lib/assessment/docx";
import type { ReportContent } from "@/lib/assessment/report";
import type { ScoreResult } from "@/lib/assessment/scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * Dev-only report preview. Renders the template with sample content so the team
 * can iterate on the layout without spending model tokens. Returns 404 in
 * production. Query: ?locale=en, ?format=docx.
 */
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const params = new URL(req.url).searchParams;
  const locale = params.get("locale") === "en" ? "en" : "es";
  const wantDocx = params.get("format") === "docx";

  const score: ScoreResult = {
    score: 63,
    band: "building",
    dimensions: [
      { key: "response_speed", value: 6 },
      { key: "documented_process", value: 55 },
      { key: "proposals", value: 57 },
      { key: "ai_maturity", value: 80 },
      { key: "data_crm", value: 82 },
    ],
  };

  const content: ReportContent = locale === "en" ? SAMPLE_EN : SAMPLE_ES;

  const data: ReportPdfData = {
    meta: {
      fullName: "Ricardo Méndez",
      role: locale === "en" ? "Commercial Director" : "Director Comercial",
      company: "Nova Redes",
      industry: locale === "en" ? "IT Reseller / Tech Channel" : "IT Reseller / Canal Tech",
      dateStr: locale === "en" ? "July 17, 2026" : "17 de julio, 2026",
    },
    locale,
    score,
    content,
  };

  if (wantDocx) {
    const docx = await renderReportDocx(data);
    return new NextResponse(new Uint8Array(docx), {
      status: 200,
      headers: {
        "Content-Type": DOCX_MIME,
        "Content-Disposition": 'attachment; filename="assessment-preview.docx"',
      },
    });
  }

  const pdf = await renderReportPdf(data);
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="assessment-preview.pdf"',
    },
  });
}

const SAMPLE_ES: ReportContent = {
  subtitle:
    "Dónde la inteligencia artificial puede generar el mayor impacto en tu operación comercial",
  exec_intro: [
    "Ricardo, en Nova Redes ya tienen una base sólida: HubSpot como CRM, WhatsApp Business como canal, y un equipo de 6 a 15 personas distribuido entre Account Executives, Account Managers y Customer Success. Esa base es más de lo que tienen la mayoría de las empresas que evaluamos, y significa que no partimos de cero, sino de una operación que necesita afinarse.",
    "El diagnóstico muestra algo claro: el cuello de botella no es falta de leads ni falta de herramientas, es velocidad de respuesta y consistencia en el seguimiento. Tus prospectos llegan por canal y partners y por prospección activa, pero cuando escriben, la respuesta tarda días. Ese desfase, sumado a un playbook parcialmente documentado, es exactamente donde la IA puede generar el retorno más rápido para tu equipo.",
  ],
  score_blurb:
    "Un puntaje de 63 sobre 100 en la banda en progreso significa que Nova Redes tiene los cimientos correctos pero los procesos alrededor de ese stack aún dependen demasiado de la memoria y disponibilidad de las personas. Es una posición favorable: no hay que reconstruir nada, hay que conectar y automatizar lo que ya existe.",
  cost_callout:
    "Responder en días en lugar de minutos a un prospecto que escribe por WhatsApp o web probablemente ya te está costando deals frente a competidores más rápidos, sobre todo en un ciclo de venta de 1 a 3 meses donde la primera impresión define si el prospecto sigue conversando o se va con otro proveedor. A esto se suma que el conocimiento disperso obliga a tu equipo a reconstruir información y objeciones cada vez.",
  findings: [
    { title: "El seguimiento a prospectos es tu bloqueo principal y se refleja directo en el score.", body: "Marcaste el seguimiento como tu mayor cuello de botella, y la dimensión de velocidad de respuesta obtuvo 6 sobre 100, la más baja de todo el diagnóstico, confirmando que los prospectos esperan días para recibir respuesta." },
    { title: "El conocimiento disperso está frenando el onboarding y la consistencia comercial.", body: "Señalaste el conocimiento disperso como segundo cuello de botella y tu playbook está parcialmente documentado, lo que obliga a cada Account Executive a improvisar en vez de seguir un proceso probado." },
    { title: "Tienen la infraestructura pero la están usando por debajo de su potencial.", body: "Usan HubSpot y WhatsApp Business y ya intentaron un proyecto estructurado de IA, pero aprovechan el CRM bien, no a su potencial: la tecnología no es el problema, sino la automatización de los procesos que corren sobre ella." },
  ],
  dimensions: {
    data_crm: { status: "A ordenar", observation: "Tienen HubSpot, pero desordenado y subutilizado.", cost: "reportes poco confiables y automatizaciones que no despegan porque los datos no están limpios. Es la base sobre la que se construye todo lo demás." },
    documented_process: { status: "Sin sistematizar", observation: "El proceso existe pero está parcialmente documentado.", cost: "onboarding lento, resultados inconsistentes y conocimiento que se va con cada persona." },
    proposals: { status: "Alto potencial", observation: "Se elaboran manualmente desde cero.", cost: "horas por deal y cierres que se retrasan. Es el proceso con mayor retorno inmediato al automatizarse: de horas a minutos." },
    response_speed: { status: "A mejorar", observation: "Responden en horas o al día siguiente.", cost: "en un canal competitivo, el primero en responder suele ganar el deal — y en LatAm el cliente espera respuesta casi inmediata por WhatsApp." },
    ai_maturity: { status: "En marcha", observation: "Ya usan IA de forma informal (ChatGPT).", cost: "el siguiente paso es pasar de uso ad-hoc a procesos con IA integrada que rindan de forma consistente." },
  },
  opportunities: [
    { title: "1. Automatizar propuestas, cotizaciones y RFPs", problem: "cada propuesta se arma desde cero. Con un ciclo de 1–3 meses, esas horas retrasan cada deal y saturan a tus mejores vendedores.", ai_can_do: "generar borradores de propuestas y respuestas a RFP en minutos, a partir de tu catálogo, precios y casos previos — listos para que el vendedor solo revise y personalice.", impact: "reducir el tiempo por propuesta de horas a minutos y acelerar el ciclo de cierre.", solution: "Sales Playbook + RFP Generator" },
    { title: "2. Automatizar el seguimiento a prospectos", problem: "el seguimiento es manual y depende de que el vendedor lo recuerde. Es donde más deals se enfrían.", ai_can_do: "secuencias de nurturing personalizadas por email y WhatsApp que mantienen vivo cada prospecto automáticamente, con escalación al vendedor en el momento correcto.", impact: "menos deals perdidos por olvido y un pipeline que avanza solo.", solution: "Automatización de seguimiento" },
    { title: "3. Centralizar el conocimiento y activar tu HubSpot", problem: "el know-how vive en la cabeza de cada vendedor y tu CRM está subutilizado.", ai_can_do: "un Company AI Brain que centraliza productos, precios, objeciones y procesos, disponible 24/7 — sobre una base de HubSpot ordenada.", impact: "onboarding más rápido, conocimiento que no se pierde y datos limpios que potencian todo lo demás.", solution: "Company AI Brain" },
  ],
  quick_wins: [
    "Generador de propuestas y RFP con IA",
    "Ordenar y estructurar HubSpot",
    "Plantillas de seguimiento automatizadas",
  ],
  strategic_projects: [
    "Sales Playbook documentado",
    "Company AI Brain para el equipo",
    "Nurturing multicanal (email + WhatsApp)",
  ],
};

/** Same sample lead, written in English — so the EN template can be proofread. */
const SAMPLE_EN: ReportContent = {
  subtitle: "Where AI can generate the greatest impact in your commercial operation",
  exec_intro: [
    "Ricardo, Nova Redes already has a solid base: HubSpot as the CRM, WhatsApp Business as a channel, and a team of 6 to 15 people split between Account Executives, Account Managers and Customer Success. That base is more than most of the companies we assess have, and it means we are not starting from zero — we are starting from an operation that needs tuning.",
    "The diagnostic shows one thing clearly: the bottleneck is not a lack of leads or a lack of tools, it is response speed and consistency in follow-up. Your prospects arrive through channel partners and active prospecting, but when they write, the answer takes days. That gap, on top of a partially documented playbook, is exactly where AI can deliver the fastest return for your team.",
  ],
  score_blurb:
    "A score of 63 out of 100 in the building band means Nova Redes has the right foundations, but the processes around that stack still depend too much on people's memory and availability. It is a favourable position: nothing has to be rebuilt, it has to be connected and automated.",
  cost_callout:
    "Answering in days instead of minutes when a prospect writes on WhatsApp or the website is most likely already costing you deals against faster competitors — especially in a 1-to-3-month sales cycle where the first impression decides whether the prospect keeps talking or walks to another provider. On top of that, scattered knowledge forces your team to rebuild information and objections every single time.",
  findings: [
    { title: "Prospect follow-up is your main blocker, and it shows directly in the score.", body: "You flagged follow-up as your biggest bottleneck, and the response-speed dimension scored 6 out of 100 — the lowest in the whole diagnostic — confirming that prospects wait days for a reply." },
    { title: "Scattered knowledge is slowing down onboarding and commercial consistency.", body: "You pointed to scattered knowledge as your second bottleneck, and your playbook is only partially documented, which forces every Account Executive to improvise instead of following a proven process." },
    { title: "You have the infrastructure, but you are using it below its potential.", body: "You use HubSpot and WhatsApp Business and have already tried a structured AI project, but the CRM is used well rather than to its potential: technology is not the problem — automating the processes that run on top of it is." },
  ],
  dimensions: {
    data_crm: { status: "Needs cleanup", observation: "You have HubSpot, but it is disorganised and underused.", cost: "unreliable reporting and automations that never take off because the data is not clean. It is the base everything else is built on." },
    documented_process: { status: "Not systematised", observation: "The process exists but is only partially documented.", cost: "slow onboarding, inconsistent results, and knowledge that walks out with every person who leaves." },
    proposals: { status: "High potential", observation: "They are written manually from scratch.", cost: "hours per deal and delayed closes. It is the process with the highest immediate return once automated: from hours to minutes." },
    response_speed: { status: "Needs work", observation: "You reply within hours or the next day.", cost: "in a competitive channel the first to reply usually wins the deal — and in LatAm the client expects a near-instant answer on WhatsApp." },
    ai_maturity: { status: "Under way", observation: "You already use AI informally (ChatGPT).", cost: "the next step is moving from ad-hoc use to processes with AI built in that perform consistently." },
  },
  opportunities: [
    { title: "1. Automate proposals, quotes and RFPs", problem: "every proposal is built from scratch. With a 1–3 month cycle, those hours delay every deal and saturate your best salespeople.", ai_can_do: "generate proposal drafts and RFP answers in minutes from your catalogue, pricing and past cases — ready for the rep to review and personalise.", impact: "cut the time per proposal from hours to minutes and speed up the closing cycle.", solution: "Sales Playbook + RFP Generator" },
    { title: "2. Automate prospect follow-up", problem: "follow-up is manual and depends on the rep remembering it. It is where most deals go cold.", ai_can_do: "personalised nurturing sequences over email and WhatsApp that keep every prospect alive automatically, escalating to the rep at the right moment.", impact: "fewer deals lost to forgetfulness and a pipeline that moves on its own.", solution: "Follow-up automation" },
    { title: "3. Centralise knowledge and activate your HubSpot", problem: "the know-how lives in each salesperson's head and your CRM is underused.", ai_can_do: "a Company AI Brain that centralises products, pricing, objections and processes, available 24/7 — on top of a tidy HubSpot base.", impact: "faster onboarding, knowledge that is never lost, and clean data that powers everything else.", solution: "Company AI Brain" },
  ],
  quick_wins: [
    "AI proposal and RFP generator",
    "Clean up and structure HubSpot",
    "Automated follow-up templates",
  ],
  strategic_projects: [
    "Documented Sales Playbook",
    "Company AI Brain for the team",
    "Multichannel nurturing (email + WhatsApp)",
  ],
};
