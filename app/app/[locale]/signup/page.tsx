import { redirect } from "next/navigation";

import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { getSessionUser } from "@/lib/auth/requireUser";
import { readPendingInvite } from "@/lib/auth/pendingInvite";
import { validateInvite } from "@/lib/auth/invite";
import { SignupForm } from "./SignupForm";

export const dynamic = "force-dynamic";

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { confirm?: string; reason?: string };
}) {
  if (!isLocale(params.locale)) redirect("/");
  const dict = getDictionary(params.locale);

  // Already authenticated → straight to the form (gateway will attach).
  const user = await getSessionUser();

  const pending = readPendingInvite();
  if (!pending) {
    // No invite → can't sign up cold. Redirect to login.
    redirect(`/${params.locale}/login?reason=invalid-invite`);
  }

  // Validate the stashed invite (still valid? not expired/cancelled?).
  const valid = await validateInvite(pending.id, pending.t);
  if (!valid) {
    redirect(`/${params.locale}/login?reason=invalid-invite`);
  }

  if (user) {
    // They came back here while authenticated — push them through the
    // gateway again to attach + redirect.
    redirect(`/${params.locale}/invite/${pending.id}?t=${pending.t}`);
  }

  const showConfirmNotice = searchParams.confirm === "1";

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-6 py-16">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">
        {dict.app.signup.title}
      </h1>
      <div aria-hidden className="mb-4 h-px w-12 bg-[#c9a040]" />
      <p className="mb-8 text-sm text-white/60">{dict.app.signup.subtitle}</p>

      {showConfirmNotice ? (
        <div className="rounded border border-[#c9a040]/40 bg-[#c9a040]/5 p-4 text-sm">
          <p className="font-medium">{dict.app.signup.checkEmailTitle}</p>
          <p className="mt-2 text-white/70">{dict.app.signup.checkEmailBody}</p>
        </div>
      ) : (
        <>
          {searchParams.reason === "exists" && (
            <div className="mb-6 rounded border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
              {dict.app.signup.alreadyExists}{" "}
              <a
                href={`/${params.locale}/login`}
                className="underline underline-offset-2 hover:text-white"
              >
                {dict.app.signup.loginLink}
              </a>
            </div>
          )}
          <SignupForm
            locale={params.locale}
            defaultEmail={valid.client_email}
          />
          <p className="mt-6 text-sm text-white/50">
            {dict.app.signup.haveAccount}{" "}
            <a
              href={`/${params.locale}/login`}
              className="text-white underline underline-offset-2 hover:text-[#c9a040]"
            >
              {dict.app.signup.loginLink}
            </a>
          </p>
        </>
      )}
    </main>
  );
}
