import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getClientIp } from "@/lib/security/rateLimit";

/**
 * Append a row to audit_log. Never throws — logging must not break the request.
 * Sensitive values (tokens, full email bodies) MUST NOT be passed in metadata.
 */
export async function audit(opts: {
  req?: Request;
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = getSupabaseAdminClient();
    const ua = opts.req?.headers.get("user-agent") || null;
    const ip = opts.req ? getClientIp(opts.req) : null;
    await supabase.from("audit_log").insert({
      actor_id: opts.actorId ?? null,
      actor_email: opts.actorEmail ? maskEmail(opts.actorEmail) : null,
      action: opts.action,
      target_id: opts.targetId ?? null,
      ip,
      user_agent: ua,
      metadata: opts.metadata ?? null,
    });
  } catch (e) {
    console.error("audit log failed", e);
  }
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const head = local.slice(0, 1);
  return `${head}***@${domain}`;
}
