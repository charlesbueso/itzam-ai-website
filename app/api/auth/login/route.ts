import { NextResponse } from "next/server";

import { audit } from "@/lib/security/audit";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Server-side login proxy. Sits in front of Supabase Auth's
 * `signInWithPassword` so we can apply our own protections:
 *
 *  - Origin/Referer check (CSRF defense)
 *  - Per-IP rate limit  (slows password-spray / credential stuffing)
 *  - Per-email rate limit (slows brute force on a single account)
 *  - Audit logging of failed attempts
 *  - Generic error messages (never reveals whether email exists)
 *
 * Supabase still enforces its own brute-force protection at the platform
 * level; this is defense in depth.
 */
export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: { email?: unknown; password?: unknown; turnstileToken?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const turnstileToken =
    typeof body.turnstileToken === "string" ? body.turnstileToken : "";

  if (!EMAIL_RE.test(email) || password.length < 8 || password.length > 200) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const ip = getClientIp(req);

  // Bot challenge first — cheapest gate, blocks automation before we touch
  // the rate-limit table or Supabase Auth.
  const captchaOk = await verifyTurnstile(turnstileToken, ip);
  if (!captchaOk) {
    await audit({
      req,
      action: "login_captcha_failed",
      actorEmail: email,
    });
    return NextResponse.json({ error: "captcha" }, { status: 400 });
  }

  // Per-IP: 30 attempts / 15 min. Catches password-spray across many emails.
  const ipLimit = await checkRateLimit({
    bucket: "login_ip",
    identifier: ip,
    limit: 30,
    windowSeconds: 15 * 60,
  });
  if (!ipLimit.allowed) {
    await audit({
      req,
      action: "login_rate_limited_ip",
      actorEmail: email,
      metadata: { resetAt: ipLimit.resetAt.toISOString() },
    });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // Per-email: 8 attempts / 15 min. Slows brute force on a single account.
  const emailLimit = await checkRateLimit({
    bucket: "login_email",
    identifier: email,
    limit: 8,
    windowSeconds: 15 * 60,
  });
  if (!emailLimit.allowed) {
    await audit({
      req,
      action: "login_rate_limited_email",
      actorEmail: email,
      metadata: { resetAt: emailLimit.resetAt.toISOString() },
    });
    // Same status as IP limit — never tell the client which limit fired.
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.session) {
    await audit({
      req,
      action: "login_failed",
      actorEmail: email,
      metadata: { reason: error?.message ? "auth_error" : "no_session" },
    });
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  await audit({
    req,
    actorId: data.user?.id,
    action: "login_succeeded",
    actorEmail: email,
  });

  // Cookies were set on the response object by @supabase/ssr's cookie adapter.
  return NextResponse.json({ ok: true });
}
