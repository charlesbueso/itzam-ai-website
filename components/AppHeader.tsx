import { headers } from "next/headers";

import { ASSETS } from "@/lib/assets";
import { getSessionUser } from "@/lib/auth/requireUser";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  /** Optional href for the logo link (defaults to no link). */
  href?: string;
  /** Optional right-side slot. Overrides the auto-rendered user identity. */
  right?: React.ReactNode;
};

const CUESTIONARIO_RE =
  /^\/(?:en|es)\/cuestionario\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/|$)/i;

/**
 * Best-effort current pathname read from the middleware-injected header.
 * Falls back to common Next.js internal headers.
 */
function readPathname(): string | null {
  const h = headers();
  return (
    h.get("x-pathname") ||
    h.get("x-invoke-path") ||
    h.get("next-url") ||
    null
  );
}

/**
 * If the current page is a questionnaire, look up the client/company name.
 * RLS gates the read, so a non-collaborator never sees it.
 */
async function resolveCompanyName(): Promise<string | null> {
  const pathname = readPathname();
  if (!pathname) return null;
  const m = pathname.match(CUESTIONARIO_RE);
  if (!m) return null;
  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("questionnaires")
      .select("client_name")
      .eq("id", m[1])
      .maybeSingle();
    return (data?.client_name as string | undefined) || null;
  } catch {
    return null;
  }
}

/**
 * App header used across all `/app/*` pages.
 * - Itzam wordmark (dark-mode variant on the black app background)
 * - Thin gold divider underneath
 * - When the visitor is logged in, their email is shown on the far right.
 *   On a questionnaire route the client's company name is shown right
 *   before the email (e.g. `Apple — charles@gmail.com`).
 *   Pass `right` to override entirely.
 */
export async function AppHeader({ href, right }: Props) {
  const logo = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={ASSETS.logotypeDark} alt="Itzam.ai" className="h-16 w-auto" />
  );

  let resolvedRight = right;
  if (!resolvedRight) {
    const user = await getSessionUser();
    if (user) {
      const company = await resolveCompanyName();
      resolvedRight = (
        <div
          className="text-right text-sm text-white/80"
          title={user.email || undefined}
        >
          {company ? (
            <>
              <span className="font-medium text-[#c9a040]">{company}</span>
              <span className="mx-2 text-white/30">—</span>
              <span className="text-white/70">{user.email}</span>
            </>
          ) : (
            <span className="text-white/70">{user.email}</span>
          )}
        </div>
      );
    }
  }

  return (
    <header className="border-b border-[#c9a040]/30">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-2">
        {href ? (
          <a href={href} aria-label="Itzam.ai" className="inline-flex items-center">
            {logo}
          </a>
        ) : (
          <div className="inline-flex items-center">{logo}</div>
        )}
        {resolvedRight ? (
          <div className="flex items-center gap-3">{resolvedRight}</div>
        ) : null}
      </div>
    </header>
  );
}
