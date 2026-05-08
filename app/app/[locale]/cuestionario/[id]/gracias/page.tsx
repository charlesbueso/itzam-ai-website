import { redirect } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";

export default function GraciasPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) redirect("/");
  const dict = getDictionary(params.locale);
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12 text-center">
      <h1 className="mb-3 text-3xl font-semibold tracking-tight">
        {dict.app.questionnaire.thanksTitle}
      </h1>
      <p className="text-white/60">{dict.app.questionnaire.thanksBody}</p>
    </main>
  );
}
