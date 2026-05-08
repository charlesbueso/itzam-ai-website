import { type NextRequest, NextResponse } from "next/server";

import { LOCALES } from "@/lib/i18n/dictionaries";
import { attachCollaborator, validateInvite } from "@/lib/auth/invite";
import { setPendingInvite } from "@/lib/auth/pendingInvite";
import { getSessionUser } from "@/lib/auth/requireUser";
import { audit } from "@/lib/security/audit";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";

/**
 * Invite gateway.
 *
 *   GET /<locale>/invite/<id>?t=<token>
 *
 * Two outcomes depending on auth state:
 *
 *   1. Logged in  → attach as collaborator (idempotent), redirect to form.
 *   2. Logged out → drop a signed pending-invite cookie, redirect to /signup.
 *                   After the user creates an account and confirms their
 *                   email, they will be authenticated and bounced back here
 *                   to take path #1.
 *
 * The route never echoes the token to the response or to logs. Failures
 * collapse to an indistinguishable "invalid invite" redirect to /login.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  req: NextRequest,
  { params }: { params: { locale: string; id: string } }
) {
  const locale = LOCALES.includes(params.locale as any) ? params.locale : "es";
  const url = new URL(req.url);
  const token = url.searchParams.get("t");

  const fail = () =>
    NextResponse.redirect(
      new URL(`/${locale}/login?reason=invalid-invite`, url.origin)
    );

  if (!UUID_RE.test(params.id) || !token) return fail();

  // Per-(IP, questionnaire) rate-limit to slow brute-forcing.
  const ip = getClientIp(req);
  const rl = await checkRateLimit({
    bucket: "invite_redeem",
    identifier: `${ip}:${params.id}`,
    limit: 10,
    windowSeconds: 60,
  });
  if (!rl.allowed) return fail();

  const valid = await validateInvite(params.id, token);
  if (!valid) {
    await audit({ req, action: "invite_redeem_failed", targetId: params.id });
    return fail();
  }

  const user = await getSessionUser();

  if (!user) {
    // Stash the invite and send to signup.
    setPendingInvite(params.id, token);
    return NextResponse.redirect(
      new URL(`/${locale}/signup`, url.origin)
    );
  }

  // Attach this authenticated user as a collaborator (idempotent) and
  // bounce to the form. Works for the original recipient, returning users,
  // and shared-link colleagues alike.
  await attachCollaborator(params.id, user.id);
  await audit({
    req,
    actorId: user.id,
    actorEmail: user.email,
    action: "invite_redeem_ok",
    targetId: params.id,
  });

  return NextResponse.redirect(
    new URL(`/${locale}/cuestionario/${params.id}`, url.origin)
  );
}

