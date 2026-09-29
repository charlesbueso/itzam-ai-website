/**
 * Lead attribution — browser-only.
 *
 * On every page load we look at the URL's UTM / click-id parameters and the
 * external referrer. The first touch is stored once (90 days); the last touch
 * is overwritten whenever a visit arrives from a new campaign or an external
 * site. Form submissions send both, so every lead in the Sheet, HubSpot and
 * the team emails says where it came from.
 *
 * Stored in localStorage only — nothing leaves the browser until the visitor
 * submits a form.
 */

export type Touch = {
  source: string;
  medium: string;
  campaign?: string;
  term?: string;
  content?: string;
  /** First page of the visit (path + query, no host). */
  landing_page: string;
  /** External referrer URL, if any. */
  referrer?: string;
  /** Paid click id, e.g. "gclid", when present. */
  click_id?: string;
  ts: string;
};

export type Attribution = { first?: Touch; last?: Touch };

const KEY = "itzam_attribution";
const FIRST_TOUCH_TTL_MS = 90 * 24 * 3600 * 1000;
const OWN_HOST = /(^|\.)itzam\.ai$/i;

const CLICK_IDS: [param: string, source: string, medium: string][] = [
  ["gclid", "google", "cpc"],
  ["gbraid", "google", "cpc"],
  ["wbraid", "google", "cpc"],
  ["msclkid", "bing", "cpc"],
  ["fbclid", "facebook", "social"],
  ["li_fat_id", "linkedin", "social"],
  ["ttclid", "tiktok", "cpc"],
];

const SEARCH_ENGINES = /(^|\.)(google|bing|yahoo|duckduckgo|baidu|yandex|ecosia|brave)\./i;
const SOCIAL = /(^|\.)(linkedin|lnkd|facebook|fb|instagram|t\.co|twitter|x|youtube|tiktok|whatsapp|wa)\./i;

function read(): Attribution {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}

function write(a: Attribution) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* private mode / storage disabled — attribution is best-effort */
  }
}

function clip(v: string | null | undefined, n = 200): string | undefined {
  const s = (v || "").trim();
  return s ? s.slice(0, n) : undefined;
}

/** Derive the touch for the current page view, or null for internal navigation / plain direct reloads. */
function currentTouch(): Touch | null {
  const url = new URL(window.location.href);
  const q = url.searchParams;
  const landing_page = (url.pathname + url.search).slice(0, 300);
  const ts = new Date().toISOString();

  let referrer: string | undefined;
  let refHost = "";
  try {
    if (document.referrer) {
      const r = new URL(document.referrer);
      if (!OWN_HOST.test(r.hostname) && r.hostname !== url.hostname) {
        referrer = r.origin + r.pathname;
        refHost = r.hostname.replace(/^www\./, "");
      }
    }
  } catch {
    /* malformed referrer */
  }

  const utmSource = clip(q.get("utm_source"), 100);
  if (utmSource) {
    return {
      source: utmSource.toLowerCase(),
      medium: (clip(q.get("utm_medium"), 100) || "(not set)").toLowerCase(),
      campaign: clip(q.get("utm_campaign"), 150),
      term: clip(q.get("utm_term"), 150),
      content: clip(q.get("utm_content"), 150),
      landing_page,
      referrer,
      ts,
    };
  }

  for (const [param, source, medium] of CLICK_IDS) {
    if (q.get(param)) {
      return { source, medium, landing_page, referrer, click_id: param, ts };
    }
  }

  if (refHost) {
    const medium = SEARCH_ENGINES.test(refHost + ".") ? "organic" : SOCIAL.test(refHost + ".") ? "social" : "referral";
    return { source: refHost, medium, landing_page, referrer, ts };
  }

  return null;
}

/**
 * Call once per full page load (the Analytics component does). Client-side
 * navigations keep the same referrer/URL params, so re-running is harmless.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  const a = read();
  const touch = currentTouch();
  const now = Date.now();

  const firstExpired = a.first && now - Date.parse(a.first.ts) > FIRST_TOUCH_TTL_MS;
  if (!a.first || firstExpired) {
    // A brand-new visitor with no campaign/referrer is a direct visit.
    const url = new URL(window.location.href);
    a.first = touch ?? {
      source: "(direct)",
      medium: "(none)",
      landing_page: (url.pathname + url.search).slice(0, 300),
      ts: new Date().toISOString(),
    };
  }
  if (touch) a.last = touch;
  write(a);
}

/** Attribution to attach to a lead submission. `last` falls back to `first`. */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const a = read();
  return { first: a.first, last: a.last ?? a.first };
}
