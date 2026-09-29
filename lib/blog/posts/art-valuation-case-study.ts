import type { Post } from "../types";

/** Anonymized client: an art advisory & valuation firm. No names or product names. */
export const artValuationCaseStudy: Post = {
  id: "art-valuation-case-study",
  category: "case_study",
  published: "2026-09-29",
  author: "cto",
  translations: {
    es: {
      slug: "caso-plataforma-valuacion-de-arte",
      title: "Caso: de scripts en R a una plataforma de valuación de arte",
      description:
        "Cómo convertimos los scripts de valuación de una firma de arte en una plataforma web: captura de subastas con copiar y pegar, valuación por comparables y ~1,500 obras.",
      excerpt:
        "Una firma de asesoría en arte valuaba obras con scripts en R y hojas de cálculo. Construimos una plataforma que captura resultados de subastas con copiar y pegar y valúa por comparables con el mismo modelo.",
      body: [
        {
          type: "facts",
          items: [
            { label: "Cliente", value: "Firma de asesoría y valuación de arte (anónimo)" },
            { label: "Tipo de proyecto", value: "Plataforma web interna de datos y valuación" },
            { label: "Estado", value: "En producción desde 2025" },
          ],
        },
        { type: "h2", text: "El reto" },
        {
          type: "p",
          text: "La firma valuaba obras con un modelo propio escrito en R y hojas de cálculo alimentadas a mano con resultados de subastas. Capturar cada lote, convertir monedas, encontrar comparables y armar las gráficas era trabajo manual y repetitivo.",
        },
        { type: "h2", text: "Lo que construimos" },
        {
          type: "ul",
          items: [
            "**Captura con copiar y pegar:** el equipo pega el registro de una subasta y el sistema extrae artista, título, técnica, medidas, precio de martillo y con prima, estimados, casa de subastas y fecha, y convierte EUR y GBP a USD.",
            "**Valuación por comparables:** precio por cm² para obra bidimensional y por cm³ para escultura, con ventana de años, comisión y moneda configurables.",
            "**El mismo modelo, sin sorpresas:** el motor replica la lógica de los scripts originales en R, así los resultados nuevos son comparables con los históricos.",
            "**Análisis comparativo:** CAGR y rendimiento total entre ventas, comportamiento de precio a 10 años y oferta contra demanda.",
            "**Detección de duplicados** para no contar dos veces la misma obra, aunque el título venga escrito distinto.",
            "**Respaldo automático** de la base de datos y las imágenes en Google Drive cada 4 días.",
          ],
        },
        {
          type: "stats",
          items: [
            { value: "~1,500", label: "obras con imágenes en la plataforma" },
            { value: "2D + 3D", label: "pintura y escultura, cada una con su modelo" },
            { value: "10 años", label: "de comportamiento de precio por obra" },
            { value: "4 días", label: "entre respaldos automáticos" },
          ],
        },
        { type: "h2", text: "Decisiones que importan" },
        {
          type: "ul",
          items: [
            "**No todo problema necesita un chatbot.** El valor estaba en automatizar la captura y estandarizar el modelo, no en una interfaz conversacional.",
            "**Respetar el conocimiento del cliente.** Replicamos su modelo antes de mejorar nada, para que el equipo confiara en los números desde el primer día.",
            "**Seguridad desde el inicio:** contraseñas cifradas, límite de intentos de acceso y límites de uso en cada endpoint.",
          ],
        },
        { type: "h2", text: "Qué significa para un equipo comercial" },
        {
          type: "p",
          text: "Cotizaciones, propuestas y reportes suelen vivir en hojas de cálculo que alguien llena a mano. El principio es el mismo: capturar el dato una vez, calcular con reglas claras y dejar que el equipo dedique su tiempo a vender. Si quieres saber dónde está ese trabajo repetitivo en tu operación, haz el [diagnóstico de IA gratis](/es/assessment).",
        },
        { type: "cta", variant: "assessment" },
      ],
    },
    en: {
      slug: "case-study-art-valuation-platform",
      title: "Case study: from R scripts to an art valuation platform",
      description:
        "How we turned an art firm's valuation scripts into a web platform: copy-paste auction capture, comparable-sales valuation and ~1,500 artworks.",
      excerpt:
        "An art advisory firm valued artworks with R scripts and spreadsheets. We built a platform that captures auction results by copy-paste and values works from comparable sales with the same model.",
      body: [
        {
          type: "facts",
          items: [
            { label: "Client", value: "Art advisory & valuation firm (anonymous)" },
            { label: "Project type", value: "Internal data & valuation web platform" },
            { label: "Status", value: "In production since 2025" },
          ],
        },
        { type: "h2", text: "The challenge" },
        {
          type: "p",
          text: "The firm valued artworks with its own model written in R and spreadsheets filled by hand with auction results. Capturing every lot, converting currencies, finding comparables and building the charts was manual, repetitive work.",
        },
        { type: "h2", text: "What we built" },
        {
          type: "ul",
          items: [
            "**Copy-paste capture:** the team pastes an auction record and the system extracts artist, title, medium, dimensions, hammer and premium prices, estimates, auction house and date, converting EUR and GBP to USD.",
            "**Comparable-sales valuation:** price per cm² for two-dimensional work and per cm³ for sculpture, with configurable year window, commission and currency.",
            "**Same model, no surprises:** the engine replicates the logic of the original R scripts, so new results are comparable with historical ones.",
            "**Comparative analysis:** CAGR and total return between sales, 10-year price behavior and supply versus demand.",
            "**Duplicate detection** so the same work isn't counted twice, even when its title is written differently.",
            "**Automatic backups** of the database and images to Google Drive every 4 days.",
          ],
        },
        {
          type: "stats",
          items: [
            { value: "~1,500", label: "artworks with images on the platform" },
            { value: "2D + 3D", label: "painting and sculpture, each with its own model" },
            { value: "10 years", label: "of price behavior per artwork" },
            { value: "4 days", label: "between automatic backups" },
          ],
        },
        { type: "h2", text: "Decisions that matter" },
        {
          type: "ul",
          items: [
            "**Not every problem needs a chatbot.** The value was in automating capture and standardizing the model, not in a conversational interface.",
            "**Respect the client's know-how.** We replicated their model before improving anything, so the team trusted the numbers from day one.",
            "**Security from the start:** hashed passwords, login attempt limits and rate limits on every endpoint.",
          ],
        },
        { type: "h2", text: "What it means for a sales team" },
        {
          type: "p",
          text: "Quotes, proposals and reports often live in spreadsheets someone fills in by hand. The principle is the same: capture the data once, calculate with clear rules and let the team spend its time selling. To find that repetitive work in your operation, take the [free AI Assessment](/en/assessment).",
        },
        { type: "cta", variant: "assessment" },
      ],
    },
  },
};
