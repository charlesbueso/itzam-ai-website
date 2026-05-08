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
