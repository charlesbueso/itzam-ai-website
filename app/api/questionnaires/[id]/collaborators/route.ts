import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth/requireUser";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { audit } from "@/lib/security/audit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getResend, RESEND_FROM, RESEND_REPLY_TO, safeHeader } from "@/lib/email/resend";
import { collaboratorInviteEmail } from "@/lib/email/templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_TOTAL = 4;

const InviteBody = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
}).strict();

/**
 * Authorize: caller must be a collaborator (or the original assignee) on the
 * questionnaire, and the questionnaire must still be open.
 *
 * Returns the questionnaire row on success, or a NextResponse on denial.
 */
async function authorize(questionnaireId: string, userId: string) {
  const admin = getSupabaseAdminClient();
  const { data: q, error } = await admin
    .from("questionnaires")
    .select("id, client_email, client_name, status, preferred_locale, invite_url, assigned_user_id")
    .eq("id", questionnaireId)
    .maybeSingle();
  if (error || !q) return { error: NextResponse.json({ error: "not_found" }, { status: 404 }) };
  if (q.status === "completed" || q.status === "cancelled" || q.status === "draft") {
    return { error: NextResponse.json({ error: "wrong_status" }, { status: 409 }) };
  }
  if (q.assigned_user_id !== userId) {
    const { data: row } = await admin
      .from("questionnaire_collaborators")
      .select("user_id")
      .eq("questionnaire_id", questionnaireId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!row) return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { q };
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  const user = await requireUser("/login");
  const auth = await authorize(params.id, user.id);
  if ("error" in auth) return auth.error;

  const admin = getSupabaseAdminClient();

  // Joined collaborators → resolve to emails via profiles.
  const { data: collabRows } = await admin
    .from("questionnaire_collaborators")
    .select("user_id, joined_at")
    .eq("questionnaire_id", params.id);

  const userIds = (collabRows || []).map((r) => r.user_id);
  const { data: profiles } = userIds.length
    ? await admin.from("profiles").select("id, email").in("id", userIds)
    : { data: [] as Array<{ id: string; email: string }> };
  const emailById = new Map((profiles || []).map((p) => [p.id, (p.email as string).toLowerCase()]));

  const collaborators = (collabRows || []).map((r) => ({
    user_id: r.user_id as string,
    email: emailById.get(r.user_id as string) || "",
    joined_at: r.joined_at as string,
    is_self: r.user_id === user.id,
  }));

  const { data: invites } = await admin
    .from("questionnaire_collaborator_invites")
    .select("email, invited_at")
    .eq("questionnaire_id", params.id);

  return NextResponse.json({
    collaborators,
    pending: (invites || []).map((i) => ({ email: (i.email as string).toLowerCase(), invited_at: i.invited_at })),
    max_total: MAX_TOTAL,
  });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  const user = await requireUser("/login");

  const rl = await checkRateLimit({
    bucket: "collab_invite",
    identifier: user.id,
    limit: 30,
    windowSeconds: 3600,
  });
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: z.infer<typeof InviteBody>;
  try {
    body = InviteBody.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const auth = await authorize(params.id, user.id);
  if ("error" in auth) return auth.error;
  const q = auth.q;

  if (!q.invite_url) {
    return NextResponse.json({ error: "no_invite_link" }, { status: 409 });
  }

  const inviteeEmail = body.email;
  if (inviteeEmail === user.email.toLowerCase()) {
    return NextResponse.json({ error: "self_invite" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();

  // Cap at MAX_TOTAL = current collaborators + pending invites + this one.
  const [{ count: collabCount }, { count: pendingCount }] = await Promise.all([
    admin
      .from("questionnaire_collaborators")
      .select("user_id", { count: "exact", head: true })
      .eq("questionnaire_id", params.id),
    admin
      .from("questionnaire_collaborator_invites")
      .select("email", { count: "exact", head: true })
      .eq("questionnaire_id", params.id),
  ]);
  const total = (collabCount || 0) + (pendingCount || 0);

  // If the invitee is already a collaborator, no-op success.
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", inviteeEmail)
    .maybeSingle();
  if (existingProfile) {
    const { data: existingCollab } = await admin
      .from("questionnaire_collaborators")
      .select("user_id")
      .eq("questionnaire_id", params.id)
      .eq("user_id", existingProfile.id)
      .maybeSingle();
    if (existingCollab) {
      return NextResponse.json({ ok: true, already: true });
    }
  }

  // Idempotent: if this email is already pending, just resend.
  const { data: existingInvite } = await admin
    .from("questionnaire_collaborator_invites")
    .select("email")
    .eq("questionnaire_id", params.id)
    .eq("email", inviteeEmail)
    .maybeSingle();

  if (!existingInvite && total >= MAX_TOTAL) {
    return NextResponse.json({ error: "limit_reached" }, { status: 409 });
  }

  if (!existingInvite) {
    const { error: insErr } = await admin
      .from("questionnaire_collaborator_invites")
      .insert({
        questionnaire_id: params.id,
        email: inviteeEmail,
        invited_by_user_id: user.id,
      });
    if (insErr) {
      console.error("collab invite insert failed", insErr);
      return NextResponse.json({ error: "insert_failed" }, { status: 500 });
    }
  }

  // Send the invite email (best-effort: still 200 if Resend isn't configured
  // in dev, but log loudly).
  const resend = getResend();
  if (resend) {
    const tpl = collaboratorInviteEmail({
      inviterEmail: user.email,
      inviteUrl: q.invite_url as string,
      clientName: q.client_name as string,
      locale: ((q.preferred_locale as "es" | "en") || "es"),
    });
    const { error: sendErr } = await resend.emails.send({
      from: RESEND_FROM,
      to: inviteeEmail,
      replyTo: RESEND_REPLY_TO,
      subject: safeHeader(tpl.subject),
      html: tpl.html,
      text: tpl.text,
    });
    if (sendErr) {
      console.error("collab invite resend failed", sendErr);
    }
  } else {
    console.warn("RESEND_API_KEY not set — collab invite email skipped");
  }

  await audit({
    req,
    actorId: user.id,
    actorEmail: user.email,
    action: "collab_invite_sent",
    targetId: params.id,
    metadata: { invitee: inviteeEmail },
  });

  return NextResponse.json({ ok: true });
}
