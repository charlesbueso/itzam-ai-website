import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";

import { requireUser } from "@/lib/auth/requireUser";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { audit } from "@/lib/security/audit";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { processJobs } from "@/lib/jobs/processor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  const user = await requireUser("/login");

  const rl = await checkRateLimit({
    bucket: "submit",
    identifier: user.id,
    limit: 5,
    windowSeconds: 3600,
  });
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const supabase = getSupabaseServerClient();
  const admin = getSupabaseAdminClient();

  // Load questionnaire (RLS-gated).
  const { data: q, error: qErr } = await supabase
    .from("questionnaires")
    .select("id, status, client_name, client_email, preferred_locale, assigned_user_id")
    .eq("id", params.id)
    .maybeSingle();

  if (qErr || !q) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  // Defense in depth: RLS already enforced this, but check explicitly.
  // Allow the originally-assigned user OR any collaborator on this questionnaire.
  if (q.assigned_user_id !== user.id) {
    const { data: collab } = await admin
      .from("questionnaire_collaborators")
      .select("user_id")
      .eq("questionnaire_id", q.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!collab) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }
  if (q.status === "completed") {
    // Idempotent — already submitted.
    return NextResponse.json({ ok: true, already: true });
  }
  if (q.status !== "sent" && q.status !== "in_progress") {
    return NextResponse.json({ error: "wrong_status" }, { status: 409 });
  }

  // Validate completeness: every required question has a non-empty answer.
  const { data: questions } = await supabase
    .from("questions")
    .select("id, type, required")
    .eq("questionnaire_id", q.id);

  const { data: answers } = await supabase
    .from("answers")
    .select("question_id, value")
    .eq("questionnaire_id", q.id);

  const ansMap = new Map((answers || []).map((a) => [a.question_id, a.value]));
  for (const qu of questions || []) {
    if (!qu.required) continue;
    const v = ansMap.get(qu.id);
    if (qu.type === "multi") {
      if (!Array.isArray(v) || (v as unknown[]).length === 0) {
        return NextResponse.json({ error: "incomplete" }, { status: 400 });
      }
    } else {
      if (typeof v !== "string" || v.trim() === "") {
        return NextResponse.json({ error: "incomplete" }, { status: 400 });
      }
    }
  }

  // Atomic transition: only flips if currently sent|in_progress. If two
  // concurrent submits land, only one updates a row (RETURNING).
  const { data: flipped, error: flipErr } = await admin
    .from("questionnaires")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      // Invalidate token at completion.
      invite_token_hash: null,
    })
    .eq("id", q.id)
    .in("status", ["sent", "in_progress"])
    .select("id")
    .maybeSingle();

  if (flipErr) {
    console.error("submit flip failed", flipErr);
    return NextResponse.json({ error: "submit_failed" }, { status: 500 });
  }
  if (!flipped) {
    // Lost the race — already completed.
    return NextResponse.json({ ok: true, already: true });
  }

  // Enqueue outbox jobs (idempotent thanks to UNIQUE(questionnaire_id, kind)).
  const jobs = ["drive", "client_email", "admin_email"].map((kind) => ({
    questionnaire_id: q.id,
    kind,
    status: "pending",
    next_retry_at: new Date().toISOString(),
  }));
  const { data: upserted, error: upsertErr } = await admin
    .from("submission_jobs")
    .upsert(jobs, { onConflict: "questionnaire_id,kind" })
    .select("id, kind, status, next_retry_at");
  if (upsertErr) {
    console.error("submit enqueue jobs failed", upsertErr);
  } else {
    console.log(`📥 enqueued ${upserted?.length ?? 0} job(s) for ${q.id}:`, upserted);
  }

  await audit({
    req,
    actorId: user.id,
    actorEmail: user.email,
    action: "questionnaire.submit",
    targetId: q.id,
  });

  // Run drive + email jobs *after* the response is sent so the user sees the
  // "thanks" page immediately instead of waiting 6–9s for Sheets + Resend.
  // The cron will still retry anything that fails. `waitUntil` keeps the
  // serverless function alive on Vercel past the response; locally it just
  // resolves whenever the promise does.
  waitUntil(
    processJobs({ limit: 3, questionnaireId: q.id }).catch((e) => {
      console.error("deferred job processing failed", e);
    })
  );

  return NextResponse.json({ ok: true });
}
