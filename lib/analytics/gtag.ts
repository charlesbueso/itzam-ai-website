/**
 * GA4 helpers — browser-only, safe to import from any client component.
 *
 * GA only loads on the production marketing hosts (see `isTrackedHost`), so
 * preview deployments, localhost and the client app never pollute the data.
 * On any other host `track()` is a no-op that logs to the console in dev, so
 * events can still be verified locally.
 *
 * Event taxonomy (see docs/analytics-and-seo.md):
 *   generate_lead        { lead_type: "contact" | "assessment", form_location, ... }  ← key event
 *   assessment_start     { form_location }
 *   assessment_error     { reason }
 *   cta_click            { cta_target, link_text, form_location }
 *   contact_email_click  { form_location }
 *   language_switch      { from_language, to_language }
 */

export const GA_MEASUREMENT_ID = "G-JVXTVD9NXY";

/** Hosts whose traffic belongs in the GA4 property. */
const TRACKED_HOSTS = new Set(["itzam.ai", "www.itzam.ai"]);

/** Cookie that marks a browser as team/internal traffic (GA `traffic_type`). */
export const INTERNAL_COOKIE = "itzam_internal";

type GtagParams = Record<string, string | number | boolean | undefined | null>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function isTrackedHost(hostname: string = typeof window !== "undefined" ? window.location.hostname : ""): boolean {
  if (process.env.NEXT_PUBLIC_GA_FORCE === "1") return true;
  return TRACKED_HOSTS.has(hostname.toLowerCase());
}

export function track(event: string, params: GtagParams = {}): void {
  if (typeof window === "undefined") return;
  const clean: GtagParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") clean[k] = v;
  }
  if (typeof window.gtag === "function") {
    window.gtag("event", event, clean);
  } else if (process.env.NODE_ENV !== "production") {
    console.debug("[ga] (not loaded on this host)", event, clean);
  }
}

/**
 * A coarse, stable name for where on the site an interaction happened — used
 * as `form_location` so reports can split e.g. home-page vs contact-page leads.
 */
export function pageArea(pathname: string = typeof window !== "undefined" ? window.location.pathname : ""): string {
  const rest = pathname.replace(/^\/(en|es)(?=\/|$)/, "");
  if (!rest || rest === "/") return "home";
  return rest.replace(/^\//, "").split("/")[0] || "home";
}

// ─────────────────────────── internal traffic ───────────────────────────

function cookieDomain(): string {
  const h = window.location.hostname;
  return h === "itzam.ai" || h.endsWith(".itzam.ai") ? "; domain=.itzam.ai" : "";
}

export function isInternal(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c === `${INTERNAL_COOKIE}=1`);
}

/** `?internal=1` flags this browser as team traffic for a year; `?internal=0` clears it. */
export function applyInternalFlagFromUrl(): void {
  const flag = new URLSearchParams(window.location.search).get("internal");
  if (flag === "1") {
    document.cookie = `${INTERNAL_COOKIE}=1; path=/; max-age=31536000; samesite=lax${cookieDomain()}`;
  } else if (flag === "0") {
    document.cookie = `${INTERNAL_COOKIE}=; path=/; max-age=0; samesite=lax${cookieDomain()}`;
  }
}
