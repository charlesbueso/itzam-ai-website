import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * For a returning client (non-admin) — find the questionnaire we should
 * land them on after a credentialed login with no explicit `next`.
 *
 * Picks the most recently updated questionnaire where the user is either
 * the original assignee or a collaborator, and is still actionable
 * (sent / in_progress) → falls back to a completed one if that's all
 * they have, so they land on the "thanks" page rather than `forbidden`.
 *
 * Service-role read; gates on user_id, never on caller-supplied data.
 */
export async function findClientLandingQuestionnaire(
  userId: string
): Promise<{ id: string; status: string; preferred_locale: string } | null> {
  const admin = getSupabaseAdminClient();

  const collabIdsRes = await admin
    .from("questionnaire_collaborators")
    .select("questionnaire_id")
    .eq("user_id", userId);
  const collabIds = (collabIdsRes.data || []).map(
    (r) => r.questionnaire_id as string
  );

  const orFilters: string[] = [`assigned_user_id.eq.${userId}`];
  if (collabIds.length > 0) {
    orFilters.push(`id.in.(${collabIds.join(",")})`);
  }

  const { data: rows } = await admin
    .from("questionnaires")
    .select("id, status, preferred_locale, updated_at")
    .or(orFilters.join(","))
    .in("status", ["sent", "in_progress", "completed"])
    .order("updated_at", { ascending: false })
    .limit(1);

  if (!rows || rows.length === 0) return null;
  return {
    id: rows[0].id as string,
    status: rows[0].status as string,
    preferred_locale: (rows[0].preferred_locale as string) || "es",
  };
}
