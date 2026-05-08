import { ASSETS } from "@/lib/assets";
import { getSessionUser } from "@/lib/auth/requireUser";

type Props = {
  /** Optional href for the logo link (defaults to no link). */
  href?: string;
  /** Optional right-side slot. Overrides the auto-rendered user identity. */
  right?: React.ReactNode;
};

/**
 * App header used across all `/app/*` pages.
 * - Itzam wordmark (dark-mode variant on the black app background)
 * - Thin gold divider underneath
 * - When the visitor is logged in, their email is shown on the far right
 *   (symmetric to the logo). Pass `right` to override.
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
      const name =
        (user as any).user_metadata?.full_name ||
        (user as any).user_metadata?.name ||
        user.email ||
        null;
      if (name) {
        resolvedRight = (
          <span className="text-sm text-white/70" title={user.email || undefined}>
            {name}
          </span>
        );
      }
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
