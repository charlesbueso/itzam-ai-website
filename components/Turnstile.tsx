"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          action?: string;
        }
      ) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
    };
  }
}

type Props = {
  /** Called with a fresh token (or "" if expired/error). */
  onToken: (token: string) => void;
  /** Optional Turnstile `action` tag for analytics. */
  action?: string;
};

/**
 * Cloudflare Turnstile widget.
 *
 * - Renders a single instance even under React strict-mode double-invokes.
 * - Calls `onToken("")` when the token expires or errors so callers can
 *   disable submission.
 * - If `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset, renders nothing and
 *   immediately reports an empty token (dev / preview without keys). The
 *   server verifier mirrors this and skips verification in non-production.
 */
export function Turnstile({ onToken, action }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Stable callback ref — Turnstile only takes the callback at render time.
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  const render = useCallback(() => {
    if (!ref.current || !window.turnstile || widgetId.current || !siteKey) {
      return;
    }
    widgetId.current = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      action,
      theme: "dark",
      callback: (t) => onTokenRef.current(t),
      "error-callback": () => onTokenRef.current(""),
      "expired-callback": () => onTokenRef.current(""),
      "timeout-callback": () => onTokenRef.current(""),
    });
  }, [siteKey, action]);

  useEffect(() => {
    if (!scriptReady) return;
    render();
    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [scriptReady, render]);

  if (!siteKey) {
    // No key configured — let the form submit; the server will skip
    // verification in non-prod, or fail-closed in prod.
    return null;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />
      <div ref={ref} />
    </>
  );
}
