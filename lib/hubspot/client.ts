import "server-only";

/**
 * HubSpot CRM v3 client — server-only.
 *
 * Authenticates with a Private App access token (NOT an API key). Create
 * one at: HubSpot → Settings → Integrations → Private Apps. Grant scopes:
 *   - crm.objects.contacts.read / write
 *   - crm.objects.deals.read / write
 *   - crm.schemas.deals.read / write   (only if you create deals)
 *
 * Design choices:
 *   - Graceful no-op when HUBSPOT_ACCESS_TOKEN is unset. We don't want a
 *     missing token to break form submissions; integrations are reported
 *     via console.warn so misconfiguration is visible in logs.
 *   - All public functions return `{ ok, id?, error? }` instead of throwing
 *     for fire-and-forget call sites (contact form, signup).
 *   - One internal `hsFetch()` adds auth, JSON, timeout, 1 retry on 429/5xx
 *     with backoff.
 *   - Search-then-upsert pattern for contacts because HubSpot's
 *     `idProperty=email` PATCH endpoint returns 404 on first contact and we
 *     want a uniform create-or-update.
 */

const BASE = "https://api.hubapi.com";
const TIMEOUT_MS = 8000;

type Json = Record<string, unknown>;

function getToken(): string | null {
  const t = process.env.HUBSPOT_ACCESS_TOKEN;
  return t && t.length > 0 ? t : null;
}

export function isHubspotEnabled(): boolean {
  return getToken() !== null;
}

async function hsFetch(
  path: string,
  init: RequestInit & { body?: string } = {},
  attempt = 0
): Promise<Response> {
  const token = getToken();
  if (!token) throw new Error("hubspot_not_configured");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      cache: "no-store",
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    });
    // Retry once on rate limit or transient 5xx.
    if ((res.status === 429 || res.status >= 500) && attempt === 0) {
      const retryAfter = Number(res.headers.get("retry-after") || "1");
      await new Promise((r) => setTimeout(r, Math.min(retryAfter, 5) * 1000));
      return hsFetch(path, init, 1);
    }
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ─────────────────────────── Contacts ───────────────────────────

export type UpsertContactInput = {
  email: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  jobtitle?: string;
  phone?: string;
  website?: string;
  /** HubSpot lifecycle stage. Recommended: 'lead' | 'marketingqualifiedlead'. */
  lifecyclestage?: string;
  /** Free-form source tag, written to `hs_analytics_source_data_1` if you've
   *  mapped it, plus a custom `itzam_source` property if it exists. */
  source?: string;
  /** Any additional contact properties (must exist in HubSpot). */
  properties?: Record<string, string | number | boolean | null>;
};

export type UpsertResult =
  | { ok: true; id: string; created: boolean }
  | { ok: false; error: string };

function splitName(full?: string): { firstname?: string; lastname?: string } {
  if (!full) return {};
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstname: parts[0] };
  return {
    firstname: parts.slice(0, -1).join(" "),
    lastname: parts.slice(-1)[0],
  };
}

export function nameFrom(fullName?: string, fallbacks?: { firstname?: string; lastname?: string }) {
  const split = splitName(fullName);
  return {
    firstname: split.firstname ?? fallbacks?.firstname,
    lastname: split.lastname ?? fallbacks?.lastname,
  };
}

function buildContactProps(input: UpsertContactInput): Json {
  const props: Json = {
    email: input.email.toLowerCase(),
  };
  if (input.firstname) props.firstname = input.firstname;
  if (input.lastname) props.lastname = input.lastname;
  if (input.company) props.company = input.company;
  if (input.jobtitle) props.jobtitle = input.jobtitle;
  if (input.phone) props.phone = input.phone;
  if (input.website) props.website = input.website;
  if (input.lifecyclestage) props.lifecyclestage = input.lifecyclestage;
  if (input.source) {
    // `hs_analytics_source` / `hs_analytics_source_data_1` are read-only —
    // they're set by HubSpot's own tracking script. We only write our own
    // custom property here. Create it in HubSpot if you haven't:
    //   Settings → Properties → Contact properties → Create property
    //   Internal name: itzam_source   Type: Single-line text
    (props as Record<string, unknown>).itzam_source = input.source;
  }
  if (input.properties) {
    for (const [k, v] of Object.entries(input.properties)) {
      if (v !== undefined && v !== null) props[k] = v as unknown as string;
    }
  }
  return props;
}

/**
 * Create-or-update a contact keyed by email. Returns the HubSpot contact id.
 * Non-throwing — returns `{ ok: false, error }` on failure (or when HubSpot
 * is not configured).
 */
export async function upsertContact(input: UpsertContactInput): Promise<UpsertResult> {
  if (!isHubspotEnabled()) return { ok: false, error: "hubspot_not_configured" };
  if (!input.email) return { ok: false, error: "missing_email" };

  const properties = buildContactProps(input);

  try {
    // Try update-by-email first (idempotent, fast path for existing contacts).
    const patchRes = await hsFetch(
      `/crm/v3/objects/contacts/${encodeURIComponent(input.email)}?idProperty=email`,
      { method: "PATCH", body: JSON.stringify({ properties }) }
    );
    if (patchRes.ok) {
      const body = (await patchRes.json().catch(() => ({}))) as { id?: string };
      return { ok: true, id: String(body.id || ""), created: false };
    }
    if (patchRes.status !== 404) {
      const errText = await patchRes.text().catch(() => "");
      console.warn("[hubspot] upsertContact PATCH failed", patchRes.status, errText);
      return { ok: false, error: `patch_${patchRes.status}` };
    }

    // 404 → create.
    const postRes = await hsFetch(`/crm/v3/objects/contacts`, {
      method: "POST",
      body: JSON.stringify({ properties }),
    });
    if (!postRes.ok) {
      const errText = await postRes.text().catch(() => "");
      // 409 = email already exists (race between PATCH 404 + POST). Re-PATCH.
      if (postRes.status === 409) {
        const retry = await hsFetch(
          `/crm/v3/objects/contacts/${encodeURIComponent(input.email)}?idProperty=email`,
          { method: "PATCH", body: JSON.stringify({ properties }) }
        );
        if (retry.ok) {
          const body = (await retry.json().catch(() => ({}))) as { id?: string };
          return { ok: true, id: String(body.id || ""), created: false };
        }
      }
      console.warn("[hubspot] upsertContact POST failed", postRes.status, errText);
      return { ok: false, error: `post_${postRes.status}` };
    }
    const body = (await postRes.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: String(body.id || ""), created: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[hubspot] upsertContact threw", msg);
    return { ok: false, error: msg };
  }
}

// ─────────────────────────── Deals ───────────────────────────

export type CreateDealInput = {
  /** HubSpot internal name of the deal, shown in the pipeline. */
  name: string;
  /** Contact id to associate with the deal. */
  contactId: string;
  amount?: number;
  /** Pipeline stage *internal id*. Defaults to the portal's default pipeline. */
  dealstage?: string;
  pipeline?: string;
  /** Free-form source string written to `itzam_source` if the property exists. */
  source?: string;
  /** Any additional deal properties (must exist in HubSpot). */
  properties?: Record<string, string | number | boolean | null>;
};

export type CreateDealResult = { ok: true; id: string } | { ok: false; error: string };

export async function createDealForContact(input: CreateDealInput): Promise<CreateDealResult> {
  if (!isHubspotEnabled()) return { ok: false, error: "hubspot_not_configured" };
  if (!input.contactId) return { ok: false, error: "missing_contact_id" };

  const props: Json = { dealname: input.name };
  if (typeof input.amount === "number") props.amount = String(input.amount);
  if (input.dealstage) props.dealstage = input.dealstage;
  if (input.pipeline) props.pipeline = input.pipeline;
  if (input.source) (props as Record<string, unknown>).itzam_source = input.source;
  if (input.properties) {
    for (const [k, v] of Object.entries(input.properties)) {
      if (v !== undefined && v !== null) props[k] = v as unknown as string;
    }
  }

  try {
    const res = await hsFetch(`/crm/v3/objects/deals`, {
      method: "POST",
      body: JSON.stringify({
        properties: props,
        // Association type 3 = deal_to_contact (HubSpot-defined).
        associations: [
          {
            to: { id: input.contactId },
            types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }],
          },
        ],
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn("[hubspot] createDeal failed", res.status, errText);
      return { ok: false, error: `deal_${res.status}` };
    }
    const body = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: String(body.id || "") };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[hubspot] createDeal threw", msg);
    return { ok: false, error: msg };
  }
}

// ─────────────────────────── Notes (engagements) ───────────────────────────

export type CreateNoteInput = {
  /** Contact id (numeric string from HubSpot) to attach the note to. */
  contactId: string;
  /** Note body. Plain text or basic HTML. HubSpot renders this in the timeline. */
  body: string;
};

export type CreateNoteResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Attach a Note engagement to a contact. Notes appear in the contact's
 * activity timeline immediately — the right place for freeform messages
 * (like the contact-form `use_case`) that would otherwise be buried in a
 * custom property the user has to hunt for.
 *
 * Uses the v3 Notes object + a standard `note_to_contact` association.
 */
export async function createNoteForContact(input: CreateNoteInput): Promise<CreateNoteResult> {
  if (!isHubspotEnabled()) return { ok: false, error: "hubspot_not_configured" };
  if (!input.contactId) return { ok: false, error: "missing_contact_id" };
  if (!input.body || !input.body.trim()) return { ok: false, error: "empty_body" };

  try {
    const res = await hsFetch(`/crm/v3/objects/notes`, {
      method: "POST",
      body: JSON.stringify({
        properties: {
          // `hs_timestamp` is required; HubSpot uses it to position the note
          // on the activity timeline.
          hs_timestamp: new Date().toISOString(),
          hs_note_body: input.body,
        },
        // Association type 202 = note_to_contact (HubSpot-defined).
        associations: [
          {
            to: { id: input.contactId },
            types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }],
          },
        ],
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn("[hubspot] createNote failed", res.status, errText);
      return { ok: false, error: `note_${res.status}` };
    }
    const body = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: String(body.id || "") };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[hubspot] createNote threw", msg);
    return { ok: false, error: msg };
  }
}
