import { redirect } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { getSessionUser } from "@/lib/auth/requireUser";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

// Same allowlist as post-login — kept in sync; only used to sanitize the
// query param that gets passed into the form (defense-in-depth, the actual
// dispatch is gated by post-login).
const NEXT_ALLOWLIST = [
  /^\/(?:en|es)\/admin(?:\/[A-Za-z0-9-_/]*)?$/,
  /^\/(?:en|es)\/cuestionario\/[0-9a-f-]{36}(?:\/gracias)?$/,
  /^\/(?:en|es)\/invite\/[0-9a-f-]{36}(?:\?t=[A-Za-z0-9_-]+)?$/,
];

function safeNext(raw: string | string[] | undefined): string | null {
  // If the URL contained `?next=...&next=...`, Next.js gives us an array.
  // Pick the first valid same-origin path; if none match, return null.
  const candidates = Array.isArray(raw) ? raw : raw ? [raw] : [];
  for (const c of candidates) {
    if (typeof c !== "string") continue;
    if (!c.startsWith("/") || c.startsWith("//")) continue;
    if (NEXT_ALLOWLIST.some((rx) => rx.test(c))) return c;
  }
  return null;
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { reason?: string; next?: string | string[] };
}) {
  if (!isLocale(params.locale)) redirect("/");
  const dict = getDictionary(params.locale);
  const next = safeNext(searchParams.next);
  const user = await getSessionUser();

  // Already authenticated → bounce through post-login so returning clients
  // land on their bookmarked form (or their most recent questionnaire).
  if (user) {
    const target = next
      ? `/${params.locale}/post-login?next=${encodeURIComponent(next)}`
      : `/${params.locale}/post-login`;
    redirect(target);
  }

  const reason = searchParams.reason;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-6 py-16">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">
        {dict.app.login.title}
      </h1>
      <div aria-hidden className="mb-4 h-px w-12 bg-[#c9a040]" />
      <p className="mb-8 text-sm text-white/60">{dict.app.login.subtitle}</p>

      {reason === "forbidden" && (
        <div className="mb-6 rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {dict.app.login.forbidden}
        </div>
      )}

      <LoginForm locale={params.locale} next={next} />
    </main>
  );
}