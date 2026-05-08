import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/requireUser";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AnswersBatch } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }
  const user = await requireUser("/login");

  const rl = await checkRateLimit({
    bucket: "answers_save",
    identifier: user.id,
    limit: 600,
    windowSeconds: 3600,
  });
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = AnswersBatch.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // RLS policy on `answers` already gates by ownership AND status (sent|in_progress).
  // Validate question_id ↔ questionnaire_id link via a single read.
  const qIds = parsed.data.items.map((i) => i.question_id);
  const { data: questions, error: qErr } = await supabase
    .from("questions")
    .select("id, questionnaire_id")
    .in("id", qIds);

  if (qErr) {
    return NextResponse.json({ error: "lookup_failed" }, { status: 500 });
  }
  if (!questions || questions.length !== qIds.length) {
    return NextResponse.json({ error: "invalid_questions" }, { status: 400 });
  }
  for (const q of questions) {
    if (q.questionnaire_id !== parsed.data.questionnaire_id) {
      return NextResponse.json({ error: "mismatched_question" }, { status: 400 });
    }
  }

  const rows = parsed.data.items.map((i) => ({
    questionnaire_id: parsed.data.questionnaire_id,
    question_id: i.question_id,
    value: i.value,
  }));

  const { error: upErr } = await supabase
    .from("answers")
    .upsert(rows, { onConflict: "questionnaire_id,question_id" });

  if (upErr) {
    // RLS denial typically surfaces here.
    return NextResponse.json({ error: "save_failed" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
