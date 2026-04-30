export type Locale = "en" | "es";

export const LOCALES: Locale[] = ["en", "es"];
export const DEFAULT_LOCALE: Locale = "en";

export type Dictionary = {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    home: string;
    cta: string;
    switchLanguage: string;
  };
  hero: {
    tag1: string;
    tag2: string;
    frame1: {
      heading1: string;
      heading2: string;
      sub: string;
    };
    frame2: {
      heading1: string;
      heading2: string;
      sub: string;
    };
    scroll: string;
  };
  conviction: {
    heading1: string;
    heading2: string;
    body: string;
  };
  waitlist: {
    pill: string;
    heading: string;
    sub: string;
    fields: {
      name: string;
      email: string;
      company: string;
      role: string;
      useCase: string;
    };
    disclaimer: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    meta: {
      title: "Itzam.ai — Intelligence, deployed.",
      description:
        "Itzam.ai is the AI agency for LATAM operators. Senior engineers design, build, and ship production-grade AI systems — agents, copilots, and automations — in 30 days, not 30 months.",
    },
    nav: {
      home: "Itzam.ai home",
      cta: "Get early access",
      switchLanguage: "Switch language",
    },
    hero: {
      tag1: "AI Agency",
      tag2: "México",
      frame1: {
        heading1: "Intelligence,",
        heading2: "deployed.",
        sub: "The AI agency for LATAM operators. Strategy, systems, and shipped products. In 30 days.",
      },
      frame2: {
        heading1: "Engineered",
        heading2: "for LATAM.",
        sub: "Agents, copilots, and automations engineered around your operation. Not bolted on top of it.",
      },
      scroll: "Scroll to explore",
    },
    conviction: {
      heading1: "The future favors",
      heading2: "those who prepare.",
      body: "Less than 4% of LATAM companies have reached production-grade AI. We're the team that gets the rest there. Senior engineers, real models, systems that go live in 30 days, not 30 months.",
    },
    waitlist: {
      pill: "Let's talk",
      heading: "Ready to move first?",
      sub: "Tell us what you're building, or what's slowing you down. We'll come back with a clear-eyed take and a concrete path forward.",
      fields: {
        name: "Name",
        email: "Work email",
        company: "Company",
        role: "Role",
        useCase: "What are you trying to solve?",
      },
      disclaimer: "We only use this to follow up. No spam, ever.",
      submit: "Let's talk",
      submitting: "Sending…",
      successTitle: "Message received. ✦",
      successBody:
        "We'll be in touch within 48 hours. Let's build something real.",
    },
  },
  es: {
    meta: {
      title: "Itzam.ai — Inteligencia, en producción.",
      description:
        "Itzam.ai es la agencia de IA para operadores de LATAM. Ingenieros senior diseñan, construyen y lanzan sistemas de IA de grado productivo — agentes, copilotos y automatizaciones — en 30 días, no en 30 meses.",
    },
    nav: {
      home: "Inicio Itzam.ai",
      cta: "Acceso anticipado",
      switchLanguage: "Cambiar idioma",
    },
    hero: {
      tag1: "Agencia de IA",
      tag2: "México",
      frame1: {
        heading1: "Inteligencia,",
        heading2: "en\u00a0producción.",
        sub: "La agencia de IA para operadores de LATAM. Estrategia, sistemas y productos lanzados. En 30 días.",
      },
      frame2: {
        heading1: "Diseñada",
        heading2: "para LATAM.",
        sub: "Agentes, copilotos y automatizaciones diseñados alrededor de tu operación. No encima de ella.",
      },
      scroll: "Desliza para explorar",
    },
    conviction: {
      heading1: "El futuro favorece",
      heading2: "a quienes se\u00a0preparan.",
      body: "Menos del 4% de las empresas de LATAM han llegado a IA de grado productivo. Somos el equipo que lleva ahí al resto. Ingenieros senior, modelos reales, sistemas que entran en producción en 30 días, no en 30 meses.",
    },
    waitlist: {
      pill: "Hablemos",
      heading: "¿Listo para mover primero?",
      sub: "Cuéntanos qué estás construyendo, o qué te está frenando. Volvemos con una lectura clara y un camino concreto.",
      fields: {
        name: "Nombre",
        email: "Correo de trabajo",
        company: "Empresa",
        role: "Puesto",
        useCase: "¿Qué estás intentando resolver?",
      },
      disclaimer: "Solo lo usamos para dar seguimiento. Sin spam, nunca.",
      submit: "Hablemos",
      submitting: "Enviando…",
      successTitle: "Mensaje recibido. ✦",
      successBody:
        "Te contactamos en menos de 48 horas. Construyamos algo real.",
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}
