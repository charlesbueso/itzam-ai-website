import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/requireUser";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { audit } from "@/lib/security/audit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { UpdateQuestionnaire } from "@/lib/validation/schemas";

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
    bucket: "admin_edit_questionnaire",
    identifier: user.id,
    limit: 120,
    windowSeconds: 3600,
  });
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body;
  try {
    body = UpdateQuestionnaire.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (Object.keys(body).length === 0) {
    return NextResponse.json({ ok: true });
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
  // Only editable while draft. After issue-link the auth user is bound to
  // the original email, so changing it would break the magic link.
  if (q.status !== "draft") {
    return NextResponse.json({ error: "wrong_status" }, { status: 409 });
  }

  const { error: upErr } = await admin
    .from("questionnaires")
    .update(body)
    .eq("id", params.id)
    .eq("status", "draft"); // belt-and-suspenders against TOCTOU
  if (upErr) {
    console.error("questionnaire patch failed", upErr);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  await audit({
    req,
    actorId: user.id,
    actorEmail: user.email,
    action: "questionnaire.edit",
    targetId: params.id,
    metadata: { fields: Object.keys(body) },
  });

  return NextResponse.json({ ok: true });
}
