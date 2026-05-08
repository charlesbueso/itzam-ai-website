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
  app: {
    common: {
      logout: string;
      back: string;
      save: string;
      saving: string;
      saved: string;
      cancel: string;
      confirm: string;
      loading: string;
      error: string;
      showPassword: string;
      hidePassword: string;
    };
    login: {
      title: string;
      subtitle: string;
      emailLabel: string;
      passwordLabel: string;
      submit: string;
      submitting: string;
      invalid: string;
      forbidden: string;
      rateLimited: string;
      captcha: string;
    };
    signup: {
      title: string;
      subtitle: string;
      emailLabel: string;
      passwordLabel: string;
      confirmLabel: string;
      submit: string;
      submitting: string;
      passwordHelp: string;
      checkEmailTitle: string;
      checkEmailBody: string;
      haveAccount: string;
      loginLink: string;
      alreadyExists: string;
      errPasswordShort: string;
      errPasswordMismatch: string;
      errGeneric: string;
      errCaptcha: string;
    };
    invite: {
      invalidTitle: string;
      invalidBody: string;
      expiredTitle: string;
      expiredBody: string;
      contactAdmin: string;
    };
    questionnaire: {
      title: string;
      intro: string;
      progress: string;
      autosaved: string;
      autosaveError: string;
      requiredHint: string;
      submit: string;
      submitting: string;
      submitDisabled: string;
      thanksTitle: string;
      thanksBody: string;
      alreadyCompletedTitle: string;
      alreadyCompletedBody: string;
      collaborators: {
        heading: string;
        you: string;
        pending: string;
        addPlaceholder: string;
        addCta: string;
        adding: string;
        added: string;
        limitReached: string;
        invalidEmail: string;
        selfInvite: string;
        genericError: string;
        max: string;
      };
    };
    admin: {
      title: string;
      newCta: string;
      empty: string;
      colClient: string;
      colStatus: string;
      colCreated: string;
      colActions: string;
      statusDraft: string;
      statusSent: string;
      statusInProgress: string;
      statusCompleted: string;
      statusCancelled: string;
      newTitle: string;
      clientNameLabel: string;
      clientEmailLabel: string;
      clientEmailConfirmLabel: string;
      preferredLocaleLabel: string;
      questionsHeading: string;
      saveDraft: string;
      issueLink: string;
      regenerateLink: string;
      cancel: string;
      copyLink: string;
      copied: string;
      linkLabel: string;
      driveFolder: string;
      answersHeading: string;
      lockedAfterSend: string;
      duplicateWarning: string;
      typoConfirm: string;
      editQuestionLabel: string;
      editOptionsLabel: string;
      editOptionPlaceholder: string;
      editSaving: string;
      editSaved: string;
      editError: string;
      editInvalidEmail: string;
    };
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
    app: {
      common: {
        logout: "Log out",
        back: "Back",
        save: "Save",
        saving: "Saving…",
        saved: "Saved",
        cancel: "Cancel",
        confirm: "Confirm",
        loading: "Loading…",
        error: "Something went wrong.",
        showPassword: "Show password",
        hidePassword: "Hide password",
      },
      login: {
        title: "Sign in",
        subtitle: "Admin access only.",
        emailLabel: "Email",
        passwordLabel: "Password",
        submit: "Sign in",
        submitting: "Signing in…",
        invalid: "Invalid email or password.",
        forbidden: "Your account is not authorized for the admin panel.",
        rateLimited: "Too many attempts. Please wait a few minutes and try again.",
        captcha: "Please complete the verification challenge and try again.",
      },
      signup: {
        title: "Create your account",
        subtitle:
          "Set a password to access your assessment securely — you'll be able to log back in any time.",
        emailLabel: "Email",
        passwordLabel: "Password",
        confirmLabel: "Confirm password",
        submit: "Create account",
        submitting: "Creating account…",
        passwordHelp: "At least 10 characters. Use a mix of words, numbers, and symbols.",
        checkEmailTitle: "Check your email",
        checkEmailBody:
          "We sent you a confirmation link. Click it to verify your email and continue to your assessment.",
        haveAccount: "Already have an account?",
        loginLink: "Sign in",
        alreadyExists:
          "An account with this email already exists.",
        errPasswordShort: "Password must be at least 10 characters.",
        errPasswordMismatch: "Passwords don't match.",
        errGeneric: "Something went wrong. Please try again.",
        errCaptcha: "Please complete the verification challenge and try again.",
      },
      invite: {
        invalidTitle: "This link is no longer valid",
        invalidBody:
          "It may have expired or been replaced. Please ask your contact at Itzam.ai for a new one.",
        expiredTitle: "This link has expired",
        expiredBody: "Reach out to your contact at Itzam.ai to receive a new link.",
        contactAdmin: "Contact us",
      },
      questionnaire: {
        title: "AI Opportunity Assessment",
        intro:
          "Answer at your own pace — your responses save automatically. You can come back later from this same link.",
        progress: "Progress",
        autosaved: "Saved",
        autosaveError: "Couldn't save — retrying.",
        requiredHint: "Required",
        submit: "Send responses",
        submitting: "Sending…",
        submitDisabled: "Complete all required questions to submit.",
        thanksTitle: "Thank you. ✦",
        thanksBody:
          "We've received your responses. We'll review them and reach out to confirm the next step.",
        alreadyCompletedTitle: "Already submitted",
        alreadyCompletedBody:
          "You've already sent this questionnaire. If you need to update something, reply to your invitation email.",
        collaborators: {
          heading: "Collaborators",
          you: "you",
          pending: "invited",
          addPlaceholder: "colleague@company.com",
          addCta: "Invite",
          adding: "Sending…",
          added: "Invitation sent",
          limitReached: "You've reached the 4-collaborator limit.",
          invalidEmail: "Please enter a valid email.",
          selfInvite: "That's your own email.",
          genericError: "Couldn't send the invitation. Try again.",
          max: "Up to 4 people total.",
        },
      },
      admin: {
        title: "Admin",
        newCta: "New questionnaire",
        empty: "No questionnaires yet.",
        colClient: "Client",
        colStatus: "Status",
        colCreated: "Created",
        colActions: "Actions",
        statusDraft: "Draft",
        statusSent: "Sent",
        statusInProgress: "In progress",
        statusCompleted: "Completed",
        statusCancelled: "Cancelled",
        newTitle: "New questionnaire",
        clientNameLabel: "Client name",
        clientEmailLabel: "Client email",
        clientEmailConfirmLabel: "Confirm client email",
        preferredLocaleLabel: "Preferred language",
        questionsHeading: "Questions",
        saveDraft: "Save draft",
        issueLink: "Generate link",
        regenerateLink: "Regenerate link",
        cancel: "Cancel questionnaire",
        copyLink: "Copy link",
        copied: "Copied",
        linkLabel: "Invitation link",
        driveFolder: "Open Drive folder",
        answersHeading: "Responses",
        lockedAfterSend: "Questions are locked once the link is generated.",
        duplicateWarning:
          "There is already an active questionnaire for this email. Create another one?",
        typoConfirm: "You're about to generate a link for:",
        editQuestionLabel: "Question",
        editOptionsLabel: "Answer options",
        editOptionPlaceholder: "Option text",
        editSaving: "Saving…",
        editSaved: "Saved",
        editError: "Couldn't save — retrying.",
        editInvalidEmail: "Invalid email.",
      },
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
    app: {
      common: {
        logout: "Cerrar sesión",
        back: "Volver",
        save: "Guardar",
        saving: "Guardando…",
        saved: "Guardado",
        cancel: "Cancelar",
        confirm: "Confirmar",
        loading: "Cargando…",
        error: "Algo salió mal.",
        showPassword: "Mostrar contraseña",
        hidePassword: "Ocultar contraseña",
      },
      login: {
        title: "Iniciar sesión",
        subtitle: "Acceso solo para administradores.",
        emailLabel: "Correo",
        passwordLabel: "Contraseña",
        submit: "Entrar",
        submitting: "Entrando…",
        invalid: "Correo o contraseña inválidos.",
        forbidden: "Tu cuenta no está autorizada para el panel admin.",
        rateLimited: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
        captcha: "Completa la verificación e inténtalo de nuevo.",
      },
      signup: {
        title: "Crea tu cuenta",
        subtitle:
          "Pon una contraseña para acceder a tu assessment de forma segura — podrás volver a entrar cuando quieras.",
        emailLabel: "Correo",
        passwordLabel: "Contraseña",
        confirmLabel: "Confirma la contraseña",
        submit: "Crear cuenta",
        submitting: "Creando cuenta…",
        passwordHelp:
          "Mínimo 10 caracteres. Usa una mezcla de palabras, números y símbolos.",
        checkEmailTitle: "Revisa tu correo",
        checkEmailBody:
          "Te enviamos un link de confirmación. Haz clic para verificar tu correo y continuar con tu assessment.",
        haveAccount: "¿Ya tienes cuenta?",
        loginLink: "Iniciar sesión",
        alreadyExists: "Ya existe una cuenta con este correo.",
        errPasswordShort: "La contraseña debe tener al menos 10 caracteres.",
        errPasswordMismatch: "Las contraseñas no coinciden.",
        errGeneric: "Algo salió mal. Inténtalo de nuevo.",
        errCaptcha: "Completa la verificación e inténtalo de nuevo.",
      },
      invite: {
        invalidTitle: "Este link ya no es válido",
        invalidBody:
          "Puede haber expirado o haber sido reemplazado. Pide uno nuevo a tu contacto en Itzam.ai.",
        expiredTitle: "Este link expiró",
        expiredBody: "Escríbele a tu contacto en Itzam.ai para recibir un link nuevo.",
        contactAdmin: "Contactar",
      },
      questionnaire: {
        title: "AI Opportunity Assessment",
        intro:
          "Responde a tu ritmo — tus respuestas se guardan solas. Puedes volver luego desde este mismo link.",
        progress: "Progreso",
        autosaved: "Guardado",
        autosaveError: "No se pudo guardar — reintentando.",
        requiredHint: "Obligatoria",
        submit: "Enviar respuestas",
        submitting: "Enviando…",
        submitDisabled: "Completa todas las preguntas obligatorias para enviar.",
        thanksTitle: "Gracias. ✦",
        thanksBody:
          "Recibimos tus respuestas. Las revisamos y te contactamos para coordinar el siguiente paso.",
        alreadyCompletedTitle: "Ya fue enviado",
        alreadyCompletedBody:
          "Ya enviaste este cuestionario. Si necesitas ajustar algo, responde al correo de invitación.",
        collaborators: {
          heading: "Colaboradores",
          you: "tú",
          pending: "invitado",
          addPlaceholder: "colega@empresa.com",
          addCta: "Invitar",
          adding: "Enviando…",
          added: "Invitación enviada",
          limitReached: "Llegaste al límite de 4 colaboradores.",
          invalidEmail: "Ingresa un correo válido.",
          selfInvite: "Ese es tu propio correo.",
          genericError: "No se pudo enviar la invitación. Inténtalo de nuevo.",
          max: "Hasta 4 personas en total.",
        },
      },
      admin: {
        title: "Admin",
        newCta: "Nuevo cuestionario",
        empty: "Aún no hay cuestionarios.",
        colClient: "Cliente",
        colStatus: "Estado",
        colCreated: "Creado",
        colActions: "Acciones",
        statusDraft: "Borrador",
        statusSent: "Enviado",
        statusInProgress: "En proceso",
        statusCompleted: "Completado",
        statusCancelled: "Cancelado",
        newTitle: "Nuevo cuestionario",
        clientNameLabel: "Nombre del cliente",
        clientEmailLabel: "Correo del cliente",
        clientEmailConfirmLabel: "Confirma el correo del cliente",
        preferredLocaleLabel: "Idioma preferido",
        questionsHeading: "Preguntas",
        saveDraft: "Guardar borrador",
        issueLink: "Generar link",
        regenerateLink: "Regenerar link",
        cancel: "Cancelar cuestionario",
        copyLink: "Copiar link",
        copied: "Copiado",
        linkLabel: "Link de invitación",
        driveFolder: "Abrir carpeta en Drive",
        answersHeading: "Respuestas",
        lockedAfterSend: "Las preguntas se bloquean al generar el link.",
        duplicateWarning:
          "Ya hay un cuestionario activo para este correo. ¿Crear otro de todas formas?",
        typoConfirm: "Vas a generar un link para:",
        editQuestionLabel: "Pregunta",
        editOptionsLabel: "Opciones de respuesta",
        editOptionPlaceholder: "Texto de la opción",
        editSaving: "Guardando…",
        editSaved: "Guardado",
        editError: "No se pudo guardar — reintentando.",
        editInvalidEmail: "Correo inválido.",
      },
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}
