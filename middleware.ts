import { NextRequest, NextResponse } from "next/server";

/**
 * Host-based subdomain rewrite + security headers for the authenticated app.
 *
 * - `app.itzam.ai/<path>`        → internally serves `/app/<path>`
 * - `itzam.ai/...`               → landing; `/` and un-prefixed pages are
 *                                  redirected to /en or /es (see landingRedirect)
 * - In dev, you can hit `/app/...` directly. Set `FORCE_APP_HOST=1` to also
 *   force the rewrite locally if you want to test the bare-path redirect.
 *
 * Headers (applied only on app subdomain):
 *   HSTS, no-sniff, frame-deny, strict referrer policy, permissions policy,
 *   CSP, no-store on routes that carry tokens.
 */

const APP_HOSTS = new Set([
  "app.itzam.ai",
  "app-staging.itzam.ai",
]);

const TOKEN_PATHS = [
  /^\/(?:[a-z]{2}\/)?invite\//,
  /^\/(?:[a-z]{2}\/)?auth\/callback/,
  /^\/api\/auth\/(?:login|signup)$/,
];

function isAppHost(host: string | null): boolean {
  if (!host) return false;
  const bare = host.split(":")[0].toLowerCase();
  if (APP_HOSTS.has(bare)) return true;
  if (process.env.FORCE_APP_HOST === "1" && (bare === "localhost" || bare === "127.0.0.1")) return true;
  return false;
}

function setSecurityHeaders(res: NextResponse, pathname: string) {
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  // The authenticated app subdomain must never be indexed by search engines
  // or surfaced in LLM training crawls — it only contains private workflows.
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");

  const carriesToken = TOKEN_PATHS.some((rx) => rx.test(pathname));
  if (carriesToken) {
    res.headers.set("Referrer-Policy", "no-referrer");
    res.headers.set("Cache-Control", "no-store, private");
  } else {
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }

  // CSP — Supabase needs connect-src to its origin; everything else is self.
  // In dev, Next.js React Refresh uses eval(); allow it only in development.
  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
    : "";
  const isDev = process.env.NODE_ENV !== "production";
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://va.vercel-scripts.com https://www.googletagmanager.com https://www.google-analytics.com"
    : "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://va.vercel-scripts.com https://www.googletagmanager.com https://www.google-analytics.com";
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      scriptSrc,
      `connect-src 'self' ${supabaseHost} https://*.supabase.co https://challenges.cloudflare.com https://va.vercel-scripts.com https://www.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com ws: wss:`,
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "frame-src https://challenges.cloudflare.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
}

// ─────────────────────────── landing (itzam.ai) ───────────────────────────

/** Public pages that also answer without a locale prefix (old links, typed URLs). */
const BARE_PAGES = new Set(["/services", "/assessment", "/about", "/contact", "/blog", "/privacy", "/terms"]);
/** Retired URLs that still get visits → their current page (locale-relative). */
const LEGACY_PAGES: Record<string, string> = {
  "/ai-opportunity-assessment": "/assessment",
};

/** "es" when the browser prefers Spanish over English, else "en" (x-default). */
function preferredLocale(req: NextRequest): "en" | "es" {
  const header = req.headers.get("accept-language") || "";
  const tags = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) || 0 : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of tags) {
    if (tag.startsWith("es")) return "es";
    if (tag.startsWith("en")) return "en";
  }
  return "en";
}

/**
 * `/` and un-prefixed pages redirect to the visitor's language (307 + Vary,
 * since the target depends on Accept-Language; crawlers without the header
 * land on /en, matching x-default). Legacy URLs redirect permanently.
 */
function landingRedirect(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/") || pathname.startsWith("/app")) return null;

  const prefixed = pathname.match(/^\/(en|es)(\/.*)?$/);
  if (prefixed) {
    const legacy = LEGACY_PAGES[prefixed[2] || ""];
    if (!legacy) return null;
    const url = req.nextUrl.clone();
    url.pathname = `/${prefixed[1]}${legacy}`;
    return NextResponse.redirect(url, 308);
  }

  const target = pathname === "/" ? "" : LEGACY_PAGES[pathname] ?? (BARE_PAGES.has(pathname) ? pathname : null);
  if (target === null) return null;
  const url = req.nextUrl.clone();
  url.pathname = `/${preferredLocale(req)}${target}`;
  const res = NextResponse.redirect(url, 307);
  res.headers.set("Vary", "Accept-Language");
  return res;
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host");
  const url = req.nextUrl.clone();

  if (!isAppHost(host)) {
    return landingRedirect(req) ?? NextResponse.next();
  }

  // /api/* must NOT be rewritten — route handlers live at the project root.
  // Both the landing waitlist and the app share /api.
  if (url.pathname.startsWith("/api/")) {
    const res = NextResponse.next();
    setSecurityHeaders(res, req.nextUrl.pathname);
    return res;
  }

  // Surface the URL path to server components (used by AppHeader to display
  // contextual info, e.g. the company name on the questionnaire route).
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  // Rewrite to /app/<path> if not already rewritten.
  if (!url.pathname.startsWith("/app")) {
    url.pathname = `/app${url.pathname === "/" ? "" : url.pathname}`;
    const res = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
    setSecurityHeaders(res, req.nextUrl.pathname);
    return res;
  }

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });
  setSecurityHeaders(res, req.nextUrl.pathname);
  return res;
}

export const config = {
  matcher: [
    // Skip Next internals and static files
    "/((?!_next/|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
