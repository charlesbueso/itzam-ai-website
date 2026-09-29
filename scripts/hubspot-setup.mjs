#!/usr/bin/env node
/**
 * Creates the custom HubSpot contact properties the site writes to.
 * Idempotent: existing properties are left untouched.
 *
 *   node scripts/hubspot-setup.mjs            # dry run — shows what's missing
 *   node scripts/hubspot-setup.mjs --apply    # creates the missing ones
 *
 * Reads HUBSPOT_ACCESS_TOKEN from the environment or .env.local. The service
 * key needs the `crm.schemas.contacts.write` scope to create properties
 * (HubSpot → Development → Keys → Service keys → edit scopes).
 *
 * Until a property exists, the site simply drops it from the upsert
 * (lib/hubspot/client.ts) — the contact itself is never lost.
 */
import fs from "node:fs";

const PROPERTIES = [
  // Existing integration (created by hand per docs/hubspot-setup.md; listed so a fresh portal gets everything).
  { name: "itzam_source", label: "Itzam source", type: "string", fieldType: "text", description: "Which site form created/updated the contact: contact_form, waitlist, self_assessment, app_signup, questionnaire." },
  { name: "itzam_use_case", label: "Itzam use case", type: "string", fieldType: "textarea", description: "Free text from the contact form." },
  { name: "itzam_preferred_locale", label: "Itzam preferred locale", type: "string", fieldType: "text", description: "es / en — language the lead used on the site." },
  // Free AI Assessment (these were missing — assessment syncs failed until the client learned to drop them).
  { name: "itzam_assessment_score", label: "AI Assessment score", type: "number", fieldType: "number", description: "AI Sales Readiness Score (0–100) from the free AI Assessment." },
  { name: "itzam_assessment_band", label: "AI Assessment band", type: "string", fieldType: "text", description: "manual / in_motion / building / ai_ready." },
  // Lead attribution (lib/leads/attribution.ts).
  { name: "itzam_first_source", label: "First touch source / medium", type: "string", fieldType: "text", description: "e.g. google / organic, linkedin.com / social, newsletter / email." },
  { name: "itzam_first_campaign", label: "First touch campaign", type: "string", fieldType: "text", description: "utm_campaign of the first visit." },
  { name: "itzam_first_landing_page", label: "First touch landing page", type: "string", fieldType: "text", description: "First page seen on itzam.ai." },
  { name: "itzam_first_referrer", label: "First touch referrer", type: "string", fieldType: "text", description: "External site that sent the first visit." },
  { name: "itzam_last_source", label: "Last touch source / medium", type: "string", fieldType: "text", description: "Source / medium of the visit that converted." },
  { name: "itzam_last_campaign", label: "Last touch campaign", type: "string", fieldType: "text", description: "utm_campaign of the visit that converted." },
  { name: "itzam_lead_page", label: "Lead form page", type: "string", fieldType: "text", description: "Page the form was submitted from, e.g. /es/assessment." },
];

function loadToken() {
  if (process.env.HUBSPOT_ACCESS_TOKEN) return process.env.HUBSPOT_ACCESS_TOKEN;
  try {
    const line = fs
      .readFileSync(new URL("../.env.local", import.meta.url), "utf8")
      .split(/\r?\n/)
      .find((l) => l.startsWith("HUBSPOT_ACCESS_TOKEN="));
    return line?.slice("HUBSPOT_ACCESS_TOKEN=".length).replace(/^"|"$/g, "").trim();
  } catch {
    return undefined;
  }
}

const token = loadToken();
if (!token) {
  console.error("HUBSPOT_ACCESS_TOKEN not set (env or .env.local).");
  process.exit(1);
}
const apply = process.argv.includes("--apply");
const api = (path, init = {}) =>
  fetch(`https://api.hubapi.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

let missing = 0;
for (const p of PROPERTIES) {
  const res = await api(`/crm/v3/properties/contacts/${p.name}`);
  if (res.ok) {
    console.log(`✓ ${p.name}`);
    continue;
  }
  if (res.status !== 404) {
    console.log(`? ${p.name} — lookup failed (${res.status})`);
    continue;
  }
  missing++;
  if (!apply) {
    console.log(`✗ ${p.name} — missing (run with --apply to create)`);
    continue;
  }
  const create = await api(`/crm/v3/properties/contacts`, {
    method: "POST",
    body: JSON.stringify({ ...p, groupName: "contactinformation" }),
  });
  if (create.ok) {
    console.log(`+ ${p.name} — created`);
  } else {
    const text = await create.text();
    console.log(`✗ ${p.name} — create failed (${create.status}) ${text.slice(0, 200)}`);
    if (create.status === 403) {
      console.log("  → The service key needs the crm.schemas.contacts.write scope.");
    }
  }
}
if (!apply && missing) console.log(`\n${missing} missing. Re-run with --apply to create them.`);
