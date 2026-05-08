import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireUser";
import { isAllowedOrigin } from "@/lib/security/origin";
import { audit } from "@/lib/security/audit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

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
  const user = await requireAdmin();
  const admin = getSupabaseAdminClient();

  const { error } = await admin
    .from("questionnaires")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      // Wipe token so any in-flight invite redemption fails.
      invite_token_hash: null,
    })
    .eq("id", params.id)
    .in("status", ["draft", "sent", "in_progress"]);

  if (error) {
    return NextResponse.json({ error: "cancel_failed" }, { status: 500 });
  }

  await audit({
    req,
    actorId: user.id,
    actorEmail: user.email,
    action: "questionnaire.cancel",
    targetId: params.id,
  });

  return NextResponse.json({ ok: true });
}
