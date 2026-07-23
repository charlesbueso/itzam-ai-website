import { htmlEscape } from "./resend";
import { renderBrandedEmail, brandButton } from "./layout";

export function signupConfirmEmail(opts: {
  confirmUrl: string;
  locale: "es" | "en";
}): { subject: string; html: string; text: string } {
  const url = htmlEscape(opts.confirmUrl);
  const en = opts.locale === "en";

  const body = en
    ? `
      <p style="margin:0 0 16px 0;font-size:18px;font-weight:bold;">Welcome to Itzam.ai</p>
      <p style="margin:0 0 16px 0;">Confirm your email to access your AI Opportunity Assessment.</p>
      ${brandButton({ href: opts.confirmUrl, label: "Confirm email" })}
      <p style="margin:16px 0 8px 0;font-size:13px;color:#666666;">If the button doesn't work, copy and paste this URL:</p>
      <p style="margin:0 0 16px 0;font-size:12px;color:#666666;word-break:break-all;">${url}</p>
      <p style="margin:24px 0 0 0;font-size:13px;color:#666666;">If you did not request this, you can safely ignore this email.</p>
    `
    : `
      <p style="margin:0 0 16px 0;font-size:18px;font-weight:bold;">Bienvenido a Itzam.ai</p>
      <p style="margin:0 0 16px 0;">Confirma tu correo para acceder a tu AI Opportunity Assessment.</p>
      ${brandButton({ href: opts.confirmUrl, label: "Confirmar correo" })}
      <p style="margin:16px 0 8px 0;font-size:13px;color:#666666;">Si el botón no funciona, copia y pega esta URL:</p>
      <p style="margin:0 0 16px 0;font-size:12px;color:#666666;word-break:break-all;">${url}</p>
      <p style="margin:24px 0 0 0;font-size:13px;color:#666666;">Si no solicitaste esto, puedes ignorar este correo.</p>
    `;

  return {
    subject: en ? "Confirm your Itzam.ai account" : "Confirma tu cuenta de Itzam.ai",
    text: en
      ? `Welcome to Itzam.ai!\n\nConfirm your email:\n${opts.confirmUrl}\n\nIf you did not request this, ignore this email.\n\n— Itzam.ai`
      : `¡Bienvenido a Itzam.ai!\n\nConfirma tu correo:\n${opts.confirmUrl}\n\nSi no solicitaste esto, ignora este correo.\n\n— Itzam.ai`,
    html: renderBrandedEmail({
      body,
      preheader: en
        ? "Confirm your email to access your AI Opportunity Assessment."
        : "Confirma tu correo para acceder a tu AI Opportunity Assessment.",
    }),
  };
}

export function clientCompletedEmail(opts: {
  clientName: string;
  locale: "es" | "en";
}): { subject: string; html: string; text: string } {
  const name = htmlEscape(opts.clientName);
  const en = opts.locale === "en";

  const body = en
    ? `
      <p style="margin:0 0 16px 0;">Hi ${name},</p>
      <p style="margin:0 0 16px 0;">We received your responses to the <strong>AI Opportunity Assessment</strong>. Our team will review them and get back to you shortly to confirm the next steps.</p>
      <p style="margin:0 0 16px 0;">If you have any questions in the meantime, write to <a href="mailto:contact@itzam.ai" style="color:#c9a14a;">contact@itzam.ai</a>.</p>
      <p style="margin:24px 0 0 0;">— The Itzam.ai team</p>
    `
    : `
      <p style="margin:0 0 16px 0;">Hola ${name},</p>
      <p style="margin:0 0 16px 0;">Recibimos tus respuestas al <strong>AI Opportunity Assessment</strong>. Nuestro equipo las revisará y te contactará pronto para confirmar los siguientes pasos.</p>
      <p style="margin:0 0 16px 0;">Si tienes cualquier duda mientras tanto, escríbenos a <a href="mailto:contact@itzam.ai" style="color:#c9a14a;">contact@itzam.ai</a>.</p>
      <p style="margin:24px 0 0 0;">— El equipo de Itzam.ai</p>
    `;

  return {
    subject: en
      ? "We received your AI Opportunity Assessment"
      : "Recibimos tu AI Opportunity Assessment",
    text: en
      ? `Hi ${opts.clientName},\n\nWe received your responses. We'll review them and get back to you to confirm the next steps.\n\nQuestions? Write to contact@itzam.ai.\n\n— Itzam.ai`
      : `Hola ${opts.clientName},\n\nRecibimos tus respuestas. Las revisaremos y te contactaremos pronto.\n\n¿Dudas? Escríbenos a contact@itzam.ai.\n\n— Itzam.ai`,
    html: renderBrandedEmail({
      body,
      preheader: en
        ? "We received your responses — we'll be in touch shortly."
        : "Recibimos tus respuestas — te contactaremos pronto.",
    }),
  };
}

export function adminNotifyEmail(opts: {
  clientName: string;
  clientEmail: string;
  questionnaireUrl: string;
}): { subject: string; html: string; text: string } {
  const name = htmlEscape(opts.clientName);
  const email = htmlEscape(opts.clientEmail);
  const url = htmlEscape(opts.questionnaireUrl);

  const body = `
    <p style="margin:0 0 16px 0;font-size:18px;font-weight:bold;">Cuestionario completado</p>
    <p style="margin:0 0 8px 0;"><strong>Cliente:</strong> ${name}</p>
    <p style="margin:0 0 16px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color:#c9a14a;">${email}</a></p>
    ${brandButton({ href: opts.questionnaireUrl, label: "Ver respuestas" })}
    <p style="margin:16px 0 8px 0;font-size:13px;color:#666666;">Enlace directo:</p>
    <p style="margin:0;font-size:12px;color:#666666;word-break:break-all;">${url}</p>
  `;

  return {
    subject: `[Itzam] Cuestionario completado — ${opts.clientName}`,
    text: `Cliente: ${opts.clientName} <${opts.clientEmail}>\nVer respuestas: ${opts.questionnaireUrl}`,
    html: renderBrandedEmail({
      body,
      preheader: `${opts.clientName} completó el cuestionario.`,
    }),
  };
}

export function collaboratorInviteEmail(opts: {
  inviterEmail: string;
  inviteUrl: string;
  clientName: string;
  locale: "es" | "en";
}): { subject: string; html: string; text: string } {
  const inviter = htmlEscape(opts.inviterEmail);
  const company = htmlEscape(opts.clientName);
  const url = htmlEscape(opts.inviteUrl);
  const en = opts.locale === "en";

  const body = en
    ? `
      <p style="margin:0 0 16px 0;font-size:18px;font-weight:bold;">You've been invited to collaborate</p>
      <p style="margin:0 0 16px 0;"><strong>${inviter}</strong> invited you to collaborate on the <strong>AI Opportunity Assessment</strong> for <strong>${company}</strong>.</p>
      <p style="margin:0 0 16px 0;">Open the link below — if you don't have an account yet, you'll be asked to create one with this email.</p>
      ${brandButton({ href: opts.inviteUrl, label: "Open the assessment" })}
      <p style="margin:16px 0 8px 0;font-size:13px;color:#666666;">If the button doesn't work, copy and paste this URL:</p>
      <p style="margin:0 0 16px 0;font-size:12px;color:#666666;word-break:break-all;">${url}</p>
      <p style="margin:24px 0 0 0;font-size:13px;color:#666666;">Questions? Write to <a href="mailto:contact@itzam.ai" style="color:#c9a14a;">contact@itzam.ai</a>.</p>
    `
    : `
      <p style="margin:0 0 16px 0;font-size:18px;font-weight:bold;">Te invitaron a colaborar</p>
      <p style="margin:0 0 16px 0;"><strong>${inviter}</strong> te invitó a colaborar en el <strong>AI Opportunity Assessment</strong> de <strong>${company}</strong>.</p>
      <p style="margin:0 0 16px 0;">Abre el enlace de abajo — si aún no tienes cuenta, te pediremos que crees una con este correo.</p>
      ${brandButton({ href: opts.inviteUrl, label: "Abrir el assessment" })}
      <p style="margin:16px 0 8px 0;font-size:13px;color:#666666;">Si el botón no funciona, copia y pega esta URL:</p>
      <p style="margin:0 0 16px 0;font-size:12px;color:#666666;word-break:break-all;">${url}</p>
      <p style="margin:24px 0 0 0;font-size:13px;color:#666666;">¿Dudas? Escríbenos a <a href="mailto:contact@itzam.ai" style="color:#c9a14a;">contact@itzam.ai</a>.</p>
    `;

  return {
    subject: en
      ? `${opts.inviterEmail} invited you to collaborate on ${opts.clientName}'s assessment`
      : `${opts.inviterEmail} te invitó a colaborar en el assessment de ${opts.clientName}`,
    text: en
      ? `${opts.inviterEmail} invited you to collaborate on the AI Opportunity Assessment for ${opts.clientName}.\n\nOpen: ${opts.inviteUrl}\n\nQuestions? contact@itzam.ai`
      : `${opts.inviterEmail} te invitó a colaborar en el AI Opportunity Assessment de ${opts.clientName}.\n\nAbrir: ${opts.inviteUrl}\n\n¿Dudas? contact@itzam.ai`,
    html: renderBrandedEmail({
      body,
      preheader: en
        ? `${opts.inviterEmail} invited you to collaborate on ${opts.clientName}.`
        : `${opts.inviterEmail} te invitó a colaborar en ${opts.clientName}.`,
    }),
  };
}

export function contactNotification(opts: {
  name: string;
  email: string;
  company: string;
  role: string;
  use_case: string;
}): { subject: string; html: string; text: string } {
  const name = htmlEscape(opts.name);
  const email = htmlEscape(opts.email);
  const company = htmlEscape(opts.company);
  const role = htmlEscape(opts.role);
  const useCase = htmlEscape(opts.use_case).replace(/\n/g, "<br/>");

  const body = `
    <p style="margin:0 0 16px 0;font-size:18px;font-weight:bold;">Nueva solicitud de contacto</p>
    <p style="margin:0 0 8px 0;"><strong>Nombre:</strong> ${name}</p>
    <p style="margin:0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color:#c9a14a;">${email}</a></p>
    <p style="margin:0 0 8px 0;"><strong>Empresa:</strong> ${company}</p>
    <p style="margin:0 0 16px 0;"><strong>Rol:</strong> ${role}</p>
    <p style="margin:0 0 8px 0;font-size:13px;color:#666666;text-transform:uppercase;letter-spacing:0.08em;">Mensaje</p>
    <p style="margin:0 0 16px 0;padding:14px 16px;background:#f6f5f1;border-left:3px solid #c9a14a;border-radius:4px;">${useCase}</p>
    ${brandButton({ href: `mailto:${opts.email}`, label: "Responder" })}
  `;

  return {
    subject: `[Itzam] Nuevo contacto — ${opts.name} (${opts.company})`,
    text: `Nuevo contacto:\n\nNombre: ${opts.name}\nEmail: ${opts.email}\nEmpresa: ${opts.company}\nRol: ${opts.role}\n\nMensaje:\n${opts.use_case}`,
    html: renderBrandedEmail({
      body,
      preheader: `${opts.name} de ${opts.company} envió un mensaje.`,
    }),
  };
}

/**
 * Confirmation email sent to the person who submitted the contact / waitlist
 * form. Bilingual based on detected locale.
 */
export function contactConfirmationEmail(opts: {
  name: string;
  locale: "es" | "en";
  variant?: "contact" | "waitlist";
}): { subject: string; html: string; text: string } {
  const name = htmlEscape(opts.name.split(/\s+/)[0] || opts.name);
  const en = opts.locale === "en";
  const isWaitlist = opts.variant === "waitlist";

  const body = en
    ? `
      <p style="margin:0 0 16px 0;font-size:18px;font-weight:bold;">Thanks, ${name} — we got it.</p>
      <p style="margin:0 0 16px 0;">${
        isWaitlist
          ? "You're on the Itzam.ai waitlist. We'll reach out as soon as your spot is ready."
          : "We've received your message. A member of our team will get back to you within one business day."
      }</p>
      <p style="margin:0 0 16px 0;">In the meantime, feel free to reply to this email if you have anything to add — it goes straight to our inbox.</p>
      <p style="margin:24px 0 0 0;">— The Itzam.ai team</p>
    `
    : `
      <p style="margin:0 0 16px 0;font-size:18px;font-weight:bold;">Gracias, ${name} — lo recibimos.</p>
      <p style="margin:0 0 16px 0;">${
        isWaitlist
          ? "Estás en la lista de espera de Itzam.ai. Te contactaremos en cuanto tu lugar esté listo."
          : "Recibimos tu mensaje. Un miembro de nuestro equipo te contactará en menos de un día hábil."
      }</p>
      <p style="margin:0 0 16px 0;">Mientras tanto, puedes responder a este correo si quieres agregar algo — llega directo a nuestra bandeja.</p>
      <p style="margin:24px 0 0 0;">— El equipo de Itzam.ai</p>
    `;

  return {
    subject: en
      ? isWaitlist
        ? "You're on the Itzam.ai waitlist"
        : "We received your message — Itzam.ai"
      : isWaitlist
        ? "Estás en la lista de espera de Itzam.ai"
        : "Recibimos tu mensaje — Itzam.ai",
    text: en
      ? `Thanks, ${opts.name}.\n\n${
          isWaitlist
            ? "You're on the Itzam.ai waitlist. We'll reach out as soon as your spot is ready."
            : "We've received your message. A member of our team will get back to you within one business day."
        }\n\nReply to this email anytime.\n\n— Itzam.ai`
      : `Gracias, ${opts.name}.\n\n${
          isWaitlist
            ? "Estás en la lista de espera de Itzam.ai. Te contactaremos en cuanto tu lugar esté listo."
            : "Recibimos tu mensaje. Un miembro de nuestro equipo te contactará en menos de un día hábil."
        }\n\nResponde a este correo cuando quieras.\n\n— Itzam.ai`,
    html: renderBrandedEmail({
      body,
      preheader: en
        ? isWaitlist
          ? "You're on the Itzam.ai waitlist."
          : "We received your message — we'll be in touch shortly."
        : isWaitlist
          ? "Estás en la lista de espera de Itzam.ai."
          : "Recibimos tu mensaje — te contactaremos pronto.",
    }),
  };
}

/**
 * Free AI Assessment — confirmation to the lead. Sets the expectation that a
 * personalized diagnostic is on its way (prepared and sent by the team).
 */
export function assessmentConfirmationEmail(opts: {
  name: string;
  score: number;
  locale: "es" | "en";
}): { subject: string; html: string; text: string } {
  const en = opts.locale === "en";
  const firstName = htmlEscape(opts.name.split(/\s+/)[0] || opts.name);

  const body = en
    ? `
      <p style="margin:0 0 16px 0;font-size:18px;font-weight:bold;">Thanks, ${firstName} — we got your assessment.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 16px 0;">
        <tr><td align="center" style="background:#0a0a0a;border-radius:8px;padding:18px;">
          <div style="color:#999999;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">Your AI Sales Readiness Score</div>
          <div style="color:#c9a14a;font-size:40px;font-weight:bold;line-height:1.1;">${opts.score}<span style="font-size:18px;color:#777777;">/100</span></div>
        </td></tr>
      </table>
      <p style="margin:0 0 16px 0;">Our team is preparing your <strong>personalized diagnostic</strong> — your top automation opportunities and a clear starting plan. You'll receive it by email within one business day.</p>
      <p style="margin:0 0 16px 0;">Have questions in the meantime? Just reply to this email — it goes straight to our inbox.</p>
      <p style="margin:24px 0 0 0;">— The Itzam.ai team</p>
    `
    : `
      <p style="margin:0 0 16px 0;font-size:18px;font-weight:bold;">Gracias, ${firstName} — recibimos tu assessment.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 16px 0;">
        <tr><td align="center" style="background:#0a0a0a;border-radius:8px;padding:18px;">
          <div style="color:#999999;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">Tu AI Sales Readiness Score</div>
          <div style="color:#c9a14a;font-size:40px;font-weight:bold;line-height:1.1;">${opts.score}<span style="font-size:18px;color:#777777;">/100</span></div>
        </td></tr>
      </table>
      <p style="margin:0 0 16px 0;">Nuestro equipo está preparando tu <strong>diagnóstico personalizado</strong> — tus mayores oportunidades de automatización y un plan claro para arrancar. Lo recibirás por correo en menos de un día hábil.</p>
      <p style="margin:0 0 16px 0;">¿Dudas mientras tanto? Responde a este correo — llega directo a nuestra bandeja.</p>
      <p style="margin:24px 0 0 0;">— El equipo de Itzam.ai</p>
    `;

  return {
    subject: en
      ? `${firstName}, your AI assessment is in — diagnostic on the way`
      : `${firstName}, recibimos tu assessment — tu diagnóstico va en camino`,
    text: en
      ? `Thanks, ${opts.name}.\n\nYour AI Sales Readiness Score: ${opts.score}/100.\n\nOur team is preparing your personalized diagnostic and will email it within one business day.\n\nReply to this email anytime.\n\n— Itzam.ai`
      : `Gracias, ${opts.name}.\n\nTu AI Sales Readiness Score: ${opts.score}/100.\n\nNuestro equipo está preparando tu diagnóstico personalizado y te lo enviará por correo en menos de un día hábil.\n\nResponde a este correo cuando quieras.\n\n— Itzam.ai`,
    html: renderBrandedEmail({
      body,
      preheader: en
        ? `Your score: ${opts.score}/100 — your personalized diagnostic is on the way.`
        : `Tu score: ${opts.score}/100 — tu diagnóstico personalizado va en camino.`,
    }),
  };
}

/** Internal notification when someone completes the Free AI Assessment. */
export function assessmentInternalEmail(opts: {
  name: string;
  email: string;
  company: string;
  role: string;
  score: number;
  band: string;
  bottleneck: string;
  wish: string;
}): { subject: string; html: string; text: string } {
  const body = `
    <p style="margin:0 0 16px 0;font-size:18px;font-weight:bold;">Free AI Assessment completado</p>
    <p style="margin:0 0 8px 0;"><strong>Nombre:</strong> ${htmlEscape(opts.name)}</p>
    <p style="margin:0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${htmlEscape(opts.email)}" style="color:#c9a14a;">${htmlEscape(opts.email)}</a></p>
    <p style="margin:0 0 8px 0;"><strong>Empresa:</strong> ${htmlEscape(opts.company)}</p>
    <p style="margin:0 0 8px 0;"><strong>Puesto:</strong> ${htmlEscape(opts.role)}</p>
    <p style="margin:0 0 8px 0;"><strong>Score:</strong> ${opts.score}/100 (${htmlEscape(opts.band)})</p>
    <p style="margin:0 0 8px 0;"><strong>Cuello de botella #1:</strong> ${htmlEscape(opts.bottleneck)}</p>
    ${opts.wish ? `<p style="margin:0 0 16px 0;"><strong>Deseo:</strong> ${htmlEscape(opts.wish)}</p>` : ""}
    <p style="margin:16px 0 0 0;font-size:13px;color:#666666;">Respuestas completas en la nota del contacto en HubSpot y en Supabase (self_assessments).</p>
    ${brandButton({ href: `mailto:${opts.email}`, label: "Responder al lead" })}
  `;

  return {
    subject: `[Itzam] Free Assessment — ${opts.name} (${opts.company}) · ${opts.score}/100`,
    text: `Free AI Assessment completado\n\nNombre: ${opts.name}\nEmail: ${opts.email}\nEmpresa: ${opts.company}\nPuesto: ${opts.role}\nScore: ${opts.score}/100 (${opts.band})\nCuello #1: ${opts.bottleneck}${opts.wish ? `\nDeseo: ${opts.wish}` : ""}`,
    html: renderBrandedEmail({
      body,
      preheader: `${opts.name} de ${opts.company} — score ${opts.score}/100.`,
    }),
  };
}
