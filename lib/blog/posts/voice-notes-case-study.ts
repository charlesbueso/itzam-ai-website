import type { Post } from "../types";

/**
 * Anonymized client: a Mexican practice with its own coaching methodology.
 * Handles sensitive (clinical) data — keep it anonymous: no names, domains or
 * product names; only aggregate counts.
 */
export const voiceNotesCaseStudy: Post = {
  id: "voice-notes-case-study",
  category: "case_study",
  published: "2026-09-29",
  author: "cto",
  translations: {
    es: {
      slug: "caso-ia-notas-de-voz-whatsapp",
      title: "Caso: IA que convierte notas de voz de WhatsApp en análisis listos para revisar",
      description:
        "Cómo construimos un sistema que transcribe y analiza notas de voz de WhatsApp para un consultorio en México, con un buscador con citas sobre casi 5,000 fragmentos de su propio material.",
      excerpt:
        "Un consultorio en México recibía por WhatsApp notas de voz de hasta quince minutos. Construimos un sistema que las transcribe, las analiza con su propia metodología y las vuelve consultables con citas.",
      body: [
        {
          type: "facts",
          items: [
            { label: "Cliente", value: "Consultorio en México con metodología propia (anónimo)" },
            { label: "Canal", value: "WhatsApp" },
            { label: "Servicios relacionados", value: "Customer Support Engine · Business Brain Lab" },
            { label: "Estado", value: "En producción" },
          ],
        },
        { type: "h2", text: "El reto" },
        {
          type: "p",
          text: "Las personas que acompaña el consultorio comparten su proceso en notas de voz por WhatsApp, a veces de quince minutos. Escucharlas, transcribirlas y analizarlas con la metodología del especialista era trabajo manual, y el historial de cada caso quedaba repartido entre chats y documentos.",
        },
        { type: "h2", text: "Lo que construimos" },
        {
          type: "ul",
          items: [
            "**Bot de WhatsApp** que recibe la nota de voz y la procesa en cuanto llega.",
            "**Transcripción en español de México** y dos análisis independientes: uno del contenido, con la metodología del consultorio, y otro de la voz y el lenguaje (prosodia).",
            "**Reportes en PDF** que se guardan solos en Google Drive, con el estado de cada caso en Google Sheets.",
            "**Dashboard privado con búsqueda semántica (RAG):** el especialista pregunta en lenguaje natural y recibe respuestas con citas que enlazan al documento original.",
          ],
        },
        {
          type: "stats",
          items: [
            { value: "~100", label: "expedientes en el registro" },
            { value: "270+", label: "documentos indexados" },
            { value: "~4,900", label: "fragmentos consultables con citas" },
            { value: "23", label: "prompts de la metodología, versionados" },
          ],
        },
        { type: "h2", text: "Decisiones que importan" },
        {
          type: "ul",
          items: [
            "**Humano en el circuito.** Los reportes no se envían automáticamente: van a Drive y el especialista los revisa antes de usarlos.",
            "**La metodología manda.** Los 23 prompts viven como documentos versionados con dependencias declaradas; ningún paso repite lo que otro ya validó.",
            "**El stack más simple que funciona.** A esta escala, búsqueda exacta en memoria en lugar de una base de datos vectorial: más rápida, más barata y sin infraestructura extra.",
            "**Datos sensibles, acceso restringido.** El dashboard requiere login y el material nunca se publica.",
            "**Costos a la vista y despliegue seguro.** El sistema estima el costo antes de correr un análisis completo, y cada actualización pasa un chequeo de 6 puntos que la revierte sola si algo falla.",
          ],
        },
        { type: "h2", text: "Qué significa para un equipo comercial" },
        {
          type: "p",
          text: "El mismo patrón —WhatsApp como canal, análisis con IA y un buscador con citas sobre el conocimiento de tu empresa— es la base de nuestro [Customer Support Engine](/es/services#service-3) y del [Business Brain Lab](/es/services#service-4). Si tu equipo vive en WhatsApp, empieza por el [diagnóstico de IA gratis](/es/assessment).",
        },
        { type: "cta", variant: "assessment" },
      ],
    },
    en: {
      slug: "case-study-ai-whatsapp-voice-notes",
      title: "Case study: AI that turns WhatsApp voice notes into review-ready analysis",
      description:
        "How we built a system that transcribes and analyzes WhatsApp voice notes for a practice in Mexico, with cited search over nearly 5,000 passages of its own material.",
      excerpt:
        "A practice in Mexico received WhatsApp voice notes up to fifteen minutes long. We built a system that transcribes them, analyzes them with the practice's own methodology and makes them searchable with citations.",
      body: [
        {
          type: "facts",
          items: [
            { label: "Client", value: "Practice in Mexico with its own methodology (anonymous)" },
            { label: "Channel", value: "WhatsApp" },
            { label: "Related services", value: "Customer Support Engine · Business Brain Lab" },
            { label: "Status", value: "In production" },
          ],
        },
        { type: "h2", text: "The challenge" },
        {
          type: "p",
          text: "The people the practice works with share their progress through WhatsApp voice notes, sometimes fifteen minutes long. Listening, transcribing and analyzing them with the specialist's methodology was manual work, and each case history was scattered across chats and documents.",
        },
        { type: "h2", text: "What we built" },
        {
          type: "ul",
          items: [
            "**A WhatsApp bot** that receives the voice note and processes it as soon as it arrives.",
            "**Transcription in Mexican Spanish** and two independent analyses: one of the content, using the practice's methodology, and one of the voice and language (prosody).",
            "**PDF reports** saved automatically to Google Drive, with each case's status tracked in Google Sheets.",
            "**A private dashboard with semantic search (RAG):** the specialist asks in plain language and gets answers with citations that link to the source document.",
          ],
        },
        {
          type: "stats",
          items: [
            { value: "~100", label: "case records" },
            { value: "270+", label: "documents indexed" },
            { value: "~4,900", label: "passages searchable with citations" },
            { value: "23", label: "versioned methodology prompts" },
          ],
        },
        { type: "h2", text: "Decisions that matter" },
        {
          type: "ul",
          items: [
            "**Human in the loop.** Reports are never sent automatically: they go to Drive and the specialist reviews them first.",
            "**The methodology leads.** The 23 prompts live as versioned documents with declared dependencies; no step re-derives what another already validated.",
            "**The simplest stack that works.** At this scale, exact in-memory search instead of a vector database: faster, cheaper and no extra infrastructure.",
            "**Sensitive data, restricted access.** The dashboard requires login and the material is never published.",
            "**Visible costs and safe deploys.** The system estimates the cost before running a full analysis, and every update passes a 6-point health check that rolls it back automatically if anything fails.",
          ],
        },
        { type: "h2", text: "What it means for a sales team" },
        {
          type: "p",
          text: "The same pattern — WhatsApp as the channel, AI analysis and cited search over your company's knowledge — is the foundation of our [Customer Support Engine](/en/services#service-3) and [Business Brain Lab](/en/services#service-4). If your team lives on WhatsApp, start with the [free AI Assessment](/en/assessment).",
        },
        { type: "cta", variant: "assessment" },
      ],
    },
  },
};
