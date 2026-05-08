import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/requireUser";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { audit } from "@/lib/security/audit";
import { generateInviteToken } from "@/lib/security/tokens";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { processJobs } from "@/lib/jobs/processor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const INVITE_TTL_DAYS = 14;

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

  const user = await requireAdmin();

  const rl = await checkRateLimit({
    bucket: "admin_issue_link",
    identifier: user.id,
    limit: 10,
    windowSeconds: 3600,
  });
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const admin = getSupabaseAdminClient();

  // Fetch questionnaire (admin client; we will gate on status).
  const { data: q, error: qErr } = await admin
    .from("questionnaires")
    .select("id, client_email, client_name, preferred_locale, status, assigned_user_id")
    .eq("id", params.id)
    .maybeSingle();

  if (qErr || !q) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (q.status === "completed" || q.status === "cancelled") {
    return NextResponse.json({ error: "wrong_status" }, { status: 409 });
  }

  // Generate a fresh invite token (always rotates).
  const { plaintext, hash } = generateInviteToken();
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 3600 * 1000);

  const baseUrl = process.env.APP_BASE_URL || "https://app.itzam.ai";
  const locale = (q.preferred_locale as string) || "es";
  const inviteUrl = `${baseUrl}/${locale}/invite/${q.id}?t=${plaintext}`;

  // Persist token rotation atomically. Single UPDATE so two concurrent
  // requests can't both succeed. Note: the Supabase magiclink hashed_token
  // is generated lazily at redeem time (see /invite/[id]/route.ts) so it
  // doesn't go stale and so the same invite URL can be redeemed by multiple
  // people on the client side until it expires.
  const { error: updErr } = await admin
    .from("questionnaires")
    .update({
      invite_token_hash: hash,
      invite_token_expires_at: expiresAt.toISOString(),
      invite_token_uses_count: 0,
      invite_token_last_used_at: null,
      invite_url: inviteUrl,
      status: q.status === "draft" ? "sent" : q.status,
      sent_at: q.status === "draft" ? new Date().toISOString() : undefined,
    })
    .eq("id", q.id);

  if (updErr) {
    console.error("issue-link update failed", updErr);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  await audit({
    req,
    actorId: user.id,
    actorEmail: user.email,
    action: "questionnaire.issue_link",
    targetId: q.id,
    metadata: { rotated: q.status !== "draft" },
  });

  // Queue (or no-op upsert if already there) a client-folder job and try
  // it immediately. Failures are absorbed: the cron will retry. The link
  // is still issued — the client folder is a nice-to-have at this point.
  await admin
    .from("submission_jobs")
    .upsert(
      {
        questionnaire_id: q.id,
        kind: "client_folder",
        status: "pending",
        next_retry_at: new Date().toISOString(),
      },
      { onConflict: "questionnaire_id,kind", ignoreDuplicates: false }
    );
  // Fire-and-forget: don't block the response on Drive.
  processJobs({ questionnaireId: q.id, limit: 1 }).catch((e) =>
    console.error("client_folder immediate run failed", e)
  );

  return NextResponse.json({
    invite_url: inviteUrl,
    expires_at: expiresAt.toISOString(),
  });
}
