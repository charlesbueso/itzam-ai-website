import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Per-IP throttle for public lead forms, on the same `rate_limit_hit` RPC as
 * lib/security/rateLimit.ts — but it FAILS OPEN. That helper denies on any
 * error in production, which is right for auth endpoints and wrong here:
 * losing a real lead to a Supabase hiccup is worse than letting a few extra
 * spam posts through (the honeypot, company-email and legit-check gates still
 * apply downstream).
 */
export async function leadRateLimitOk(
  bucket: string,
  ip: string | null,
  limit = 8,
  windowSeconds = 3600
): Promise<boolean> {
  if (!ip || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return true;
  try {
    const { data, error } = await getSupabaseAdminClient()
      .rpc("rate_limit_hit", {
        p_bucket: bucket,
        p_identifier: ip,
        p_window_seconds: windowSeconds,
        p_limit: limit,
      })
      .single<{ allowed: boolean }>();
    if (error || !data) {
      console.warn(`[leads] rate limit check skipped (${bucket}):`, error?.message);
      return true;
    }
    return data.allowed;
  } catch (e) {
    console.warn(`[leads] rate limit check threw (${bucket}):`, e instanceof Error ? e.message : String(e));
    return true;
  }
}
