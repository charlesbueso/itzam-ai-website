import { redirect } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { getSessionUser } from "@/lib/auth/requireUser";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { reason?: string };
}) {
  if (!isLocale(params.locale)) redirect("/");
  const dict = getDictionary(params.locale);
  const user = await getSessionUser();
  if (user?.isAdmin) redirect(`/${params.locale}/admin`);

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

      <LoginForm locale={params.locale} />
    </main>
  );
}