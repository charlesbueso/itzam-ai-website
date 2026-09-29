import "server-only";

import { z } from "zod";
import { htmlEscape } from "@/lib/email/resend";

/**
 * Server side of lead attribution (browser side: lib/analytics/attribution.ts).
 *
 * Forms post `{ attribution: { first, last }, page }`. It is untrusted input,
 * so it's parsed leniently: anything malformed becomes "unknown" instead of
 * failing the lead. One normalized shape then feeds every destination —
 * Sheet columns, the team email, HubSpot properties and the HubSpot note.
 */

const str = (max: number) =>
  z
    .string()
    .max(2000)
    .transform((s) => s.trim().slice(0, max))
    .optional()
    .catch(undefined);

const TouchSchema = z
  .object({
    source: str(100),
    medium: str(100),
    campaign: str(150),
    term: str(150),
    content: str(150),
    landing_page: str(300),
    referrer: str(300),
    click_id: str(20),
    ts: str(40),
  })
  .optional()
  .catch(undefined);

export const AttributionSchema = z
  .object({ first: TouchSchema, last: TouchSchema })
  .default({})
  .catch({});

export type LeadTouch = NonNullable<z.infer<typeof TouchSchema>>;
export type LeadAttribution = z.infer<typeof AttributionSchema>;

/** Path of the page the form was submitted from (path only, no host/query). */
export const LeadPageSchema = z
  .string()
  .max(300)
  .transform((s) => s.split("?")[0].split("#")[0].slice(0, 200))
  .default("")
  .catch("");

function sourceMedium(t?: LeadTouch): string {
  if (!t?.source) return "";
  return `${t.source} / ${t.medium || "(not set)"}`;
}

/** Ordered Sheet columns (team-facing → Spanish headers). Append-only: never reorder. */
export function attributionSheetColumns(a: LeadAttribution, page: string): [string, string][] {
  const f = a.first;
  const l = a.last;
  return [
    ["Página del formulario", page],
    ["Origen / medio (1er contacto)", sourceMedium(f)],
    ["Campaña (1er contacto)", f?.campaign || ""],
    ["Landing (1er contacto)", f?.landing_page || ""],
    ["Referrer (1er contacto)", f?.referrer || ""],
    ["Fecha (1er contacto)", f?.ts || ""],
    ["Origen / medio (último)", sourceMedium(l)],
    ["Campaña (último)", l?.campaign || ""],
    ["Contenido / término (último)", [l?.content, l?.term].filter(Boolean).join(" · ")],
  ];
}

/**
 * HubSpot contact properties. These are custom properties (create them with
 * scripts/hubspot-setup.mjs); the HubSpot client drops any that don't exist
 * instead of failing the whole upsert.
 */
export function attributionHubspotProps(a: LeadAttribution, page: string): Record<string, string | null> {
  const f = a.first;
  const l = a.last;
  return {
    itzam_first_source: sourceMedium(f) || null,
    itzam_first_campaign: f?.campaign || null,
    itzam_first_landing_page: f?.landing_page || null,
    itzam_first_referrer: f?.referrer || null,
    itzam_last_source: sourceMedium(l) || null,
    itzam_last_campaign: l?.campaign || null,
    itzam_lead_page: page || null,
  };
}

/** Plain-text lines for emails / notes. Empty when nothing is known. */
function attributionLines(a: LeadAttribution, page: string): [string, string][] {
  const lines: [string, string][] = [];
  const f = a.first;
  const l = a.last;
  if (f?.source) {
    lines.push(["Primer contacto", [sourceMedium(f), f.campaign && `campaña "${f.campaign}"`].filter(Boolean).join(" · ")]);
    if (f.landing_page) lines.push(["Llegó a", f.landing_page]);
    if (f.referrer) lines.push(["Referrer", f.referrer]);
  }
  // Same visit re-captured (page refresh, dev double-effect) → don't repeat it.
  const sameAsFirst =
    l && f && sourceMedium(l) === sourceMedium(f) && l.campaign === f.campaign && l.landing_page === f.landing_page;
  if (l?.source && !sameAsFirst) {
    lines.push(["Último contacto", [sourceMedium(l), l.campaign && `campaña "${l.campaign}"`].filter(Boolean).join(" · ")]);
  }
  if (page) lines.push(["Formulario enviado en", page]);
  return lines;
}

export function attributionText(a: LeadAttribution, page: string): string {
  const lines = attributionLines(a, page);
  return lines.length ? `\n\nOrigen del lead:\n${lines.map(([k, v]) => `${k}: ${v}`).join("\n")}` : "";
}

/** Branded-email block (inline styles only — see lib/email/layout.ts). */
export function attributionEmailHtml(a: LeadAttribution, page: string): string {
  const lines = attributionLines(a, page);
  if (!lines.length) return "";
  const rows = lines
    .map(
      ([k, v]) =>
        `<tr><td style="padding:3px 12px 3px 0;color:#666666;white-space:nowrap;vertical-align:top;">${htmlEscape(k)}</td><td style="padding:3px 0;word-break:break-word;">${htmlEscape(v)}</td></tr>`
    )
    .join("");
  return `
    <p style="margin:20px 0 6px 0;font-size:13px;color:#666666;text-transform:uppercase;letter-spacing:0.08em;">Origen del lead</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;line-height:1.5;margin:0 0 8px 0;">${rows}</table>
  `;
}

/** HubSpot note fragment (HubSpot renders basic HTML). */
export function attributionNoteHtml(a: LeadAttribution, page: string): string {
  const lines = attributionLines(a, page);
  if (!lines.length) return "";
  return `<p><strong>Origen del lead</strong><br/>${lines
    .map(([k, v]) => `<strong>${htmlEscape(k)}:</strong> ${htmlEscape(v)}`)
    .join("<br/>")}</p>`;
}
