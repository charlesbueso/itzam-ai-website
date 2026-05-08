import "server-only";

import { hashInviteToken, tokensEqual } from "@/lib/security/tokens";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Validate an invite token (id + plaintext) without consuming it.
 * Returns the questionnaire row (slim shape) if valid, null otherwise.
 */
export async function validateInvite(
  questionnaireId: string,
  plaintext: string
): Promise<{
  id: string;
  client_email: string;
  status: string;
  preferred_locale: string | null;
} | null> {
  const admin = getSupabaseAdminClient();
  const { data: q, error } = await admin
    .from("questionnaires")
    .select(
      "id, client_email, status, preferred_locale, invite_token_hash, invite_token_expires_at"
    )
    .eq("id", questionnaireId)
    .maybeSingle();
  if (error || !q) return null;
  if (!q.invite_token_hash || !q.invite_token_expires_at) return null;
  if (q.status === "cancelled" || q.status === "completed") return null;
  if (new Date(q.invite_token_expires_at) < new Date()) return null;
  if (!tokensEqual(hashInviteToken(plaintext), q.invite_token_hash)) return null;
  return {
    id: q.id,
    client_email: q.client_email,
    status: q.status,
    preferred_locale: q.preferred_locale,
  };
}

/**
 * Idempotently attach a user to a questionnaire as a collaborator.
 * Service-role only. Also clears any matching pending invite (by email)
 * so the 4-collaborator cap is computed correctly afterward.
 */
export async function attachCollaborator(
  questionnaireId: string,
  userId: string,
  userEmail?: string
): Promise<void> {
  const admin = getSupabaseAdminClient();
  await admin
    .from("questionnaire_collaborators")
    .upsert(
      { questionnaire_id: questionnaireId, user_id: userId },
      { onConflict: "questionnaire_id,user_id", ignoreDuplicates: true }
    );
  if (userEmail) {
    await admin
      .from("questionnaire_collaborator_invites")
      .delete()
      .eq("questionnaire_id", questionnaireId)
      .eq("email", userEmail.toLowerCase());
  }
  // Best-effort progress: move sent → in_progress on first redeem.
  await admin
    .from("questionnaires")
    .update({
      status: "in_progress",
      invite_token_last_used_at: new Date().toISOString(),
    })
    .eq("id", questionnaireId)
    .eq("status", "sent");
}
