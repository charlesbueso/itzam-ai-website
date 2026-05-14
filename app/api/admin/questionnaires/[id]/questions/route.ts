import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/requireUser";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { audit } from "@/lib/security/audit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { CustomQuestionCreate, QuestionsBatchPatch } from "@/lib/validation/schemas";

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

// POST: append a custom question. Locked once the questionnaire leaves draft.
const CUSTOM_BLOCK_ES = "Preguntas adicionales";
const CUSTOM_BLOCK_EN = "Additional questions";
const MAX_CUSTOM_PER_QUESTIONNAIRE = 20;

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
    bucket: "admin_add_question",
    identifier: user.id,
    limit: 60,
    windowSeconds: 3600,
  });
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body;
  try {
    body = CustomQuestionCreate.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();

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

  // Count existing custom questions and find next position.
  const { data: existing, error: exErr } = await admin
    .from("questions")
    .select("position, is_custom")
    .eq("questionnaire_id", params.id)
    .order("position", { ascending: false });
  if (exErr) {
    return NextResponse.json({ error: "lookup_failed" }, { status: 500 });
  }
  const customCount = (existing || []).filter((r) => r.is_custom).length;
  if (customCount >= MAX_CUSTOM_PER_QUESTIONNAIRE) {
    return NextResponse.json({ error: "limit_reached" }, { status: 409 });
  }
  const nextPosition = (existing && existing[0]?.position ? existing[0].position : 0) + 1;

  const { data: inserted, error: insErr } = await admin
    .from("questions")
    .insert({
      questionnaire_id: params.id,
      position: nextPosition,
      block_es: CUSTOM_BLOCK_ES,
      block_en: CUSTOM_BLOCK_EN,
      type: body.type,
      label_es: body.label_es,
      label_en: body.label_en,
      options: body.options,
      required: body.required,
      multiline: body.multiline,
      is_custom: true,
    })
    .select("id, position, block_es, block_en, type, label_es, label_en, options, required, multiline, is_custom")
    .single();

  if (insErr || !inserted) {
    console.error("add custom question failed", insErr);
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  await audit({
    req,
    actorId: user.id,
    actorEmail: user.email,
    action: "questionnaire.add_custom_question",
    targetId: params.id,
    metadata: { question_id: inserted.id, type: body.type },
  });

  return NextResponse.json({ question: inserted }, { status: 201 });
}
