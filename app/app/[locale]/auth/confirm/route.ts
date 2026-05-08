import { type NextRequest, NextResponse } from "next/server";

import { LOCALES } from "@/lib/i18n/dictionaries";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Email confirmation handler.
 *
 *   GET /<locale>/auth/confirm?token_hash=...&type=...&next=...
 *
 * Supabase sends users here from the confirmation email. We exchange the
 * one-time `token_hash` for a session via verifyOtp, which sets the auth
 * cookies through @supabase/ssr, then redirect to `next` (allowlisted to
 * prevent open redirect).
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NEXT_ALLOWLIST = [
  /^\/(?:en|es)\/admin(?:\/[A-Za-z0-9-_/]*)?$/,
  /^\/(?:en|es)\/cuestionario\/[0-9a-f-]{36}(?:\/gracias)?$/,
  /^\/(?:en|es)\/invite\/[0-9a-f-]{36}(?:\?t=[A-Za-z0-9_-]+)?$/,
];

function safeNext(raw: string | null, locale: string): string {
  const fallback = `/${locale}/admin`;
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  for (const rx of NEXT_ALLOWLIST) {
    if (rx.test(raw)) return raw;
  }
  return fallback;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { locale: string } }
) {
  const locale = LOCALES.includes(params.locale as any) ? params.locale : "es";
  const url = new URL(req.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = safeNext(url.searchParams.get("next"), locale);

  const fail = () =>
    NextResponse.redirect(
      new URL(`/${locale}/login?reason=confirm-failed`, url.origin)
    );

  if (!tokenHash || !type) return fail();
  // Restrict the OTP types we accept (defense-in-depth).
  if (!["signup", "magiclink", "email_change", "recovery", "invite"].includes(type)) {
    return fail();
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    type: type as any,
    token_hash: tokenHash,
  });
  if (error) {
    console.error("verifyOtp failed", error);
    return fail();
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
