import "server-only";

import { Resend } from "resend";

let cached: Resend | null = null;

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (cached) return cached;
  cached = new Resend(key);
  return cached;
}

export const RESEND_FROM = process.env.RESEND_FROM || "Itzam.ai <hello@notifications.itzam.ai>";

/** Strips control characters from values that go into email subjects/headers. */
export function safeHeader(v: string): string {
  return v.replace(/[\r\n\t\u0000-\u001F\u007F]/g, "").slice(0, 200);
}

/** Escapes for plain-text-in-HTML rendering. */
export function htmlEscape(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
