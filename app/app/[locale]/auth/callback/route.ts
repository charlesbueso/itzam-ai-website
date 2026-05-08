import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { LOCALES } from "@/lib/i18n/dictionaries";

/**
 * OAuth/magic-link callback. Exchanges the code for a session, then redirects
 * to a path validated against an allowlist (anti open-redirect).
 */
const NEXT_ALLOWLIST = [
  /^\/(?:en|es)\/admin(?:\/[A-Za-z0-9-_/]*)?$/,
  /^\/(?:en|es)\/cuestionario\/[0-9a-f-]{36}(?:\/gracias)?$/,
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

export async function GET(req: NextRequest, { params }: { params: { locale: string } }) {
  const locale = LOCALES.includes(params.locale as any) ? params.locale : "es";
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"), locale);

  if (!code) {
    return NextResponse.redirect(new URL(`/${locale}/login?reason=missing-code`, url.origin));
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/${locale}/login?reason=exchange-failed`, url.origin));
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
