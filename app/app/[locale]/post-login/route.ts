import { type NextRequest, NextResponse } from "next/server";

import { LOCALES } from "@/lib/i18n/dictionaries";
import { getSessionUser } from "@/lib/auth/requireUser";
import { readPendingInvite, clearPendingInvite } from "@/lib/auth/pendingInvite";
import { validateInvite } from "@/lib/auth/invite";
import { findClientLandingQuestionnaire } from "@/lib/auth/clientLanding";
import { INTERNAL_COOKIE } from "@/lib/analytics/gtag";

/**
 * Post-login dispatcher.
 *
 * Decides where a freshly-logged-in user should land:
 *   1. Explicit `?next=` (validated against an allowlist) — supports
 *      bookmarked deep links from any device.
 *   2. Stashed pending invite cookie → bounce through invite gateway.
 *   3. Admin → /admin (and flagged as internal traffic for GA4).
 *   4. Returning client → most recent active questionnaire they own or
 *      collaborate on.
 *   5. Otherwise → /login?reason=no-invite.
 *
 * The invite gateway re-validates the invite, so it's safe to honor.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NEXT_ALLOWLIST = [
  /^\/(?:en|es)\/admin(?:\/[A-Za-z0-9-_/]*)?$/,
  /^\/(?:en|es)\/cuestionario\/[0-9a-f-]{36}(?:\/gracias)?$/,
  /^\/(?:en|es)\/invite\/[0-9a-f-]{36}(?:\?t=[A-Za-z0-9_-]+)?$/,
];

function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return NEXT_ALLOWLIST.some((rx) => rx.test(raw)) ? raw : null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { locale: string } }
) {
  const locale = LOCALES.includes(params.locale as any) ? params.locale : "es";
  const url = new URL(req.url);

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL(`/${locale}/login`, url.origin));
  }

  // Admins are the team: tag their browser as internal traffic for GA4
  // across *.itzam.ai, so our own visits to the marketing site stop counting.
  const redirectTo = (path: string) => {
    const res = NextResponse.redirect(new URL(path, url.origin));
    if (user.isAdmin) {
      const onItzam = url.hostname === "itzam.ai" || url.hostname.endsWith(".itzam.ai");
      res.cookies.set(INTERNAL_COOKIE, "1", {
        path: "/",
        maxAge: 365 * 24 * 3600,
        sameSite: "lax",
        secure: url.protocol === "https:",
        ...(onItzam ? { domain: ".itzam.ai" } : {}),
      });
    }
    return res;
  };

  // 1. Explicit next (bookmarked link).
  const next = safeNext(url.searchParams.get("next"));
  if (next) {
    return redirectTo(next);
  }

  // 2. Pending invite cookie (signup → invite flow).
  const pending = readPendingInvite();
  if (pending) {
    const valid = await validateInvite(pending.id, pending.t);
    if (valid) {
      clearPendingInvite();
      return redirectTo(`/${locale}/invite/${pending.id}?t=${pending.t}`);
    }
    // Stale cookie — clear and fall through.
    clearPendingInvite();
  }

  // 3. Admin.
  if (user.isAdmin) {
    return redirectTo(`/${locale}/admin`);
  }

  // 4. Returning client — find their questionnaire.
  const landing = await findClientLandingQuestionnaire(user.id);
  if (landing) {
    const target =
      landing.status === "completed"
        ? `/${locale}/cuestionario/${landing.id}/gracias`
        : `/${locale}/cuestionario/${landing.id}`;
    return redirectTo(target);
  }

  // 5. Authenticated client without a known questionnaire.
  return redirectTo(`/${locale}/login?reason=no-invite`);
}
