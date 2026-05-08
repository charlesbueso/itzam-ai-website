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
      <p style="margin:0 0 16px 0;">If you have any questions in the meantime, just reply to this email.</p>
      <p style="margin:24px 0 0 0;">— The Itzam.ai team</p>
    `
    : `
      <p style="margin:0 0 16px 0;">Hola ${name},</p>
      <p style="margin:0 0 16px 0;">Recibimos tus respuestas al <strong>AI Opportunity Assessment</strong>. Nuestro equipo las revisará y te contactará pronto para confirmar los siguientes pasos.</p>
      <p style="margin:0 0 16px 0;">Si tienes cualquier duda mientras tanto, responde a este correo.</p>
      <p style="margin:24px 0 0 0;">— El equipo de Itzam.ai</p>
    `;

  return {
    subject: en
      ? "We received your AI Opportunity Assessment"
      : "Recibimos tu AI Opportunity Assessment",
    text: en
      ? `Hi ${opts.clientName},\n\nWe received your responses. We'll review them and get back to you to confirm the next steps.\n\n— Itzam.ai`
      : `Hola ${opts.clientName},\n\nRecibimos tus respuestas. Las revisaremos y te contactaremos pronto.\n\n— Itzam.ai`,
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
