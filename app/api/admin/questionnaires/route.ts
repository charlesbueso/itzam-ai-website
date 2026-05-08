import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/requireUser";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { audit } from "@/lib/security/audit";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { CreateQuestionnaire } from "@/lib/validation/schemas";
import { BASE_QUESTIONS } from "@/lib/intake/baseQuestions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }
  const user = await requireAdmin();

  const rl = await checkRateLimit({
    bucket: "admin_create_q",
    identifier: user.id,
    limit: 30,
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

  const parsed = CreateQuestionnaire.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  // Insert questionnaire — RLS allows admins.
  const { data: q, error } = await supabase
    .from("questionnaires")
    .insert({
      client_name: parsed.data.client_name,
      client_email: parsed.data.client_email,
      preferred_locale: parsed.data.preferred_locale,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !q) {
    console.error("create questionnaire failed", error);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }

  // Seed the 15 base questions via service role (atomic, no partial state).
  const admin = getSupabaseAdminClient();
  const rows = BASE_QUESTIONS.map((b) => ({
    questionnaire_id: q.id,
    position: b.position,
    block_es: b.block_es,
    block_en: b.block_en,
    type: b.type,
    label_es: b.label_es,
    label_en: b.label_en,
    options: b.options,
    required: b.required,
    multiline: !!b.multiline,
  }));
  const { error: qErr } = await admin.from("questions").insert(rows);
  if (qErr) {
    // Roll back the questionnaire to keep state consistent.
    await admin.from("questionnaires").delete().eq("id", q.id);
    console.error("seed questions failed", qErr);
    return NextResponse.json({ error: "seed_failed" }, { status: 500 });
  }

  await audit({
    req,
    actorId: user.id,
    actorEmail: user.email,
    action: "questionnaire.create",
    targetId: q.id,
    metadata: { client_email: parsed.data.client_email },
  });

  return NextResponse.json({ id: q.id }, { status: 201 });
}
