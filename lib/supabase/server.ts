import "server-only";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Server Supabase client bound to the request cookies. Use in server
 * components, server actions, and route handlers. RLS applies.
 */
export function getSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server components cannot set cookies — silently ignore; the
            // session refresh middleware (or route handler) will set them.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          } catch {
            // ignore
          }
        },
      },
      global: {
        // Bypass Next.js fetch cache so reads always hit the database.
        fetch: (input, init) =>
          fetch(input, { ...init, cache: "no-store" }),
      },
    }
  );
}
