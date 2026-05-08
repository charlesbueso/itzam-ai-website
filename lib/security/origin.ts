import "server-only";

/**
 * Verifies the request originated from an allowed origin. Used as a
 * lightweight CSRF defense for state-changing route handlers.
 *
 * Returns true if Origin is missing AND Referer is missing (e.g. server-to-
 * server with no browser). For browser-originated POSTs, Origin is always
 * sent by modern browsers.
 */
export function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const allowed = getAllowedOrigins();

  if (!origin && !referer) {
    // Allow internal cron / curl in dev only.
    return process.env.NODE_ENV !== "production";
  }
  if (origin && allowed.has(origin)) return true;
  if (referer) {
    try {
      const r = new URL(referer);
      if (allowed.has(r.origin)) return true;
    } catch {
      return false;
    }
  }
  return false;
}

function getAllowedOrigins(): Set<string> {
  const set = new Set<string>();
  if (process.env.APP_BASE_URL) set.add(new URL(process.env.APP_BASE_URL).origin);
  set.add("https://app.itzam.ai");
  if (process.env.NODE_ENV !== "production") {
    set.add("http://localhost:3000");
    set.add("http://127.0.0.1:3000");
  }
  return set;
}
