"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  GA_MEASUREMENT_ID,
  applyInternalFlagFromUrl,
  isInternal,
  isTrackedHost,
  pageArea,
  track,
} from "@/lib/analytics/gtag";
import { captureAttribution } from "@/lib/analytics/attribution";

/**
 * Google Analytics 4 — loaded site-wide via the root layout.
 *
 * - Only loads on the production marketing hosts (itzam.ai), never on Vercel
 *   previews, localhost or app.itzam.ai — those were ~1/3 of recorded visits.
 * - Team browsers are tagged `traffic_type=internal` (cookie set on admin
 *   login, or by visiting any page with `?internal=1`). Activate the
 *   "Internal Traffic" data filter in GA4 to exclude them.
 * - `?ga_debug=1` turns on debug_mode so events show up in GA4 DebugView.
 * - Captures first/last-touch attribution for lead forms (all hosts).
 * - One delegated click listener tracks CTA clicks to the assessment/contact
 *   pages and mailto: clicks — no per-link wiring needed.
 */
export default function Analytics() {
  const [enabled, setEnabled] = useState(false);
  const [config, setConfig] = useState<{ internal: boolean; debug: boolean }>({
    internal: false,
    debug: false,
  });

  useEffect(() => {
    captureAttribution();
    if (process.env.NEXT_PUBLIC_DISABLE_ANALYTICS === "1") return;
    if (!isTrackedHost()) return;
    applyInternalFlagFromUrl();
    setConfig({
      internal: isInternal(),
      debug: new URLSearchParams(window.location.search).get("ga_debug") === "1",
    });
    setEnabled(true);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const location = pageArea();
      if (href.startsWith("mailto:")) {
        track("contact_email_click", { form_location: location });
        return;
      }
      const m = href.match(/^\/(?:en|es)\/(assessment|contact)(?:[/?#]|$)/);
      if (m && pageArea(href) !== location) {
        track("cta_click", {
          cta_target: m[1],
          link_text: (a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
          form_location: location,
        });
      }
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!enabled) return null;

  const cfg: Record<string, unknown> = { anonymize_ip: true };
  if (config.internal) cfg.traffic_type = "internal";
  if (config.debug) cfg.debug_mode = true;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', ${JSON.stringify(cfg)});
        `}
      </Script>
    </>
  );
}
