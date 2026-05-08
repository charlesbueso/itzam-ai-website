import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS — use ONLY in server route
 * handlers/actions where strictly necessary (e.g. auth.admin.generateLink,
 * cron jobs). Never import from client components.
 *
 * Guarded with `import 'server-only'`; any accidental client import will
 * fail the build.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin client not configured");
  }
  cached = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      // Disable Next.js's automatic fetch cache. Without this, server-side
      // reads can return stale rows even after a write in the same logical
      // flow (Next.js wraps `fetch` and dedupes/caches by URL+headers).
      fetch: (input, init) =>
        fetch(input, { ...init, cache: "no-store" }),
    },
  });
  return cached;
}
