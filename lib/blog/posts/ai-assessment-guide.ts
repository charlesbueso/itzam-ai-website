import type { Post } from "../types";

/** Free self-serve assessment vs. the paid 2-week AI Opportunity Assessment. Facts from lib/assessment + the services copy. */
export const aiAssessmentGuide: Post = {
  id: "ai-assessment-guide",
  category: "guide",
  published: "2026-09-29",
  author: "ceo",
  translations: {
    es: {
      slug: "diagnostico-ia-equipos-de-ventas",
      title: "Diagnóstico de IA para equipos de ventas: versión gratis vs. AI Opportunity Assessment",
      description:
        "Dos formas de saber dónde la IA tiene más impacto en tu área comercial: un score gratis en minutos o un assessment de 2 semanas con un plan de 3–5 oportunidades priorizadas.",
      excerpt:
        "Antes de comprar herramientas de IA, conviene saber dónde está el impacto real en tu operación comercial. Ofrecemos dos formas de averiguarlo: una gratis en minutos y una a fondo en dos semanas.",
      body: [
        { type: "h2", text: "La versión gratis: tu AI Sales Readiness Score en minutos" },
        {
          type: "ul",
          items: [
            "**14 preguntas rápidas**, casi todas de opción múltiple, sobre tu empresa, tu escala, tus herramientas, tu proceso y tu punto de partida con IA.",
            "**Score de 0 a 100 al instante**, desglosado en cinco dimensiones: datos y CRM, proceso de ventas documentado, propuestas y cotizaciones, velocidad de respuesta y madurez en IA.",
            "**Diagnóstico personalizado por correo** en menos de un día hábil, con tus mayores oportunidades de automatización y un plan para arrancar, revisado por nuestro equipo.",
          ],
        },
        {
          type: "table",
          head: ["Score", "Nivel", "Qué significa"],
          rows: [
            ["0–30", "Manual / Punto de partida", "Casi todo depende del esfuerzo humano; hay oportunidades grandes listas para capturar."],
            ["31–50", "En marcha", "Ya hay bases, pero aún no operan juntas."],
            ["51–70", "Tomando impulso", "Varias piezas funcionan; la IA sirve para conectarlas y escalarlas."],
            ["71–100", "Listo para IA", "Vas adelante del promedio; el foco es afinar y no perder ventaja."],
          ],
        },
        { type: "h2", text: "El AI Opportunity Assessment: dos semanas, un plan accionable" },
        {
          type: "p",
          text: "Es un proyecto de dos semanas con nuestro equipo para identificar, priorizar y cuantificar oportunidades de IA en toda tu operación comercial. Así funciona:",
        },
        {
          type: "ol",
          items: [
            "**Intake:** un cuestionario de 16 preguntas en 5 bloques (tu empresa, tu operación de ventas, herramientas y tecnología, IA y automatización, contexto de decisión). Varias personas de tu equipo pueden responder en conjunto.",
            "**Llamada de contexto** con tu equipo para entender cómo se vende hoy.",
            "**Mapa de tu proceso comercial actual.**",
            "**Mapa de oportunidades de IA:** 3–5 áreas priorizadas, separadas en quick wins y proyectos estratégicos, con herramientas recomendadas, tiempos y costos estimados por iniciativa.",
            "**Revisión de un CTO senior** y un chequeo de factibilidad realista de cada solución propuesta.",
          ],
        },
        {
          type: "p",
          text: "El entregable es un **reporte de 10–12 páginas con resumen ejecutivo** que puedes llevar a tu dirección para decidir presupuesto.",
        },
        {
          type: "table",
          head: ["", "Gratis", "AI Opportunity Assessment"],
          rows: [
            ["Duración", "Minutos", "2 semanas"],
            ["Formato", "Autoservicio", "Con nuestro equipo"],
            ["Resultado", "Score + diagnóstico por correo", "Reporte de 10–12 páginas + plan"],
            ["Oportunidades", "Las principales", "3–5 priorizadas, con tiempos y costos"],
            ["Ideal para", "Explorar dónde estás", "Decidir en qué invertir"],
          ],
        },
        { type: "h2", text: "¿Cuál te conviene?" },
        {
          type: "p",
          text: "Si estás explorando, empieza por el [diagnóstico gratis](/es/assessment): en pocos minutos sabrás dónde estás y qué atacar primero. Si ya sabes que la IA importa y necesitas un plan creíble antes de comprometer presupuesto, el [AI Opportunity Assessment](/es/services#service-1) de dos semanas es el siguiente paso.",
        },
        { type: "cta", variant: "assessment" },
      ],
    },
    en: {
      slug: "ai-assessment-for-sales-teams",
      title: "AI assessment for sales teams: the free version vs. the AI Opportunity Assessment",
      description:
        "Two ways to find where AI has the most impact in your sales operation: a free score in minutes, or a 2-week assessment with a plan of 3–5 prioritized opportunities.",
      excerpt:
        "Before buying AI tools, it pays to know where the real impact is in your commercial operation. We offer two ways to find out: a free one in minutes and an in-depth one in two weeks.",
      body: [
        { type: "h2", text: "The free version: your AI Sales Readiness Score in minutes" },
        {
          type: "ul",
          items: [
            "**14 quick questions**, mostly multiple choice, about your company, scale, tools, process and where you stand with AI.",
            "**A 0–100 score instantly**, broken down into five dimensions: data & CRM, documented sales process, proposals & quotes, response speed and AI maturity.",
            "**A personalized diagnostic by email** within one business day, with your top automation opportunities and a starting plan, reviewed by our team.",
          ],
        },
        {
          type: "table",
          head: ["Score", "Level", "What it means"],
          rows: [
            ["0–30", "Manual / Starting point", "Almost everything depends on human effort; big opportunities are ready to capture."],
            ["31–50", "In motion", "The foundations exist, but they don't run together yet."],
            ["51–70", "Building momentum", "Several pieces work; AI connects and scales them."],
            ["71–100", "AI-ready", "You're ahead of the pack; the focus is sharpening and keeping your edge."],
          ],
        },
        { type: "h2", text: "The AI Opportunity Assessment: two weeks, an actionable plan" },
        {
          type: "p",
          text: "It's a two-week engagement with our team to identify, prioritize and quantify AI opportunities across your commercial operation. Here's how it works:",
        },
        {
          type: "ol",
          items: [
            "**Intake:** a 16-question questionnaire in 5 blocks (your company, your sales operation, tools & tech, AI & automation, decision context). Several people on your team can answer it together.",
            "**A context call** with your team to understand how you sell today.",
            "**A map of your current commercial process.**",
            "**An AI Opportunity Map:** 3–5 prioritized areas, split into quick wins and strategic projects, with recommended tools, timelines and estimated costs per initiative.",
            "**Senior CTO review** and a realistic feasibility check of every proposed solution.",
          ],
        },
        {
          type: "p",
          text: "The deliverable is a **10–12 page report with an executive summary** you can take to leadership to decide on budget.",
        },
        {
          type: "table",
          head: ["", "Free", "AI Opportunity Assessment"],
          rows: [
            ["Duration", "Minutes", "2 weeks"],
            ["Format", "Self-serve", "With our team"],
            ["Outcome", "Score + emailed diagnostic", "10–12 page report + plan"],
            ["Opportunities", "The main ones", "3–5 prioritized, with timelines and costs"],
            ["Best for", "Exploring where you stand", "Deciding what to invest in"],
          ],
        },
        { type: "h2", text: "Which one is right for you?" },
        {
          type: "p",
          text: "If you're exploring, start with the [free assessment](/en/assessment): in a few minutes you'll know where you stand and what to tackle first. If you already know AI matters and need a credible plan before committing budget, the two-week [AI Opportunity Assessment](/en/services#service-1) is the next step.",
        },
        { type: "cta", variant: "assessment" },
      ],
    },
  },
};
