import type { Locale } from "./dictionaries";

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "sub"; text: string };

export type LegalSection = {
  heading: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  sections: LegalSection[];
};

const PRIVACY_EN: LegalDocument = {
  sections: [
    {
      heading: "1. Who We Are",
      blocks: [
        { type: "p", text: "Itzam.AI is an AI consulting and implementation agency based in Mexico City, Mexico. We help commercial teams across Mexico and Latin America deploy AI systems that generate real business results." },
        { type: "sub", text: "Data Controller:" },
        { type: "list", items: [
          "Itzam.AI (operated by Carlos Bueso)",
          "contact@itzam.ai",
          "Mexico City, Mexico",
        ] },
      ],
    },
    {
      heading: "2. Information We Collect",
      blocks: [
        { type: "p", text: "When you interact with our website or services, we may collect the following information:" },
        { type: "sub", text: "Through our contact and intake forms:" },
        { type: "list", items: [
          "Full name",
          "Work email address",
          "Company name",
          "Job title or role",
          "Description of your business challenge or use case",
        ] },
        { type: "sub", text: "Through website analytics:" },
        { type: "list", items: [
          "Browser type and version",
          "Pages visited and time spent",
          "Referring website",
          "General geographic location (country/city level)",
        ] },
        { type: "p", text: "We do not collect sensitive personal data such as financial account numbers, government ID numbers, or health information." },
      ],
    },
    {
      heading: "3. How We Use Your Information",
      blocks: [
        { type: "p", text: "We use your information exclusively to:" },
        { type: "list", items: [
          "Respond to your inquiry and schedule an initial consultation",
          "Conduct and deliver the AI Opportunity Assessment you requested",
          "Provide the services outlined in your engagement agreement",
          "Communicate updates, deliverables, and project status",
          "Improve our service quality and internal processes",
        ] },
        { type: "p", text: "We do not use your information for advertising, third-party marketing, or automated decision-making." },
      ],
    },
    {
      heading: "4. Data Security",
      blocks: [
        { type: "p", text: "We take the security of your information seriously. Our security measures include:" },
        { type: "list", items: [
          "Data transmitted via HTTPS/TLS encryption",
          "Access to client information restricted to Itzam.AI team members directly involved in your engagement",
          "No storage of sensitive client data on publicly accessible systems",
          "Secure document management via Google Drive with access controls",
          "Regular review of access permissions",
        ] },
        { type: "p", text: "While we implement industry-standard security measures, no system can guarantee absolute security. We will notify you promptly in the event of any data breach that may affect your personal information." },
      ],
    },
    {
      heading: "5. Data Sharing",
      blocks: [
        { type: "p", text: "We do not sell, rent, or trade your personal information. We may share limited information with:" },
        { type: "list", items: [
          "Service providers: Tools we use to deliver our services (e.g., Google Workspace, scheduling tools). These providers are bound by their own privacy policies and do not have permission to use your data for their own purposes.",
          "Legal requirements: If required by Mexican law or competent authorities.",
        ] },
      ],
    },
    {
      heading: "6. Data Retention",
      blocks: [
        { type: "p", text: "We retain your personal information for as long as necessary to provide our services and fulfill our contractual obligations. After the engagement ends, we retain records for up to 3 years for legal and accounting purposes, after which they are securely deleted." },
      ],
    },
    {
      heading: "7. Your Rights (ARCO Rights)",
      blocks: [
        { type: "p", text: "Under Mexico's Federal Law on Protection of Personal Data Held by Private Parties (Ley Federal de Protección de Datos Personales en Posesión de los Particulares — LFPDPPP), you have the right to:" },
        { type: "list", items: [
          "Access: Request a copy of the personal data we hold about you",
          "Rectification: Request correction of inaccurate or incomplete data",
          "Cancellation: Request deletion of your personal data",
          "Opposition: Object to specific uses of your personal data",
        ] },
        { type: "p", text: "To exercise any of these rights, contact us at contact@itzam.ai with the subject line \"ARCO Rights Request.\" We will respond within 20 business days." },
      ],
    },
    {
      heading: "8. Cookies",
      blocks: [
        { type: "p", text: "Our website uses essential cookies to ensure proper functionality and basic analytics. We do not use advertising or tracking cookies. You may disable cookies in your browser settings, though this may affect site functionality." },
      ],
    },
    {
      heading: "9. Changes to This Policy",
      blocks: [
        { type: "p", text: "We may update this Privacy Policy from time to time. The updated version will be posted on our website with a revised date. Continued use of our services after changes constitutes acceptance of the updated policy." },
      ],
    },
    {
      heading: "10. Contact",
      blocks: [
        { type: "p", text: "For any questions about this Privacy Policy or how we handle your data:" },
        { type: "p", text: "Itzam.AI  |  contact@itzam.ai  |  itzam.ai  |  Mexico City, Mexico" },
      ],
    },
  ],
};

const PRIVACY_ES: LegalDocument = {
  sections: [
    {
      heading: "1. Quiénes Somos",
      blocks: [
        { type: "p", text: "Itzam.AI es una agencia de consultoría e implementación de IA con sede en la Ciudad de México, México. Ayudamos a equipos comerciales en México y América Latina a implementar sistemas de IA que generan resultados reales para el negocio." },
        { type: "sub", text: "Responsable del tratamiento:" },
        { type: "list", items: [
          "Itzam.AI (operada por Carlos Bueso)",
          "contact@itzam.ai",
          "Ciudad de México, México",
        ] },
      ],
    },
    {
      heading: "2. Información que Recopilamos",
      blocks: [
        { type: "p", text: "Cuando interactúas con nuestro sitio web o servicios, podemos recopilar la siguiente información:" },
        { type: "sub", text: "A través de nuestros formularios de contacto e intake:" },
        { type: "list", items: [
          "Nombre completo",
          "Correo electrónico laboral",
          "Nombre de la empresa",
          "Puesto o rol",
          "Descripción de tu reto de negocio o caso de uso",
        ] },
        { type: "sub", text: "A través de analíticas del sitio web:" },
        { type: "list", items: [
          "Tipo y versión de navegador",
          "Páginas visitadas y tiempo de navegación",
          "Sitio de referencia",
          "Ubicación geográfica general (nivel país/ciudad)",
        ] },
        { type: "p", text: "No recopilamos datos personales sensibles como números de cuentas financieras, números de identificación oficial ni información de salud." },
      ],
    },
    {
      heading: "3. Cómo Usamos tu Información",
      blocks: [
        { type: "p", text: "Usamos tu información exclusivamente para:" },
        { type: "list", items: [
          "Responder a tu consulta y agendar una llamada inicial",
          "Llevar a cabo y entregar el AI Opportunity Assessment que solicitaste",
          "Proveer los servicios establecidos en tu acuerdo de engagement",
          "Comunicar actualizaciones, entregables y estatus del proyecto",
          "Mejorar la calidad de nuestros servicios y procesos internos",
        ] },
        { type: "p", text: "No usamos tu información para publicidad, marketing de terceros ni toma de decisiones automatizada." },
      ],
    },
    {
      heading: "4. Seguridad de los Datos",
      blocks: [
        { type: "p", text: "Tomamos la seguridad de tu información con seriedad. Nuestras medidas de seguridad incluyen:" },
        { type: "list", items: [
          "Datos transmitidos con cifrado HTTPS/TLS",
          "Acceso a información de clientes restringido a los miembros del equipo de Itzam.AI directamente involucrados en tu engagement",
          "Sin almacenamiento de datos sensibles de clientes en sistemas públicamente accesibles",
          "Gestión segura de documentos a través de Google Drive con controles de acceso",
          "Revisión periódica de permisos de acceso",
        ] },
        { type: "p", text: "Si bien implementamos medidas de seguridad estándar de la industria, ningún sistema puede garantizar seguridad absoluta. Te notificaremos oportunamente en caso de cualquier brecha de seguridad que pueda afectar tu información personal." },
      ],
    },
    {
      heading: "5. Compartición de Datos",
      blocks: [
        { type: "p", text: "No vendemos, rentamos ni intercambiamos tu información personal. Podemos compartir información limitada con:" },
        { type: "list", items: [
          "Proveedores de servicio: Herramientas que usamos para entregar nuestros servicios (por ejemplo, Google Workspace, herramientas de agendamiento). Estos proveedores están sujetos a sus propias políticas de privacidad y no tienen permiso de usar tus datos para sus propios fines.",
          "Requerimientos legales: Si la ley mexicana o autoridades competentes así lo requieren.",
        ] },
      ],
    },
    {
      heading: "6. Retención de Datos",
      blocks: [
        { type: "p", text: "Conservamos tu información personal por el tiempo necesario para prestar nuestros servicios y cumplir con nuestras obligaciones contractuales. Una vez concluido el engagement, conservamos los registros hasta por 3 años por razones legales y contables, tras lo cual se eliminan de forma segura." },
      ],
    },
    {
      heading: "7. Tus Derechos (Derechos ARCO)",
      blocks: [
        { type: "p", text: "Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), tienes derecho a:" },
        { type: "list", items: [
          "Acceso: Solicitar una copia de los datos personales que tenemos sobre ti",
          "Rectificación: Solicitar la corrección de datos incorrectos o incompletos",
          "Cancelación: Solicitar la eliminación de tus datos personales",
          "Oposición: Oponerte a usos específicos de tus datos personales",
        ] },
        { type: "p", text: "Para ejercer cualquiera de estos derechos, contáctanos en contact@itzam.ai con el asunto \"Solicitud de Derechos ARCO\". Responderemos en un plazo máximo de 20 días hábiles." },
      ],
    },
    {
      heading: "8. Cookies",
      blocks: [
        { type: "p", text: "Nuestro sitio web utiliza cookies esenciales para garantizar el funcionamiento correcto y analíticas básicas. No utilizamos cookies publicitarias ni de rastreo. Puedes desactivar las cookies en la configuración de tu navegador, aunque esto puede afectar la funcionalidad del sitio." },
      ],
    },
    {
      heading: "9. Cambios a esta Política",
      blocks: [
        { type: "p", text: "Podemos actualizar esta Política de Privacidad ocasionalmente. La versión actualizada se publicará en nuestro sitio web con la fecha de revisión. El uso continuado de nuestros servicios después de los cambios constituye la aceptación de la política actualizada." },
      ],
    },
    {
      heading: "10. Contacto",
      blocks: [
        { type: "p", text: "Para cualquier pregunta sobre esta Política de Privacidad o sobre el manejo de tus datos:" },
        { type: "p", text: "Itzam.AI  |  contact@itzam.ai  |  itzam.ai  |  Ciudad de México, México" },
      ],
    },
  ],
};

const TERMS_EN: LegalDocument = {
  sections: [
    {
      heading: "1. About These Terms",
      blocks: [
        { type: "p", text: "These Terms and Conditions govern the relationship between Itzam.AI (\"we,\" \"us,\" \"our\") and any individual or organization (\"Client,\" \"you\") that engages our services. By submitting an inquiry, signing a proposal, or engaging our services, you agree to these terms." },
        { type: "p", text: "Itzam.AI is operated by Carlos Bueso, based in Mexico City, Mexico." },
        { type: "p", text: "Contact: contact@itzam.ai | itzam.ai" },
      ],
    },
    {
      heading: "2. Our Services",
      blocks: [
        { type: "p", text: "Itzam.AI provides AI consulting and implementation services, including but not limited to:" },
        { type: "list", items: [
          "AI Opportunity Assessment: A 2-week diagnostic engagement to identify, prioritize, and quantify AI opportunities in your commercial operation.",
          "Sales Playbook Generator: AI-assisted creation of a complete sales enablement kit customized to your industries and sales cycle.",
          "Customer Support Engine: Design, build, and deployment of AI-powered customer support systems for WhatsApp Business and web chat.",
          "Itzam Business Brain Lab: Design and deployment of a custom AI assistant trained on your company's internal knowledge.",
          "Other custom engagements as agreed in writing.",
        ] },
        { type: "p", text: "The specific scope, deliverables, timeline, and pricing of each engagement are defined in the corresponding proposal or agreement signed by both parties." },
      ],
    },
    {
      heading: "3. Engagement Model and Payment",
      blocks: [
        { type: "sub", text: "3.1 Payment Structure" },
        { type: "p", text: "Unless otherwise agreed in writing, all project engagements follow a 50/50 payment structure:" },
        { type: "list", items: [
          "50% due at the start of the engagement",
          "50% due upon delivery of the final deliverable",
        ] },
        { type: "p", text: "Monthly retainer services (ongoing administration and optimization) are billed in advance at the beginning of each month." },
        { type: "sub", text: "3.2 Currency" },
        { type: "p", text: "All prices are quoted and invoiced in Mexican Pesos (MXN) unless otherwise specified in the proposal." },
        { type: "sub", text: "3.3 Late Payments" },
        { type: "p", text: "Deliverables may be withheld until outstanding payments are received. Itzam.AI reserves the right to pause ongoing services if invoices are more than 15 calendar days overdue." },
        { type: "sub", text: "3.4 Cancellations" },
        { type: "p", text: "If a Client cancels an engagement after work has begun, the initial payment (50%) is non-refundable. Any work completed up to the cancellation date will be delivered." },
      ],
    },
    {
      heading: "4. Client Responsibilities",
      blocks: [
        { type: "p", text: "To allow Itzam.AI to deliver effectively, the Client agrees to:" },
        { type: "list", items: [
          "Provide timely access to relevant internal information, documents, and team members necessary for the engagement",
          "Complete intake forms and questionnaires within the agreed timeline",
          "Attend scheduled calls and review deliverables within a reasonable timeframe",
          "Designate a primary point of contact for the duration of the engagement",
        ] },
        { type: "p", text: "Delays caused by the Client's failure to fulfill these responsibilities may affect delivery timelines. Itzam.AI is not liable for delays resulting from lack of Client cooperation." },
      ],
    },
    {
      heading: "5. Confidentiality",
      blocks: [
        { type: "p", text: "Both parties agree to maintain strict confidentiality regarding all non-public information shared during the engagement, including but not limited to business processes, pricing, client data, strategies, and technical systems." },
        { type: "sub", text: "Itzam.AI commitments:" },
        { type: "list", items: [
          "All client information is used solely for the purpose of delivering the agreed services",
          "Client information is not shared with third parties except as required to deliver the service or as required by law",
          "Confidentiality obligations survive the termination of the engagement for a period of 3 years",
        ] },
        { type: "p", text: "Clients may request a formal Non-Disclosure Agreement (NDA) prior to beginning an engagement." },
      ],
    },
    {
      heading: "6. Data Handling and AI Systems",
      blocks: [
        { type: "p", text: "Itzam.AI builds and deploys AI systems that may process your company's internal data, customer interactions, and business information. We commit to:" },
        { type: "list", items: [
          "Handling all client data with strict security measures",
          "Using client data exclusively to build and improve the systems specified in the engagement",
          "Not training general AI models on client-specific data without explicit written consent",
          "Implementing access controls and encryption for all client data in our custody",
          "Promptly notifying clients of any security incidents affecting their data",
        ] },
        { type: "p", text: "By engaging our services, you acknowledge that AI systems involve inherent limitations including potential for errors or unexpected outputs. We design systems to minimize these risks, but cannot guarantee perfect accuracy at all times." },
      ],
    },
    {
      heading: "7. Intellectual Property",
      blocks: [
        { type: "sub", text: "7.1 Client IP" },
        { type: "p", text: "All pre-existing intellectual property belonging to the Client (data, content, brand assets, processes) remains the property of the Client." },
        { type: "sub", text: "7.2 Deliverables" },
        { type: "p", text: "Upon full payment, the Client receives full ownership of the deliverables produced for them, including AI systems, documents, playbooks, and configurations specific to their operation." },
        { type: "sub", text: "7.3 Itzam.AI IP" },
        { type: "p", text: "Itzam.AI retains ownership of its methodologies, frameworks, proprietary processes, and tools used to create deliverables. These may be reused for other clients unless explicitly agreed otherwise." },
      ],
    },
    {
      heading: "8. Limitation of Liability",
      blocks: [
        { type: "p", text: "Itzam.AI's total liability for any claim arising from our services shall not exceed the total fees paid by the Client for the specific engagement giving rise to the claim." },
        { type: "sub", text: "Itzam.AI is not liable for:" },
        { type: "list", items: [
          "Indirect, consequential, or lost profit damages",
          "Business decisions made based on our recommendations",
          "Results or outcomes of AI systems that depend on client-controlled factors",
          "Third-party platform outages or changes (e.g., WhatsApp Business API, cloud providers)",
        ] },
      ],
    },
    {
      heading: "9. Testimonials and Case Studies",
      blocks: [
        { type: "p", text: "For engagements at introductory pricing (early clients), the Client agrees to provide a written testimonial and permit Itzam.AI to reference the engagement as a case study (without disclosing confidential information) in our marketing materials. This condition is explicitly noted in the corresponding proposal." },
      ],
    },
    {
      heading: "10. Governing Law",
      blocks: [
        { type: "p", text: "These Terms and any disputes arising from them are governed by the laws of the United Mexican States (Estados Unidos Mexicanos), with jurisdiction in the courts of Mexico City, Mexico. Both parties agree to attempt to resolve disputes amicably before pursuing formal legal proceedings." },
      ],
    },
    {
      heading: "11. Modifications",
      blocks: [
        { type: "p", text: "Itzam.AI may update these Terms from time to time. Updated terms will be published on our website. For ongoing engagements, material changes will be communicated by email. Continued use of our services constitutes acceptance of the updated terms." },
      ],
    },
    {
      heading: "12. Contact",
      blocks: [
        { type: "p", text: "For questions about these Terms and Conditions:" },
        { type: "p", text: "Itzam.AI  |  contact@itzam.ai  |  itzam.ai  |  Mexico City, Mexico" },
      ],
    },
  ],
};

const TERMS_ES: LegalDocument = {
  sections: [
    {
      heading: "1. Sobre Estos Términos",
      blocks: [
        { type: "p", text: "Estos Términos y Condiciones rigen la relación entre Itzam.AI (\"nosotros,\" \"nuestro\") y cualquier persona física o moral (\"Cliente,\" \"tú\") que contrate nuestros servicios. Al enviar una consulta, firmar una propuesta o contratar nuestros servicios, aceptas estos términos." },
        { type: "p", text: "Itzam.AI es operada por Carlos Bueso, con sede en Ciudad de México, México." },
        { type: "p", text: "Contacto: contact@itzam.ai | itzam.ai" },
      ],
    },
    {
      heading: "2. Nuestros Servicios",
      blocks: [
        { type: "p", text: "Itzam.AI ofrece servicios de consultoría e implementación de IA, que incluyen entre otros:" },
        { type: "list", items: [
          "AI Opportunity Assessment: Engagement de diagnóstico de 2 semanas para identificar, priorizar y cuantificar oportunidades de IA en tu operación comercial.",
          "Sales Playbook Generator: Creación asistida por IA de un kit completo de habilitación de ventas, personalizado a tus industrias y ciclo de venta.",
          "Customer Support Engine: Diseño, construcción e implementación de sistemas de atención al cliente con IA para WhatsApp Business y chat web.",
          "Itzam Business Brain Lab: Diseño e implementación de un asistente de IA personalizado, entrenado con el conocimiento interno de tu empresa.",
          "Otros engagements personalizados según lo acordado por escrito.",
        ] },
        { type: "p", text: "El alcance específico, entregables, tiempos y precios de cada engagement se definen en la propuesta o acuerdo correspondiente firmado por ambas partes." },
      ],
    },
    {
      heading: "3. Modelo de Engagement y Pago",
      blocks: [
        { type: "sub", text: "3.1 Estructura de Pago" },
        { type: "p", text: "A menos que se acuerde por escrito de otra forma, todos los proyectos siguen una estructura de pago 50/50:" },
        { type: "list", items: [
          "50% al inicio del engagement",
          "50% a la entrega del entregable final",
        ] },
        { type: "p", text: "Los servicios de retainer mensual (administración y optimización continua) se facturan por adelantado al inicio de cada mes." },
        { type: "sub", text: "3.2 Moneda" },
        { type: "p", text: "Todos los precios se cotizan y facturan en Pesos Mexicanos (MXN) salvo que se especifique lo contrario en la propuesta." },
        { type: "sub", text: "3.3 Pagos Atrasados" },
        { type: "p", text: "Los entregables podrán retenerse hasta que los pagos pendientes sean recibidos. Itzam.AI se reserva el derecho de pausar servicios activos si las facturas llevan más de 15 días naturales de vencimiento." },
        { type: "sub", text: "3.4 Cancelaciones" },
        { type: "p", text: "Si el Cliente cancela un engagement después de que el trabajo haya comenzado, el pago inicial (50%) no es reembolsable. Todo el trabajo completado hasta la fecha de cancelación será entregado." },
      ],
    },
    {
      heading: "4. Responsabilidades del Cliente",
      blocks: [
        { type: "p", text: "Para que Itzam.AI pueda entregar de manera efectiva, el Cliente se compromete a:" },
        { type: "list", items: [
          "Proveer acceso oportuno a información interna relevante, documentos y miembros del equipo necesarios para el engagement",
          "Completar formularios de intake y cuestionarios dentro del calendario acordado",
          "Asistir a las llamadas programadas y revisar los entregables en un plazo razonable",
          "Designar un punto de contacto principal durante la duración del engagement",
        ] },
        { type: "p", text: "Los retrasos causados por el incumplimiento de estas responsabilidades por parte del Cliente pueden afectar los tiempos de entrega. Itzam.AI no es responsable por retrasos que resulten de la falta de cooperación del Cliente." },
      ],
    },
    {
      heading: "5. Confidencialidad",
      blocks: [
        { type: "p", text: "Ambas partes acuerdan mantener estricta confidencialidad sobre toda la información no pública compartida durante el engagement, incluyendo pero no limitándose a: procesos de negocio, precios, datos de clientes, estrategias y sistemas técnicos." },
        { type: "sub", text: "Compromisos de Itzam.AI:" },
        { type: "list", items: [
          "Toda la información del Cliente se usa exclusivamente para entregar los servicios acordados",
          "La información del Cliente no se comparte con terceros salvo lo necesario para entregar el servicio o cuando la ley así lo requiera",
          "Las obligaciones de confidencialidad sobreviven la terminación del engagement por un período de 3 años",
        ] },
        { type: "p", text: "Los Clientes pueden solicitar un Acuerdo de No Divulgación (NDA) formal antes de iniciar un engagement." },
      ],
    },
    {
      heading: "6. Manejo de Datos y Sistemas de IA",
      blocks: [
        { type: "p", text: "Itzam.AI construye e implementa sistemas de IA que pueden procesar datos internos de tu empresa, interacciones con clientes e información de negocio. Nos comprometemos a:" },
        { type: "list", items: [
          "Manejar todos los datos del Cliente con estrictas medidas de seguridad",
          "Usar los datos del Cliente exclusivamente para construir y mejorar los sistemas especificados en el engagement",
          "No entrenar modelos de IA generales con datos específicos del Cliente sin consentimiento explícito por escrito",
          "Implementar controles de acceso y cifrado para todos los datos del Cliente bajo nuestra custodia",
          "Notificar oportunamente a los Clientes sobre cualquier incidente de seguridad que afecte sus datos",
        ] },
        { type: "p", text: "Al contratar nuestros servicios, reconoces que los sistemas de IA tienen limitaciones inherentes, incluyendo la posibilidad de errores o resultados inesperados. Diseñamos los sistemas para minimizar estos riesgos, pero no podemos garantizar precisión perfecta en todo momento." },
      ],
    },
    {
      heading: "7. Propiedad Intelectual",
      blocks: [
        { type: "sub", text: "7.1 PI del Cliente" },
        { type: "p", text: "Toda la propiedad intelectual preexistente del Cliente (datos, contenido, activos de marca, procesos) permanece como propiedad del Cliente." },
        { type: "sub", text: "7.2 Entregables" },
        { type: "p", text: "Tras el pago completo, el Cliente recibe la propiedad total de los entregables producidos para él, incluyendo sistemas de IA, documentos, playbooks y configuraciones específicas para su operación." },
        { type: "sub", text: "7.3 PI de Itzam.AI" },
        { type: "p", text: "Itzam.AI conserva la propiedad de sus metodologías, marcos de trabajo, procesos propietarios y herramientas utilizadas para crear los entregables. Estos pueden reutilizarse para otros clientes salvo que se acuerde expresamente lo contrario." },
      ],
    },
    {
      heading: "8. Limitación de Responsabilidad",
      blocks: [
        { type: "p", text: "La responsabilidad total de Itzam.AI por cualquier reclamación derivada de nuestros servicios no excederá el total de los honorarios pagados por el Cliente para el engagement específico que dio origen a la reclamación." },
        { type: "sub", text: "Itzam.AI no es responsable por:" },
        { type: "list", items: [
          "Daños indirectos, consecuentes o lucro cesante",
          "Decisiones de negocio tomadas con base en nuestras recomendaciones",
          "Resultados de sistemas de IA que dependan de factores controlados por el Cliente",
          "Interrupciones o cambios en plataformas de terceros (por ejemplo, WhatsApp Business API, proveedores cloud)",
        ] },
      ],
    },
    {
      heading: "9. Testimoniales y Casos de Estudio",
      blocks: [
        { type: "p", text: "Para engagements a precio de lanzamiento (primeros clientes), el Cliente acepta proporcionar un testimonio por escrito y permitir que Itzam.AI referencie el engagement como caso de estudio (sin divulgar información confidencial) en nuestros materiales de marketing. Esta condición se indica expresamente en la propuesta correspondiente." },
      ],
    },
    {
      heading: "10. Ley Aplicable",
      blocks: [
        { type: "p", text: "Estos Términos y cualquier disputa derivada de ellos se rigen por las leyes de los Estados Unidos Mexicanos, con jurisdicción en los tribunales de la Ciudad de México. Ambas partes acuerdan intentar resolver las disputas de manera amigable antes de iniciar procedimientos legales formales." },
      ],
    },
    {
      heading: "11. Modificaciones",
      blocks: [
        { type: "p", text: "Itzam.AI puede actualizar estos Términos ocasionalmente. Los términos actualizados se publicarán en nuestro sitio web. Para engagements activos, los cambios materiales se comunicarán por correo electrónico. El uso continuado de nuestros servicios constituye la aceptación de los términos actualizados." },
      ],
    },
    {
      heading: "12. Contacto",
      blocks: [
        { type: "p", text: "Para preguntas sobre estos Términos y Condiciones:" },
        { type: "p", text: "Itzam.AI  |  contact@itzam.ai  |  itzam.ai  |  Ciudad de México, México" },
      ],
    },
  ],
};

export function getPrivacy(locale: Locale): LegalDocument {
  return locale === "es" ? PRIVACY_ES : PRIVACY_EN;
}

export function getTerms(locale: Locale): LegalDocument {
  return locale === "es" ? TERMS_ES : TERMS_EN;
}
