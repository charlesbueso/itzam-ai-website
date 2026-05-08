import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/requireUser";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { audit } from "@/lib/security/audit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { QuestionsBatchPatch } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
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
    bucket: "admin_edit_questions",
    identifier: user.id,
    limit: 300,
    windowSeconds: 3600,
  });
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body;
  try {
    body = QuestionsBatchPatch.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();

  // Status gate: only editable while draft.
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

  // Verify all question IDs belong to this questionnaire.
  const ids = body.items.map((i) => i.id);
  const { data: existing, error: exErr } = await admin
    .from("questions")
    .select("id, type")
    .eq("questionnaire_id", params.id)
    .in("id", ids);
  if (exErr || !existing || existing.length !== ids.length) {
    return NextResponse.json({ error: "invalid_questions" }, { status: 400 });
  }
  const typeById = new Map(existing.map((e) => [e.id as string, e.type as string]));

  // Reject options edits on text-type questions.
  for (const item of body.items) {
    const t = typeById.get(item.id);
    if (item.options && t === "text") {
      return NextResponse.json({ error: "options_not_allowed" }, { status: 400 });
    }
  }

  // Apply each patch (small batches; row-level updates).
  for (const item of body.items) {
    const patch: Record<string, unknown> = {};
    if (item.label_es !== undefined) patch.label_es = item.label_es;
    if (item.label_en !== undefined) patch.label_en = item.label_en;
    if (item.options !== undefined) patch.options = item.options;
    if (Object.keys(patch).length === 0) continue;
    const { error: upErr } = await admin
      .from("questions")
      .update(patch)
      .eq("id", item.id)
      .eq("questionnaire_id", params.id);
    if (upErr) {
      console.error("question patch failed", upErr);
      return NextResponse.json({ error: "update_failed" }, { status: 500 });
    }
  }

  await audit({
    req,
    actorId: user.id,
    actorEmail: user.email,
    action: "questionnaire.edit_questions",
    targetId: params.id,
    metadata: { count: body.items.length },
  });

  return NextResponse.json({ ok: true });
}
