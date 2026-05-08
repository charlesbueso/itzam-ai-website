import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/requireUser";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { NewQuestionnaireForm } from "./NewQuestionnaireForm";

export const dynamic = "force-dynamic";

export default async function NewQuestionnairePage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) redirect("/");
  const dict = getDictionary(params.locale);
  await requireAdmin(params.locale);
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        {dict.app.admin.newTitle}
      </h1>
      <NewQuestionnaireForm locale={params.locale} />
    </main>
  );
}
