import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/requireUser";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { audit } from "@/lib/security/audit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; qid: string } }
) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }
  if (!UUID_RE.test(params.id) || !UUID_RE.test(params.qid)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const user = await requireAdmin();

  const rl = await checkRateLimit({
    bucket: "admin_delete_question",
    identifier: user.id,
    limit: 120,
    windowSeconds: 3600,
  });
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const admin = getSupabaseAdminClient();

  // Status gate.
  const { data: q, error: qErr } = await admin
    .from("questionnaires")
    .select("id, status")
    .eq("id", params.id)
    .maybeSingle();
  if (qErr || !q) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (q.status !== "draft") {
    return NextResponse.json({ error: "wrong_status" }, { status: 409 });
  }

  // Only allow deletion of custom questions belonging to this questionnaire.
  const { data: target, error: tErr } = await admin
    .from("questions")
    .select("id, is_custom")
    .eq("id", params.qid)
    .eq("questionnaire_id", params.id)
    .maybeSingle();
  if (tErr || !target) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (!target.is_custom) {
    return NextResponse.json({ error: "base_question_not_deletable" }, { status: 409 });
  }

  const { error: delErr } = await admin
    .from("questions")
    .delete()
    .eq("id", params.qid)
    .eq("questionnaire_id", params.id)
    .eq("is_custom", true);
  if (delErr) {
    console.error("delete custom question failed", delErr);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }

  await audit({
    req,
    actorId: user.id,
    actorEmail: user.email,
    action: "questionnaire.delete_custom_question",
    targetId: params.id,
    metadata: { question_id: params.qid },
  });

  return NextResponse.json({ ok: true });
}
