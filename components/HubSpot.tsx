"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

/** Production hosts only — keeps previews/localhost out of HubSpot analytics. */
const HUBSPOT_HOSTS = new Set(["itzam.ai", "www.itzam.ai", "app.itzam.ai"]);

/**
 * HubSpot tracking code (`_hsq`) — site-wide.
 *
 * Loads the official HubSpot JS tracker for your Portal ID. Once loaded,
 * any code can call `hsTrack.identify({ email, ...traits })` and
 * `hsTrack.trackPageView()` to associate browser sessions with CRM contacts.
 *
 * Set `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` in env. If unset, this renders
 * nothing (safe no-op for local dev). Only loads on production hosts.
 *
 * GDPR/consent: HubSpot respects a `_hsp.push(['doNotTrack'])` call. If you
 * add a consent banner later, wire it through here.
 */
export default function HubSpot() {
  const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;
  const [onProdHost, setOnProdHost] = useState(false);
  useEffect(() => {
    setOnProdHost(HUBSPOT_HOSTS.has(window.location.hostname.toLowerCase()));
  }, []);

  if (!portalId || !onProdHost) return null;
  if (process.env.NEXT_PUBLIC_DISABLE_ANALYTICS === "1") return null;

  return (
    <Script
      id="hs-script-loader"
      src={`//js.hs-scripts.com/${portalId}.js`}
      strategy="afterInteractive"
      async
      defer
    />
  );
}

// ─────────────────────────── client helpers ───────────────────────────
// These are safe to import from any client component. They no-op if the
// tracker hasn't loaded yet (e.g. ad-blocker), so call sites don't need to
// guard.

type HsqArgs =
  | ["identify", Record<string, unknown>]
  | ["trackPageView"]
  | ["setPath", string]
  | ["trackEvent", { id: string; value?: number } & Record<string, unknown>];

declare global {
  interface Window {
    _hsq?: HsqArgs[];
  }
}

function push(args: HsqArgs) {
  if (typeof window === "undefined") return;
  window._hsq = window._hsq || [];
  window._hsq.push(args);
}

export const hsTrack = {
  /** Associate the current browser session with a CRM contact. */
  identify(traits: { email: string } & Record<string, unknown>) {
    push(["identify", traits]);
  },
  /** Manually fire a page view (useful after client-side navigation). */
  trackPageView() {
    push(["trackPageView"]);
  },
  /** Update the recorded path before the next page view. */
  setPath(path: string) {
    push(["setPath", path]);
  },
  /** Custom event (requires Marketing Hub Enterprise for full features). */
  trackEvent(event: { id: string; value?: number } & Record<string, unknown>) {
    push(["trackEvent", event]);
  },
};

/**
 * Tie this browser's HubSpot visitor history (original source, pages seen)
 * to the CRM contact a form just created. `identify` is only sent with the
 * next tracked event, hence the page view right after it.
 */
export function identifyLead(traits: { email: string; firstname?: string; lastname?: string; company?: string }) {
  hsTrack.identify(traits);
  hsTrack.trackPageView();
}
