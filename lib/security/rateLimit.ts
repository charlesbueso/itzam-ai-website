import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Best-effort rate limiter backed by the `rate_limits` table. Free, no extra
 * infra. Race-tolerant: counts are advisory; a small over-count is acceptable
 * because the limits are loose.
 *
 * Returns { allowed, remaining, resetAt }.
 */
export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
};

export async function checkRateLimit(opts: {
  bucket: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const { bucket, identifier, limit, windowSeconds } = opts;
  const supabase = getSupabaseAdminClient();
  const now = new Date();

  const { data, error } = await supabase
    .rpc("rate_limit_hit", {
      p_bucket: bucket,
      p_identifier: identifier,
      p_window_seconds: windowSeconds,
      p_limit: limit,
    })
    .single<{ allowed: boolean; remaining: number; reset_at: string }>();

  if (error || !data) {
    // Fail open in dev, fail closed in prod — but log.
    console.error("rate_limit error", { bucket, identifier, error });
    return {
      allowed: process.env.NODE_ENV !== "production",
      remaining: 0,
      resetAt: new Date(now.getTime() + windowSeconds * 1000),
    };
  }
  return {
    allowed: data.allowed,
    remaining: data.remaining,
    resetAt: new Date(data.reset_at),
  };
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}
