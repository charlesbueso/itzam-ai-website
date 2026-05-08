import "server-only";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type SessionUser = {
  id: string;
  email: string;
  isAdmin: boolean;
};

/**
 * Returns the current session user or null. Does not redirect.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !data.user.email) return null;
  const email = data.user.email.toLowerCase();
  const isAdmin = await checkIsAdmin(email);
  return { id: data.user.id, email, isAdmin };
}

/**
 * Source of truth for admin checks: the `admins` table (RLS-readable).
 * Falls back to ADMIN_EMAILS env var only if the table is empty (bootstrap).
 */
async function checkIsAdmin(email: string): Promise<boolean> {
  try {
    const admin = getSupabaseAdminClient();
    const { data, error } = await admin
      .from("admins")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    if (!error && data) return true;
    if (error) console.error("admins lookup failed", error.message);
  } catch (e) {
    console.error("admin client unavailable", e);
  }
  // Bootstrap fallback only — should be empty in normal operation.
  const envList = (process.env.ADMIN_EMAILS || "")
    .split(/[,\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return envList.includes(email);
}

export async function requireUser(redirectTo = "/login"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(redirectTo);
  return user;
}

export async function requireAdmin(locale: string = "es"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login?reason=admin`);
  if (!user.isAdmin) redirect(`/${locale}/login?reason=forbidden`);
  return user;
}
