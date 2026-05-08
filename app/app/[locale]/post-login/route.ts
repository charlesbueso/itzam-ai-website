import { type NextRequest, NextResponse } from "next/server";

import { LOCALES } from "@/lib/i18n/dictionaries";
import { getSessionUser } from "@/lib/auth/requireUser";
import { readPendingInvite, clearPendingInvite } from "@/lib/auth/pendingInvite";
import { validateInvite } from "@/lib/auth/invite";

/**
 * Post-login dispatcher.
 *
 * Decides where a freshly-logged-in user should land:
 *   - If they have a pending invite stashed (e.g. they hit /signup, switched
 *     to /login, then logged in) → bounce them through the invite gateway.
 *   - Else if admin → /admin.
 *   - Else → /login?reason=forbidden (regular clients only land here via
 *     invite redemption; cold sign-in without an invite has no destination
 *     until they have a questionnaire bookmarked).
 *
 * The invite gateway re-validates the invite, so it's safe to honor.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

  const pending = readPendingInvite();
  if (pending) {
    const valid = await validateInvite(pending.id, pending.t);
    if (valid) {
      clearPendingInvite();
      return NextResponse.redirect(
        new URL(
          `/${locale}/invite/${pending.id}?t=${pending.t}`,
          url.origin
        )
      );
    }
    // Stale cookie — clear and fall through.
    clearPendingInvite();
  }

  if (user.isAdmin) {
    return NextResponse.redirect(new URL(`/${locale}/admin`, url.origin));
  }

  // Authenticated client without a pending invite. Send them to the form
  // listing if we add one later; for now, no destination, ask admin.
  return NextResponse.redirect(
    new URL(`/${locale}/login?reason=no-invite`, url.origin)
  );
}
