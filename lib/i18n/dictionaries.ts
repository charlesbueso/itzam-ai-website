export type Locale = "en" | "es";

export const LOCALES: Locale[] = ["en", "es"];

export const DEFAULT_LOCALE: Locale = "en";

export type Dictionary = {
  meta: { title: string; description: string };
  nav: {
    home: string; cta: string; switchLanguage: string; openMenu: string; closeMenu: string;
    links: { home: string; services: string; about: string; contact: string };
  };
  common: { learnMore: string; requestQuote: string; talkToUs: string; backToTop: string; comingSoon: string; addOn: string };
  home: {
    manifesto: { eyebrow: string; heading1: string; heading2: string; body: string; attribution: string };
    servicesTeaser: { eyebrow: string; heading: string; sub: string; cta: string };
    trust: { eyebrow: string; heading: string; items: { title: string; body: string }[] };
    contact: { eyebrow: string; heading: string; sub: string };
  };
  services: {
    meta: { title: string; description: string };
    eyebrow: string; heading1: string; heading2: string; intro: string; tocLabel: string;
    sectionLabels: { whatIs: string; deliverables: string; tech: string; target: string };
    items: { slug: string; number: string; title: string; tagline: string; whatIs: string; target?: string; deliverables: string[]; tech: string[]; callout?: { label: string; title: string; body: string } }[];
    closing: { heading: string; body: string; cta: string };
  };
  about: {
    meta: { title: string; description: string };
    hero: { eyebrow: string; heading1: string; heading2: string; sub: string };
    conviction: { eyebrow: string; heading: string; values: { title: string; body: string }[] };
    team: { eyebrow: string; heading: string; sub: string; members: { name: string; role: string; bio: string }[] };
    closing: { heading: string; cta: string };
  };
  contact: {
    meta: { title: string; description: string };
    eyebrow: string; heading: string; sub: string;
    direct: { label: string; email: string; responseLabel: string; response: string; locationLabel: string; location: string };
  };
  footer: { tagline: string; sectionsLabel: string; contactLabel: string; languageLabel: string; rights: string };
  hero: {
    tag1: string; tag2: string;
    frame1: { heading1: string; heading2: string; sub: string };
    frame2: { heading1: string; heading2: string; sub: string };
    scroll: string;
  };
  conviction: { heading1: string; heading2: string; body: string };
  waitlist: {
    pill: string; heading: string; sub: string;
    fields: { name: string; email: string; company: string; role: string; useCase: string };
    disclaimer: string; submit: string; submitting: string; successTitle: string; successBody: string;
  };
  app: {
    common: { logout: string; back: string; save: string; saving: string; saved: string; cancel: string; confirm: string; loading: string; error: string; showPassword: string; hidePassword: string };
    login: { title: string; subtitle: string; emailLabel: string; passwordLabel: string; submit: string; submitting: string; invalid: string; forbidden: string; rateLimited: string; captcha: string };
    signup: { title: string; subtitle: string; emailLabel: string; passwordLabel: string; confirmLabel: string; submit: string; submitting: string; passwordHelp: string; checkEmailTitle: string; checkEmailBody: string; checkEmailNext: string; checkEmailClose: string; haveAccount: string; loginLink: string; alreadyExists: string; errPasswordShort: string; errPasswordMismatch: string; errGeneric: string; errCaptcha: string };
    invite: { invalidTitle: string; invalidBody: string; expiredTitle: string; expiredBody: string; contactAdmin: string };
    questionnaire: {
      title: string; intro: string; progress: string; autosaved: string; autosaveError: string; requiredHint: string; submit: string; submitting: string; submitDisabled: string; thanksTitle: string; thanksBody: string; thanksNext: string; thanksClose: string; alreadyCompletedTitle: string; alreadyCompletedBody: string;
      collaborators: { heading: string; you: string; pending: string; addPlaceholder: string; addCta: string; adding: string; added: string; limitReached: string; invalidEmail: string; selfInvite: string; genericError: string; max: string };
    };
    admin: { title: string; newCta: string; empty: string; colClient: string; colStatus: string; colCreated: string; colActions: string; statusDraft: string; statusSent: string; statusInProgress: string; statusCompleted: string; statusCancelled: string; newTitle: string; clientNameLabel: string; clientNameHint: string; clientCompanyLabel: string; clientCompanyHint: string; clientEmailLabel: string; clientEmailConfirmLabel: string; preferredLocaleLabel: string; questionsHeading: string; saveDraft: string; issueLink: string; regenerateLink: string; cancel: string; copyLink: string; copied: string; linkLabel: string; driveFolder: string; answersHeading: string; lockedAfterSend: string; duplicateWarning: string; typoConfirm: string; editQuestionLabel: string; editOptionsLabel: string; editOptionPlaceholder: string; editSaving: string; editSaved: string; editError: string; editInvalidEmail: string };
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    meta: {
      title: "Itzam.AI — AI for Sales Teams in Mexico and LatAm.",
      description: "Itzam.AI automates your sales operation with AI — in weeks, not months. From a 2-week diagnostic to deployed AI systems, built for commercial teams in Mexico and LatAm.",
    },
    nav: {
      home: "Itzam.ai home",
      cta: "Talk to us",
      switchLanguage: "Switch language",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      links: { home: "Home", services: "Services", about: "About", contact: "Contact" },
    },
    common: { learnMore: "Learn more", requestQuote: "Request a quote", talkToUs: "Talk to us", backToTop: "Back to top", comingSoon: "Coming soon", addOn: "Add-on" },
    home: {
      manifesto: {
        eyebrow: "Our name",
        heading1: "Itzam was the Mayan",
        heading2: "god of knowledge.",
        body: "We're a Mexican AI agency helping commercial teams in Latin America implement AI in weeks — not months. Real practitioners, real models, concrete deliverables from day one.",
        attribution: "— The Itzam.ai team",
      },
      servicesTeaser: {
        eyebrow: "What we do",
        heading: "Four ways we move the needle.",
        sub: "From a 2-week diagnostic to AI assistants embedded in your operation. Pick where you are.",
        cta: "Learn more",
      },
      trust: {
        eyebrow: "Why Itzam",
        heading: "Built for sales teams, not slide decks.",
        items: [
          { title: "Tangible deliverables", body: "Every engagement ends with something working — not a strategy document gathering dust." },
          { title: "25+ years of enterprise GTM", body: "Mexican founders with enterprise experience in LatAm and North America. Same conversation in EN or ES." },
          { title: "AI with judgment", body: "We pick the simplest stack that solves your problem. No model worship, no hype tax." },
        ],
      },
      contact: {
        eyebrow: "Let's talk",
        heading: "Tell us what you're building.",
        sub: "Or what's slowing you down. We'll come back with a clear-eyed take and a concrete path forward.",
      },
    },
    services: {
      meta: { title: "Services", description: "From AI Opportunity Assessments to deployed AI systems — Itzam.ai's full service catalog for commercial teams in Mexico and LatAm." },
      eyebrow: "Services",
      heading1: "From assessment",
      heading2: "to production.",
      intro: "Four engagements, designed to compound. Start with a diagnostic, scale into deployed systems. Every deliverable is something your team can use on day one.",
      tocLabel: "Jump to",
      sectionLabels: {
        whatIs: "What it is",
        deliverables: "Deliverables",
        tech: "How we work",
        target: "Best for",
      },
      items: [
        {
          slug: "service-1", number: "01",
          title: "AI Opportunity Assessment",
          tagline: "A 2-week diagnostic that turns ambition into a roadmap.",
          whatIs: "A two-week engagement to identify, prioritize, and quantify AI opportunities across your commercial operation. We map processes, surface quick wins, and hand you a clear plan with realistic timelines and costs.",
          target: "Companies that know AI matters but need a credible plan before committing budget.",
          deliverables: ["10–12 page report with executive summary", "Process map of your current commercial operation", "AI Opportunity Map with 3–5 prioritized areas", "Quick Wins vs. Strategic Projects breakdown", "Recommended tools and stack per opportunity", "Estimated timelines and costs per initiative"],
          tech: ["Intake form + context call with your team", "Senior CTO review of every recommendation", "Realistic feasibility check on every proposed solution"],
        },
        {
          slug: "service-2", number: "02",
          title: "Sales Playbook Generator",
          tagline: "An AI-built sales kit, customized to your industries and cycle.",
          whatIs: "A complete sales-enablement kit, generated and curated for your company, your target industries, and your sales cycle. Everything your team needs to sell consistently — built in days, not months.",
          target: "Sales teams selling into multiple industries that need a unified, repeatable motion.",
          deliverables: ["One-pager per product", "Executive deck (PowerPoint)", "Sales process guide", "Per industry: pitch, top-10 objections, cold-call script, follow-up script, competitor analysis", "Discovery questions and email templates", "Onboarding guide for new hires"],
          tech: ["Kick-off call to align on your industries, products, and sales cycle", "AI-generated content reviewed and curated by our team", "Delivered as editable files ready to use on day one"],
          callout: { label: "Add-on", title: "RFP Generator", body: "Upload an RFP (PDF or Word). The system extracts the structure and generates a customized proposal automatically." },
        },
        {
          slug: "service-3", number: "03",
          title: "Customer Support Engine",
          tagline: "An AI agent that handles your customer support — 24/7, in your voice.",
          whatIs: "A production-ready AI support system that answers customers automatically on WhatsApp Business and your web chat, trained on your company's knowledge. Configurable escalation, real handoff to humans, measurable performance.",
          target: "Companies with high-volume support that want faster response times without losing quality.",
          deliverables: ["AI agent live on WhatsApp Business + web chat", "Structured knowledge base built from your content", "Escalation flow configured to your process", "Embeddable web chat widget", "Team training and operational runbook"],
          tech: ["We build your knowledge base from your existing content", "Escalation logic configured to your team's workflow", "Tested and delivered live — we don't leave you with a platform to figure out", "Optional channels: voice, email (quoted separately)"],
          callout: { label: "Coming soon", title: "Pro tier — CRM integration", body: "Native integration with HubSpot or Salesforce so support context flows directly into your CRM." },
        },
        {
          slug: "service-4", number: "04",
          title: "Itzam Business Brain Lab",
          tagline: "Your company's knowledge, available 24/7 to your team or your channel.",
          whatIs: "An AI assistant with your company's identity, trained on your internal knowledge — sales, products, pricing, processes, channel, operations. Available 24/7 to your team, your partners, or both.",
          target: "Companies whose knowledge is locked in slides, drives, and a few key people.",
          deliverables: ["AI assistant with your branding (name, colors, logo)", "Topic chips configured by category", "Structured knowledge base with cited sources", "Web access via private link or credential", "Operational guide and update workflow"],
          tech: ["We organize and structure your internal knowledge", "Custom-branded chat interface built to your spec", "Private access via link or credential — no public exposure", "Hosting and deployment included"],
          callout: { label: "Two variants", title: "Internal Brain · Channel Brain", body: "Internal: for sales and operations teams. Channel: for partners and resellers. Same core, different audience and content." },
        },
      ],
      closing: { heading: "Not sure which one fits?", body: "Tell us where you are and we'll point to the right starting move — or build a custom engagement.", cta: "Talk to us" },
    },
    about: {
      meta: { title: "About", description: "Itzam.ai is a Mexican AI agency named after the Mayan god of knowledge. We help commercial teams in Latin America implement AI in weeks — not months." },
      hero: {
        eyebrow: "About Itzam.ai",
        heading1: "Named for the Mayan",
        heading2: "god of knowledge.",
        sub: "We're a Mexican AI agency for commercial teams in LatAm. Our job is to turn AI from a concept into systems your team uses every day.",
      },
      conviction: {
        eyebrow: "Our conviction",
        heading: "Pragmatism over theater.",
        values: [
          { title: "Pragmatism", body: "The simplest stack that solves the problem. No model worship." },
          { title: "Measurable execution", body: "Every engagement ends with something working — and a number to point at." },
          { title: "AI with judgment", body: "Models are tools. Judgment is the product." },
          { title: "Compounding partnerships", body: "We invest in clients we want to keep working with for years." },
        ],
      },
      team: {
        eyebrow: "Founding team",
        heading: "Two founders. Twenty-five years of GTM, and a CTO who builds AI systems.",
        sub: "Enterprise experience across LatAm and North America, paired with engineering in AI-native systems and full-stack platforms. We design, build, and deliver everything we sell.",
        members: [
          { name: "Carlos Bueso", role: "CEO & Co-founder", bio: "Senior technology and commercial leader with 25+ years scaling AI-native, cloud, and data platforms across Latin America and North America. Built and led high-performing teams that accelerate market expansion, modernize GTM models, and scale partner ecosystems for cloud and AI-led transformation. Pragmatic and results-first. Experience at Cisco, Rackspace, Microsoft, and Experis." },
          { name: "Carlos Adrián Bueso", role: "CTO & Co-founder", bio: "Software engineer and computer scientist focused on AI-driven systems at the intersection of data, product, and creativity. Co-Founder & CTO of Alquimia Studio, where he led the development of full-stack platforms, LLM-powered applications, and cloud infrastructure for startups and enterprise clients. Previously a quantitative software engineer at AllianceBernstein. Currently developing Voxcentra — an AI-native project exploring generative cinema and autonomous agents." },
        ],
      },
      closing: { heading: "Let's build something real.", cta: "Talk to us" },
    },
    contact: {
      meta: { title: "Contact", description: "Tell us what you're building, or what's slowing you down. We'll come back within 48 hours." },
      eyebrow: "Contact",
      heading: "Let's talk.",
      sub: "Tell us what you're building, or what's slowing you down. We'll come back with a clear-eyed take and a concrete path forward.",
      direct: { label: "Direct contact", email: "contact@itzam.ai", responseLabel: "Response time", response: "Within 48 hours, every business day.", locationLabel: "Based in", location: "Mexico City — working across LatAm." },
    },
    footer: { tagline: "Intelligence, deployed — across LatAm.", sectionsLabel: "Sections", contactLabel: "Contact", languageLabel: "Language", rights: "All rights reserved." },
    hero: {
      tag1: "AI Agency", tag2: "México",
      frame1: { heading1: "Intelligence,", heading2: "deployed.", sub: "The AI agency for sales teams in Mexico and LatAm. Diagnosis, implementation, and results — in weeks." },
      frame2: { heading1: "Engineered", heading2: "for LatAm.", sub: "Agents, copilots, and automations engineered around your operation. Not bolted on top of it." },
      scroll: "Scroll to explore",
    },
    conviction: {
      heading1: "The future favors",
      heading2: "those who prepare.",
      body: "Less than 4% of companies in LatAm have deployed AI that actually generates results. We help the rest get there — with a clear diagnostic, practical implementation, and systems your team uses from day one.",
    },
    waitlist: {
      pill: "Let's talk", heading: "Ready to move first?",
      sub: "Tell us what you're building, or what's slowing you down. We'll come back with a clear-eyed take and a concrete path forward.",
      fields: { name: "Name", email: "Work email", company: "Company", role: "Role", useCase: "What are you trying to solve?" },
      disclaimer: "We only use this to follow up. No spam, ever.",
      submit: "Let's talk", submitting: "Sending…", successTitle: "Message received. ✦", successBody: "We'll be in touch within 48 hours. Let's build something real.",
    },
    app: {
      common: { logout: "Log out", back: "Back", save: "Save", saving: "Saving…", saved: "Saved", cancel: "Cancel", confirm: "Confirm", loading: "Loading…", error: "Something went wrong.", showPassword: "Show password", hidePassword: "Hide password" },
      login: { title: "Sign in", subtitle: "Admin access only.", emailLabel: "Email", passwordLabel: "Password", submit: "Sign in", submitting: "Signing in…", invalid: "Invalid email or password.", forbidden: "Your account is not authorized for the admin panel.", rateLimited: "Too many attempts. Please wait a few minutes and try again.", captcha: "Please complete the verification challenge and try again." },
      signup: { title: "Create your account", subtitle: "Set a password to access your assessment securely — you'll be able to log back in any time.", emailLabel: "Email", passwordLabel: "Password", confirmLabel: "Confirm password", submit: "Create account", submitting: "Creating account…", passwordHelp: "At least 10 characters. Use a mix of words, numbers, and symbols.", checkEmailTitle: "Check your email", checkEmailBody: "We sent you a confirmation link. Click it to verify your email and continue to your assessment.", checkEmailNext: "Next: open the email from Itzam.ai and click the confirmation button. The link works on any device — you don't have to stay on this page.", checkEmailClose: "You can safely close this tab. If you don't see the email in a few minutes, check your spam folder.", haveAccount: "Already have an account?", loginLink: "Sign in", alreadyExists: "An account with this email already exists.", errPasswordShort: "Password must be at least 10 characters.", errPasswordMismatch: "Passwords don't match.", errGeneric: "Something went wrong. Please try again.", errCaptcha: "Please complete the verification challenge and try again." },
      invite: { invalidTitle: "This link is no longer valid", invalidBody: "It may have expired or been replaced. Please ask your contact at Itzam.ai for a new one.", expiredTitle: "This link has expired", expiredBody: "Reach out to your contact at Itzam.ai to receive a new link.", contactAdmin: "Contact us" },
      questionnaire: {
        title: "AI Opportunity Assessment", intro: "Answer at your own pace — your responses save automatically. You can come back later from this same link.", progress: "Progress", autosaved: "Saved", autosaveError: "Couldn't save — retrying.", requiredHint: "Required", submit: "Send responses", submitting: "Sending…", submitDisabled: "Complete all required questions to submit.", thanksTitle: "Thank you. ✦", thanksBody: "We've received your responses. We'll review them and reach out to confirm the next step.", thanksNext: "What happens next: our team reviews your responses within one business day and replies by email to schedule a working session.", thanksClose: "You can safely close this tab. A confirmation email is also on its way.", alreadyCompletedTitle: "Already submitted", alreadyCompletedBody: "You've already sent this questionnaire. If you need to update something, reply to your invitation email.",
        collaborators: { heading: "Collaborators", you: "you", pending: "invited", addPlaceholder: "colleague@company.com", addCta: "Invite", adding: "Sending…", added: "Invitation sent", limitReached: "You've reached the 4-collaborator limit.", invalidEmail: "Please enter a valid email.", selfInvite: "That's your own email.", genericError: "Couldn't send the invitation. Try again.", max: "Up to 4 people total." },
      },
      admin: { title: "Admin", newCta: "New questionnaire", empty: "No questionnaires yet.", colClient: "Client", colStatus: "Status", colCreated: "Created", colActions: "Actions", statusDraft: "Draft", statusSent: "Sent", statusInProgress: "In progress", statusCompleted: "Completed", statusCancelled: "Cancelled", newTitle: "New questionnaire", clientNameLabel: "Contact name", clientNameHint: "Person we'll address in emails (e.g. \u201cMaría López\u201d).", clientCompanyLabel: "Company name", clientCompanyHint: "Shown to the client inside the assessment and used as the Drive folder.", clientEmailLabel: "Client email", clientEmailConfirmLabel: "Confirm client email", preferredLocaleLabel: "Preferred language", questionsHeading: "Questions", saveDraft: "Save draft", issueLink: "Generate link", regenerateLink: "Regenerate link", cancel: "Cancel questionnaire", copyLink: "Copy link", copied: "Copied", linkLabel: "Invitation link", driveFolder: "Open Drive folder", answersHeading: "Responses", lockedAfterSend: "Questions are locked once the link is generated.", duplicateWarning: "There is already an active questionnaire for this email. Create another one?", typoConfirm: "You're about to generate a link for:", editQuestionLabel: "Question", editOptionsLabel: "Answer options", editOptionPlaceholder: "Option text", editSaving: "Saving…", editSaved: "Saved", editError: "Couldn't save — retrying.", editInvalidEmail: "Invalid email." },
    },
  },

  es: {
    meta: {
      title: "Itzam.AI — IA para Equipos de Ventas en México y LatAm.",
      description: "Itzam.AI automatiza tu operación de ventas con IA — en semanas, no en meses. Desde un diagnóstico de 2 semanas hasta sistemas desplegados, para equipos comerciales en México y LatAm.",
    },
    nav: {
      home: "Inicio Itzam.ai",
      cta: "Hablemos",
      switchLanguage: "Cambiar idioma",
      openMenu: "Abrir menú",
      closeMenu: "Cerrar menú",
      links: { home: "Inicio", services: "Servicios", about: "Nosotros", contact: "Contacto" },
    },
    common: { learnMore: "Conocer más", requestQuote: "Solicitar cotización", talkToUs: "Hablemos", backToTop: "Volver arriba", comingSoon: "Próximamente", addOn: "Add-on" },
    home: {
      manifesto: {
        eyebrow: "Nuestro nombre",
        heading1: "Itzam fue el dios maya",
        heading2: "del conocimiento.",
        body: "Somos una agencia mexicana de IA que ayuda a equipos comerciales en Latinoamérica a implementar IA en semanas — no en meses. Practicantes reales, modelos reales, entregables concretos desde el día uno.",
        attribution: "— El equipo de Itzam.ai",
      },
      servicesTeaser: {
        eyebrow: "Lo que hacemos",
        heading: "Cuatro formas de mover la aguja.",
        sub: "Desde un diagnóstico de 2 semanas hasta asistentes de IA integrados en tu operación. Empieza donde estás.",
        cta: "Conocer más",
      },
      trust: {
        eyebrow: "Por qué Itzam",
        heading: "Construido para equipos de ventas, no para presentaciones.",
        items: [
          { title: "Entregables tangibles", body: "Cada proyecto termina con algo funcionando — no con un documento de estrategia juntando polvo." },
          { title: "25+ años de GTM enterprise", body: "Fundadores mexicanos con experiencia enterprise en LatAm y EE.UU. Misma conversación en EN o ES." },
          { title: "IA con criterio", body: "Elegimos el stack más simple que resuelve tu problema. Sin idolatría de modelos, sin impuesto al hype." },
        ],
      },
      contact: { eyebrow: "Hablemos", heading: "Cuéntanos qué estás construyendo.", sub: "O qué te está frenando. Volvemos con una lectura clara y un camino concreto." },
    },
    services: {
      meta: { title: "Servicios", description: "Desde AI Opportunity Assessments hasta sistemas de IA desplegados — el catálogo completo de servicios de Itzam.ai para equipos comerciales en México y LatAm." },
      eyebrow: "Servicios",
      heading1: "Del diagnóstico",
      heading2: "a producción.",
      intro: "Cuatro engagements, diseñados para componerse. Empieza con un diagnóstico, escala a sistemas desplegados. Cada entregable es algo que tu equipo puede usar desde el día uno.",
      tocLabel: "Ir a",
      sectionLabels: {
        whatIs: "Qué es",
        deliverables: "Entregables",
        tech: "Cómo trabajamos",
        target: "Ideal para",
      },
      items: [
        {
          slug: "service-1", number: "01",
          title: "AI Opportunity Assessment",
          tagline: "Diagnóstico de 2 semanas que convierte ambición en hoja de ruta.",
          whatIs: "Engagement de dos semanas para identificar, priorizar y cuantificar oportunidades de IA en tu operación comercial. Mapeamos procesos, encontramos quick wins y te entregamos un plan claro con tiempos y costos realistas.",
          target: "Empresas que saben que la IA importa pero necesitan un plan creíble antes de comprometer presupuesto.",
          deliverables: ["Reporte de 10–12 páginas con resumen ejecutivo", "Mapa de procesos de tu operación comercial", "AI Opportunity Map con 3–5 áreas priorizadas", "Quick Wins vs. Proyectos Estratégicos", "Herramientas y stack recomendado por oportunidad", "Tiempos y costos estimados por iniciativa"],
          tech: ["Intake form + llamada de contexto con tu equipo", "Revisión de cada recomendación por nuestro CTO", "Validación de viabilidad realista en cada solución propuesta"],
        },
        {
          slug: "service-2", number: "02",
          title: "Sales Playbook Generator",
          tagline: "Kit de ventas hecho con IA, personalizado a tus industrias y ciclo.",
          whatIs: "Kit completo de habilitación comercial, generado y curado para tu empresa, tus industrias objetivo y tu ciclo de venta. Todo lo que tu equipo necesita para vender consistentemente — construido en días, no en meses.",
          target: "Equipos comerciales que venden a múltiples industrias y necesitan un proceso unificado y repetible.",
          deliverables: ["One-pager por producto", "Deck ejecutivo en PowerPoint", "Guía del proceso de ventas", "Por industria: pitch, top 10 de objeciones, script de llamada en frío, script de seguimiento, análisis de competidores", "Preguntas de discovery y plantillas de email", "Guía de onboarding para nuevos vendedores"],
          tech: ["Llamada de kick-off para alinear industrias, productos y ciclo de venta", "Contenido generado con IA, revisado y curado por nuestro equipo", "Entregado como archivos editables listos para usar desde el día uno"],
          callout: { label: "Add-on", title: "RFP Generator", body: "Sube un RFP (PDF o Word). El sistema extrae la estructura y genera una propuesta personalizada automáticamente." },
        },
        {
          slug: "service-3", number: "03",
          title: "Customer Support Engine",
          tagline: "Un agente de IA que atiende a tus clientes — 24/7, en tu voz.",
          whatIs: "Sistema de atención al cliente listo para producción que responde automáticamente por WhatsApp Business y chat web, entrenado con el conocimiento de tu empresa. Escalación configurable, handoff real a humanos, desempeño medible.",
          target: "Empresas con alto volumen de soporte que buscan reducir tiempos de respuesta sin perder calidad.",
          deliverables: ["Agente de IA en vivo en WhatsApp Business + chat web", "Knowledge base estructurada con tu contenido", "Flujo de escalación configurado a tu proceso", "Widget de chat web embebible", "Capacitación al equipo y runbook operativo"],
          tech: ["Construimos tu knowledge base a partir de tu contenido existente", "Lógica de escalación configurada al flujo de trabajo de tu equipo", "Entregado en producción — no te dejamos con una plataforma que tienes que descifrar solo", "Canales opcionales: voz, email (cotización aparte)"],
          callout: { label: "Próximamente", title: "Tier Pro — Integración con CRM", body: "Integración nativa con HubSpot o Salesforce para que el contexto del soporte fluya directo a tu CRM." },
        },
        {
          slug: "service-4", number: "04",
          title: "Itzam Business Brain Lab",
          tagline: "El conocimiento de tu empresa, disponible 24/7 a tu equipo o tu canal.",
          whatIs: "Asistente de IA con la identidad de tu empresa, entrenado con todo tu conocimiento interno — ventas, productos, precios, procesos, canal, operaciones. Disponible 24/7 para tu equipo, tus partners, o ambos.",
          target: "Empresas cuyo conocimiento está atrapado en presentaciones, drives y un par de personas clave.",
          deliverables: ["Asistente de IA con tu branding (nombre, colores, logo)", "Topic chips configurados por categoría", "Knowledge base estructurada con fuentes citadas", "Acceso web por link privado o credencial", "Guía operativa y workflow de actualización"],
          tech: ["Organizamos y estructuramos tu conocimiento interno", "Interfaz de chat con tu branding, construida a tu especificación", "Acceso privado por link o credencial — sin exposición pública", "Hosting y despliegue incluidos"],
          callout: { label: "Dos variantes", title: "Brain Interno · Brain de Canal", body: "Interno: para equipos de ventas y operaciones. De canal: para partners y resellers. Mismo core, audiencia y contenido distintos." },
        },
      ],
      closing: { heading: "¿No sabes cuál te aplica?", body: "Cuéntanos dónde estás y te apuntamos al siguiente paso correcto — o construimos un engagement a la medida.", cta: "Hablemos" },
    },
    about: {
      meta: { title: "Nosotros", description: "Itzam.ai es una agencia mexicana de IA, nombrada por el dios maya del conocimiento. Ayudamos a equipos comerciales en Latinoamérica a implementar IA en semanas, no en meses." },
      hero: {
        eyebrow: "Sobre Itzam.ai",
        heading1: "Llamados como el dios",
        heading2: "maya del conocimiento.",
        sub: "Somos una agencia mexicana de IA para equipos comerciales en LatAm. Nuestro trabajo es convertir la IA de un concepto en sistemas que tu equipo usa todos los días.",
      },
      conviction: {
        eyebrow: "Nuestra convicción",
        heading: "Pragmatismo sobre teatro.",
        values: [
          { title: "Pragmatismo", body: "El stack más simple que resuelve el problema. Sin idolatría de modelos." },
          { title: "Ejecución medible", body: "Cada engagement termina con algo funcionando — y un número al cual apuntar." },
          { title: "IA con criterio", body: "Los modelos son herramientas. El criterio es el producto." },
          { title: "Alianzas que componen", body: "Invertimos en clientes con los que queremos trabajar por años." },
        ],
      },
      team: {
        eyebrow: "Equipo fundador",
        heading: "Dos fundadores. Veinticinco años de GTM y un CTO que construye sistemas de IA.",
        sub: "Experiencia enterprise en LatAm y Norteamérica, combinada con ingeniería en sistemas AI-native y plataformas full-stack. Diseñamos, construimos y entregamos todo lo que vendemos.",
        members: [
          { name: "Carlos Bueso", role: "CEO y Co-fundador", bio: "Líder senior de tecnología y comercial con más de 25 años escalando plataformas AI-native, cloud y datos en Latinoamérica y Norteamérica. Construyó y lideró equipos de alto desempeño que aceleran expansión de mercado, modernizan modelos GTM y escalan ecosistemas de partners para transformación cloud y AI-led. Pragmático y orientado a resultados. Experiencia en Cisco, Rackspace, Microsoft y Experis." },
          { name: "Carlos Adrián Bueso", role: "CTO y Co-fundador", bio: "Ingeniero de software y científico computacional enfocado en sistemas de IA en la intersección de datos, producto y creatividad. Co-fundador y CTO de Alquimia Studio, donde lideró el desarrollo de plataformas full-stack, aplicaciones LLM e infraestructura cloud para startups y clientes enterprise. Previamente ingeniero cuantitativo en AllianceBernstein. Actualmente desarrollando Voxcentra — un proyecto AI-native que explora cine generativo y agentes autónomos." },
        ],
      },
      closing: { heading: "Construyamos algo real.", cta: "Hablemos" },
    },
    contact: {
      meta: { title: "Contacto", description: "Cuéntanos qué estás construyendo, o qué te está frenando. Volvemos en menos de 48 horas." },
      eyebrow: "Contacto",
      heading: "Hablemos.",
      sub: "Cuéntanos qué estás construyendo, o qué te está frenando. Volvemos con una lectura clara y un camino concreto.",
      direct: { label: "Contacto directo", email: "contact@itzam.ai", responseLabel: "Tiempo de respuesta", response: "En menos de 48 horas, todo día hábil.", locationLabel: "Ubicación", location: "Ciudad de México — operando en todo LatAm." },
    },
    footer: { tagline: "Inteligencia, en producción — en toda LatAm.", sectionsLabel: "Secciones", contactLabel: "Contacto", languageLabel: "Idioma", rights: "Todos los derechos reservados." },
    hero: {
      tag1: "Agencia de IA", tag2: "México",
      frame1: { heading1: "Inteligencia,", heading2: "en\u00a0producción.", sub: "La agencia de IA para equipos comerciales en México y LatAm. Diagnóstico, implementación y resultados — en semanas." },
      frame2: { heading1: "Diseñada", heading2: "para LatAm.", sub: "Agentes, copilotos y automatizaciones diseñados alrededor de tu operación. No encima de ella." },
      scroll: "Desliza para explorar",
    },
    conviction: {
      heading1: "El futuro favorece",
      heading2: "a quienes se\u00a0preparan.",
      body: "Menos del 4% de las empresas en LatAm han implementado IA que realmente genera resultados. Ayudamos al resto a llegar ahí — con un diagnóstico claro, implementación práctica y sistemas que tu equipo usa desde el día uno.",
    },
    waitlist: {
      pill: "Hablemos", heading: "¿Listo para mover primero?",
      sub: "Cuéntanos qué estás construyendo, o qué te está frenando. Volvemos con una lectura clara y un camino concreto.",
      fields: { name: "Nombre", email: "Correo de trabajo", company: "Empresa", role: "Puesto", useCase: "¿Qué estás intentando resolver?" },
      disclaimer: "Solo lo usamos para dar seguimiento. Sin spam, nunca.",
      submit: "Hablemos", submitting: "Enviando…", successTitle: "Mensaje recibido. ✦", successBody: "Te contactamos en menos de 48 horas. Construyamos algo real.",
    },
    app: {
      common: { logout: "Cerrar sesión", back: "Volver", save: "Guardar", saving: "Guardando…", saved: "Guardado", cancel: "Cancelar", confirm: "Confirmar", loading: "Cargando…", error: "Algo salió mal.", showPassword: "Mostrar contraseña", hidePassword: "Ocultar contraseña" },
      login: { title: "Iniciar sesión", subtitle: "Acceso solo para administradores.", emailLabel: "Correo", passwordLabel: "Contraseña", submit: "Entrar", submitting: "Entrando…", invalid: "Correo o contraseña inválidos.", forbidden: "Tu cuenta no está autorizada para el panel admin.", rateLimited: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.", captcha: "Completa la verificación e inténtalo de nuevo." },
      signup: { title: "Crea tu cuenta", subtitle: "Pon una contraseña para acceder a tu assessment de forma segura — podrás volver a entrar cuando quieras.", emailLabel: "Correo", passwordLabel: "Contraseña", confirmLabel: "Confirma la contraseña", submit: "Crear cuenta", submitting: "Creando cuenta…", passwordHelp: "Mínimo 10 caracteres. Usa una mezcla de palabras, números y símbolos.", checkEmailTitle: "Revisa tu correo", checkEmailBody: "Te enviamos un link de confirmación. Haz clic para verificar tu correo y continuar con tu assessment.", checkEmailNext: "Siguiente paso: abre el correo de Itzam.ai y haz clic en el botón de confirmación. El link funciona desde cualquier dispositivo — no necesitas quedarte en esta página.", checkEmailClose: "Puedes cerrar esta pestaña sin problema. Si no ves el correo en unos minutos, revisa tu carpeta de spam.", haveAccount: "¿Ya tienes cuenta?", loginLink: "Iniciar sesión", alreadyExists: "Ya existe una cuenta con este correo.", errPasswordShort: "La contraseña debe tener al menos 10 caracteres.", errPasswordMismatch: "Las contraseñas no coinciden.", errGeneric: "Algo salió mal. Inténtalo de nuevo.", errCaptcha: "Completa la verificación e inténtalo de nuevo." },
      invite: { invalidTitle: "Este link ya no es válido", invalidBody: "Puede haber expirado o haber sido reemplazado. Pide uno nuevo a tu contacto en Itzam.ai.", expiredTitle: "Este link expiró", expiredBody: "Escríbele a tu contacto en Itzam.ai para recibir un link nuevo.", contactAdmin: "Contactar" },
      questionnaire: {
        title: "AI Opportunity Assessment", intro: "Responde a tu ritmo — tus respuestas se guardan solas. Puedes volver luego desde este mismo link.", progress: "Progreso", autosaved: "Guardado", autosaveError: "No se pudo guardar — reintentando.", requiredHint: "Obligatoria", submit: "Enviar respuestas", submitting: "Enviando…", submitDisabled: "Completa todas las preguntas obligatorias para enviar.", thanksTitle: "Gracias. ✦", thanksBody: "Recibimos tus respuestas. Las revisamos y te contactamos para coordinar el siguiente paso.", thanksNext: "Qué sigue: nuestro equipo revisa tus respuestas en menos de un día hábil y te escribe por correo para agendar una sesión de trabajo.", thanksClose: "Puedes cerrar esta pestaña sin problema. También te enviamos un correo de confirmación.", alreadyCompletedTitle: "Ya fue enviado", alreadyCompletedBody: "Ya enviaste este cuestionario. Si necesitas ajustar algo, responde al correo de invitación.",
        collaborators: { heading: "Colaboradores", you: "tú", pending: "invitado", addPlaceholder: "colega@empresa.com", addCta: "Invitar", adding: "Enviando…", added: "Invitación enviada", limitReached: "Llegaste al límite de 4 colaboradores.", invalidEmail: "Ingresa un correo válido.", selfInvite: "Ese es tu propio correo.", genericError: "No se pudo enviar la invitación. Inténtalo de nuevo.", max: "Hasta 4 personas en total." },
      },
      admin: { title: "Admin", newCta: "Nuevo cuestionario", empty: "Aún no hay cuestionarios.", colClient: "Cliente", colStatus: "Estado", colCreated: "Creado", colActions: "Acciones", statusDraft: "Borrador", statusSent: "Enviado", statusInProgress: "En proceso", statusCompleted: "Completado", statusCancelled: "Cancelado", newTitle: "Nuevo cuestionario", clientNameLabel: "Nombre del contacto", clientNameHint: "Persona a la que nos dirigiremos en los correos (p. ej. \u201cMaría López\u201d).", clientCompanyLabel: "Nombre de la empresa", clientCompanyHint: "Se muestra al cliente dentro del assessment y se usa como carpeta de Drive.", clientEmailLabel: "Correo del cliente", clientEmailConfirmLabel: "Confirma el correo del cliente", preferredLocaleLabel: "Idioma preferido", questionsHeading: "Preguntas", saveDraft: "Guardar borrador", issueLink: "Generar link", regenerateLink: "Regenerar link", cancel: "Cancelar cuestionario", copyLink: "Copiar link", copied: "Copiado", linkLabel: "Link de invitación", driveFolder: "Abrir carpeta en Drive", answersHeading: "Respuestas", lockedAfterSend: "Las preguntas se bloquean al generar el link.", duplicateWarning: "Ya hay un cuestionario activo para este correo. ¿Crear otro de todas formas?", typoConfirm: "Vas a generar un link para:", editQuestionLabel: "Pregunta", editOptionsLabel: "Opciones de respuesta", editOptionPlaceholder: "Texto de la opción", editSaving: "Guardando…", editSaved: "Guardado", editError: "No se pudo guardar — reintentando.", editInvalidEmail: "Correo inválido." },
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}
