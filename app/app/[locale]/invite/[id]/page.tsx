import { redirect, notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hashInviteToken, tokensEqual } from "@/lib/security/tokens";
import { audit } from "@/lib/security/audit";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: { locale: string; id: string };
  searchParams: { t?: string };
}) {
  if (!isLocale(params.locale)) redirect("/");
  const dict = getDictionary(params.locale);

  // Build a synthetic Request for IP extraction.
  const h = headers();
  const fakeReq = new Request("https://app.itzam.ai/invite", {
    headers: new Headers({
      "x-forwarded-for": h.get("x-forwarded-for") || "",
      "user-agent": h.get("user-agent") || "",
    }),
  });

  // Rate limit by IP+id to prevent enumeration / brute force.
  const ip = getClientIp(fakeReq);
  const rl = await checkRateLimit({
    bucket: "invite_redeem",
    identifier: `${ip}:${params.id}`,
    limit: 10,
    windowSeconds: 60,
  });

  const renderInvalid = () => (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-3 text-2xl font-semibold">{dict.app.invite.invalidTitle}</h1>
      <p className="text-sm text-white/60">{dict.app.invite.invalidBody}</p>
    </main>
  );

  if (!rl.allowed) return renderInvalid();
  if (!UUID_RE.test(params.id) || !searchParams.t) return renderInvalid();

  const supabase = getSupabaseAdminClient();
  const { data: q, error } = await supabase
    .from("questionnaires")
    .select(
      "id, status, invite_token_hash, invite_token_expires_at, invite_token_uses_count, invite_token_max_uses, supabase_action_link"
    )
    .eq("id", params.id)
    .maybeSingle();

  // Indistinguishable response for: not found / wrong token / expired / used up / cancelled.
  if (error || !q) return renderInvalid();
  if (!q.invite_token_hash || !q.invite_token_expires_at || !q.supabase_action_link) {
    return renderInvalid();
  }
  if (q.status === "cancelled" || q.status === "completed") return renderInvalid();
  if (new Date(q.invite_token_expires_at) < new Date()) return renderInvalid();
  if (q.invite_token_uses_count >= q.invite_token_max_uses) return renderInvalid();

  const submitted = hashInviteToken(searchParams.t);
  if (!tokensEqual(submitted, q.invite_token_hash)) {
    await audit({
      req: fakeReq,
      action: "invite_redeem_failed",
      targetId: params.id,
    });
    return renderInvalid();
  }

  // Increment use count atomically before redirect.
  const { error: updErr } = await supabase
    .from("questionnaires")
    .update({
      invite_token_uses_count: q.invite_token_uses_count + 1,
      invite_token_last_used_at: new Date().toISOString(),
      status: q.status === "sent" ? "in_progress" : q.status,
    })
    .eq("id", params.id)
    .eq("invite_token_hash", q.invite_token_hash); // optimistic concurrency

  if (updErr) return renderInvalid();

  await audit({
    req: fakeReq,
    action: "invite_redeem_ok",
    targetId: params.id,
  });

  // Redirect to Supabase action_link which sets the session cookie and then
  // bounces to /auth/callback?next=/{locale}/cuestionario/{id}.
  redirect(q.supabase_action_link);
}
