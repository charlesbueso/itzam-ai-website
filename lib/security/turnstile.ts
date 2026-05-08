import "server-only";

/**
 * Verifies a Cloudflare Turnstile token against Cloudflare's siteverify
 * endpoint. Tokens are single-use and tied to the issuing site key.
 *
 * Behavior:
 *  - If `TURNSTILE_SECRET_KEY` is unset and we're NOT in production, returns
 *    true (lets local dev work without the widget).
 *  - In production with the secret unset, returns false (fail-closed).
 *  - Empty / missing token → false.
 *  - Network or parse error → false (fail-closed).
 */
export async function verifyTurnstile(
  token: string | undefined | null,
  ip: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  if (!token || typeof token !== "string") return false;

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret,
          response: token,
          remoteip: ip,
        }),
        cache: "no-store",
      }
    );
    if (!res.ok) return false;
    const data = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    if (!data.success) {
      console.warn("turnstile verify failed", data["error-codes"]);
      return false;
    }
    return true;
  } catch (e) {
    console.error("turnstile verify error", e);
    return false;
  }
}
