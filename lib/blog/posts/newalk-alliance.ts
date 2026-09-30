import type { Post } from "../types";

/**
 * Alliance announcement + AI security explainer. Source: the joint portfolio
 * (Itzam × Newalk AI, v2 working doc). Public-safe on purpose: no revenue
 * split, account model or internal product pricing.
 */
export const newalkAlliance: Post = {
  id: "newalk-alliance",
  category: "news",
  published: "2026-09-30",
  author: "ceo",
  translations: {
    es: {
      slug: "ia-en-produccion-bajo-control-alianza-newalk",
      title: "IA en producción y bajo control: nuestra alianza con Newalk AI",
      description:
        "Itzam.ai y Newalk AI se alían para llevar la IA a producción con gobierno y seguridad: datos listos para IA, conocimiento consultable y visibilidad sobre el uso de IA.",
      excerpt:
        "La IA ya está dentro de tu empresa, la hayas aprobado o no. Nos aliamos con Newalk AI para que llegue a producción con ingeniería sólida y bajo control: datos, conocimiento y seguridad en una sola ruta.",
      body: [
        { type: "h2", text: "El problema: IA que nadie ve" },
        {
          type: "p",
          text: "Tu equipo ya usa herramientas de IA para redactar correos, resumir contratos o analizar datos de clientes, muchas veces sin una política de uso: qué información se puede compartir, con qué herramientas y bajo qué reglas. A eso se le llama **shadow AI**, y es el punto ciego de muchas áreas de riesgo.",
        },
        {
          type: "p",
          text: "Además, cada agente o asistente que llega a producción abre preguntas nuevas: ¿quién ve qué información?, ¿qué pasa si alguien intenta manipular al agente?, ¿cómo se le reporta a la dirección?",
        },
        { type: "h2", text: "Dos especialidades, una sola ruta" },
        {
          type: "p",
          text: "Itzam aporta la ingeniería: datos, agentes e implementación. [Newalk AI](https://newalk.ai/es/) aporta el gobierno, la seguridad y la relación con las áreas de riesgo. Juntos cubrimos tres pasos:",
        },
        {
          type: "ol",
          items: [
            "**Datos listos para IA.** Inventario, limpieza, migración y preparación de tu información, con clasificación, retención y accesos definidos.",
            "**Conocimiento en operación.** Un asistente con el conocimiento de tu empresa, con cada respuesta citada a su fuente y permisos por rol: cada usuario ve sólo lo que le corresponde. Es la base de nuestro [Business Brain Lab](/es/services#service-4).",
            "**Uso de IA visible y bajo control.** Inventario de herramientas de IA, detección de uso no autorizado, una política de uso escrita y comunicada, y guardrails y trazabilidad en cada agente que construimos.",
          ],
        },
        {
          type: "p",
          text: "Cada paso se contrata por separado. Juntos llevan a una empresa de datos dispersos a IA en producción, con control.",
        },
        { type: "h2", text: "Seguridad de IA no es sólo antivirus" },
        {
          type: "p",
          text: "Un antivirus o EDR cuida los equipos. La seguridad de IA cuida cómo se usa la IA: qué información sale, qué instrucciones recibe un agente y qué hace con ellas. Por eso cada asistente o agente que desplegamos llega con guardrails y trazabilidad integrados.",
        },
        {
          type: "p",
          text: "Para empresas con área de TI o SOC propio, la telemetría de IA se puede integrar a su operación de seguridad: detección de inyección de prompts y de fuga de datos, y pruebas adversariales antes de pasar cada agente a producción.",
        },
        { type: "h2", text: "Por dónde empezar" },
        {
          type: "p",
          text: "Nuestro [diagnóstico de IA gratis](/es/assessment) te dice dónde está el mayor impacto en tu operación comercial. Y cuando encontramos IA en uso sin política ni control, trabajamos con Newalk AI para cerrar esa brecha.",
        },
        { type: "cta", variant: "assessment" },
      ],
    },
    en: {
      slug: "ai-in-production-under-control-newalk-alliance",
      title: "AI in production, under control: our alliance with Newalk AI",
      description:
        "Itzam.ai and Newalk AI join forces to take AI to production with governance and security: AI-ready data, searchable company knowledge and visibility over how AI is used.",
      excerpt:
        "AI is already inside your company, whether you approved it or not. We've partnered with Newalk AI so it reaches production with solid engineering and under control: data, knowledge and security on a single route.",
      body: [
        { type: "h2", text: "The problem: AI nobody sees" },
        {
          type: "p",
          text: "Your team already uses AI tools to draft emails, summarize contracts or analyze customer data, often without a usage policy: what information can be shared, with which tools and under which rules. That's called **shadow AI**, and it's a blind spot for many risk teams.",
        },
        {
          type: "p",
          text: "On top of that, every agent or assistant that reaches production raises new questions: who sees what information? What happens if someone tries to manipulate the agent? How is it reported to leadership?",
        },
        { type: "h2", text: "Two specialties, one route" },
        {
          type: "p",
          text: "Itzam brings the engineering: data, agents and implementation. [Newalk AI](https://newalk.ai/) brings governance, security and the relationship with risk teams. Together we cover three steps:",
        },
        {
          type: "ol",
          items: [
            "**AI-ready data.** Inventory, cleanup, migration and preparation of your information, with classification, retention and access defined.",
            "**Knowledge in operation.** An assistant with your company's knowledge, every answer cited to its source and role-based permissions: each user only sees what they should. It's the foundation of our [Business Brain Lab](/en/services#service-4).",
            "**AI use that is visible and under control.** An inventory of AI tools, detection of unauthorized use, a written and communicated usage policy, and guardrails and traceability in every agent we build.",
          ],
        },
        {
          type: "p",
          text: "Each step can be engaged on its own. Together they take a company from scattered data to AI in production, under control.",
        },
        { type: "h2", text: "AI security isn't just antivirus" },
        {
          type: "p",
          text: "Antivirus and EDR protect devices. AI security covers how AI is used: what information leaves, what instructions an agent receives and what it does with them. That's why every assistant or agent we deploy ships with guardrails and traceability built in.",
        },
        {
          type: "p",
          text: "For companies with their own IT team or SOC, AI telemetry can feed into their security operations: prompt-injection and data-leak detection, and adversarial testing before any agent goes to production.",
        },
        { type: "h2", text: "Where to start" },
        {
          type: "p",
          text: "Our [free AI Assessment](/en/assessment) shows where AI has the biggest impact in your commercial operation. And when we find AI in use without policy or control, we work with Newalk AI to close that gap.",
        },
        { type: "cta", variant: "assessment" },
      ],
    },
  },
};
