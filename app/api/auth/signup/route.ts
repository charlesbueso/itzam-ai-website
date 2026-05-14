import { NextResponse } from "next/server";
import { z } from "zod";

import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { audit } from "@/lib/security/audit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { readPendingInvite } from "@/lib/auth/pendingInvite";
import { validateInvite } from "@/lib/auth/invite";
import { getResend, RESEND_FROM, RESEND_REPLY_TO, safeHeader } from "@/lib/email/resend";
import { signupConfirmEmail } from "@/lib/email/templates";
import { upsertContact } from "@/lib/hubspot/client";

/**
 * Sign-up endpoint.
 *
 * Gates:
 *   - Same-origin (anti-CSRF for cookie-based auth)
 *   - IP rate limit
 *   - Must have a valid pending-invite cookie
 *   - Re-validates the invite (still alive, not expired)
 *
 * Behavior:
 *   - Creates a Supabase auth user with `email_confirm: false`, sets the
 *     password.
 *   - Triggers a confirmation email by calling `inviteUserByEmail` is NOT
 *     correct (different flow). Instead we use `auth.admin.generateLink`
 *     with type "signup" — this creates the user (or reuses an existing
 *     unconfirmed one) and gives us a confirmation URL we redirect to via
 *     Supabase's mailer if SMTP is configured.
 *   - We let Supabase send the actual confirmation email (configured SMTP
 *     or the built-in service in dev). The redirect target is our
 *     `/auth/confirm` route, which calls verifyOtp + lands the user back
 *     at the invite gateway.
 *
 * If the user already exists (confirmed): return { error: "exists" }.
 *   The form steers them to /login.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(10).max(128),
  turnstileToken: z.string().max(2048).optional().default(""),
});

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }

  const ip = getClientIp(req);
  const rl = await checkRateLimit({
    bucket: "signup",
    identifier: ip,
    limit: 10,
    windowSeconds: 3600,
  });
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const captchaOk = await verifyTurnstile(body.turnstileToken, ip);
  if (!captchaOk) {
    await audit({
      req,
      action: "signup_captcha_failed",
      actorEmail: body.email,
    });
    return NextResponse.json({ error: "captcha" }, { status: 400 });
  }

  // Must come from a valid invite.
  const pending = readPendingInvite();
  if (!pending) {
    return NextResponse.json({ error: "no_invite" }, { status: 403 });
  }
  const valid = await validateInvite(pending.id, pending.t);
  if (!valid) {
    return NextResponse.json({ error: "invalid_invite" }, { status: 403 });
  }

  const admin = getSupabaseAdminClient();
  const baseUrl = process.env.APP_BASE_URL || "https://app.itzam.ai";
  const locale = (valid.preferred_locale as string) || "es";

  // After confirming their email, send them through /auth/confirm which
  // verifies the OTP, sets cookies, and redirects to the invite gateway
  // (which will attach them as collaborator and land them on the form).
  const next = `/${locale}/invite/${pending.id}?t=${pending.t}`;
  const emailRedirectTo = `${baseUrl}/${locale}/auth/confirm?next=${encodeURIComponent(next)}`;

  // Create the user (unconfirmed, with password).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: false,
  });

  if (createErr) {
    const msg = (createErr.message || "").toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      // User exists — check if they're unconfirmed (passwordless ghost created
      // by an older version of issue-link). If so, set their password and
      // resend confirmation. If already confirmed, steer them to login.
      const { data: listData } = await admin.auth.admin.listUsers();
      const ghost = listData?.users?.find(
        (u) => (u.email || "").toLowerCase() === body.email.toLowerCase()
      );
      if (ghost && !ghost.email_confirmed_at) {
        // Unconfirmed — update password so they can complete the flow.
        await admin.auth.admin.updateUserById(ghost.id, { password: body.password });
        // Fall through to generateLink below using the ghost user.
        // We can reuse the same generateLink call since the user now has a password.
      } else {
        return NextResponse.json({ error: "exists" }, { status: 409 });
      }
    } else if (msg.includes("password") && msg.includes("weak")) {
      return NextResponse.json({ error: "weak_password" }, { status: 400 });
    } else {
      console.error("signup createUser failed", createErr);
      return NextResponse.json({ error: "create_failed" }, { status: 500 });
    }
  }

  // Now generate a signup confirmation link, then send the confirmation
  // email ourselves via Resend. We do NOT rely on Supabase's automatic mailer
  // because `admin.generateLink` does not trigger one — it only returns a
  // URL. Sending via Resend gives us our verified domain + brand template.
  //
  // We extract `hashed_token` from the link and build a PKCE-style URL that
  // hits our `/auth/confirm` route → verifyOtp → cookie session.
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "signup",
    email: body.email,
    password: body.password,
    options: { redirectTo: emailRedirectTo },
  });
  if (linkErr) {
    console.error("signup generateLink failed", linkErr);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }

  const tokenHash = linkData?.properties?.hashed_token;
  if (!tokenHash) {
    console.error("signup generateLink returned no hashed_token", linkData);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
  const confirmUrl = `${baseUrl}/${locale}/auth/confirm?token_hash=${tokenHash}&type=signup&next=${encodeURIComponent(next)}`;

  const resend = getResend();
  if (!resend) {
    console.error("RESEND_API_KEY not configured — cannot send signup email");
    return NextResponse.json({ error: "email_not_configured" }, { status: 500 });
  }

  const tpl = signupConfirmEmail({
    confirmUrl,
    locale: locale === "en" ? "en" : "es",
  });
  const { error: sendErr } = await resend.emails.send({
    from: RESEND_FROM,
    to: body.email,
    replyTo: RESEND_REPLY_TO,
    subject: safeHeader(tpl.subject),
    html: tpl.html,
    text: tpl.text,
  });
  if (sendErr) {
    console.error("signup resend send failed", sendErr);
    return NextResponse.json({ error: "email_send_failed" }, { status: 500 });
  }
  console.log(`📧 signup confirmation sent to ${body.email}`);

  await audit({
    req,
    actorId: created.user?.id,
    actorEmail: body.email,
    action: "signup_initiated",
    targetId: pending.id,
  });

  // Non-blocking HubSpot CRM sync. We sync at signup-initiated (before email
  // confirmation) so the contact exists in HubSpot the moment they enter
  // their email; if they never confirm, you can filter on
  // `itzam_signup_confirmed` later. Update that property elsewhere when the
  // confirm link is hit.
  void upsertContact({
    email: body.email,
    lifecyclestage: "lead",
    source: "app_signup",
    properties: {
      itzam_invite_id: pending.id,
      itzam_signup_confirmed: false,
    },
  }).then((r) => {
    if (!r.ok && r.error !== "hubspot_not_configured") {
      console.warn("[hubspot] signup sync failed:", r.error);
    }
  });

  return NextResponse.json({ ok: true });
}
