import { NextRequest, NextResponse } from "next/server";

/**
 * Host-based subdomain rewrite + security headers for the authenticated app.
 *
 * - `app.itzam.ai/<path>`        → internally serves `/app/<path>`
 * - `itzam.ai/...`               → unchanged (landing)
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
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com"
    : "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com";
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      scriptSrc,
      `connect-src 'self' ${supabaseHost} https://*.supabase.co https://challenges.cloudflare.com ws: wss:`,
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

export function middleware(req: NextRequest) {
  const host = req.headers.get("host");
  const url = req.nextUrl.clone();

  if (!isAppHost(host)) {
    return NextResponse.next();
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
