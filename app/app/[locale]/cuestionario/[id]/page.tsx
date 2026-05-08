import { redirect, notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/requireUser";
import { QuestionnaireForm } from "./QuestionnaireForm";
import { CollaboratorsPanel } from "./CollaboratorsPanel";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CuestionarioPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  if (!isLocale(params.locale)) redirect("/");
  if (!UUID_RE.test(params.id)) notFound();
  const dict = getDictionary(params.locale);
  // requireUser appends `?next=<current path>` automatically based on the
  // middleware-injected `x-pathname` header, so we just point it at /login.
  const user = await requireUser(`/${params.locale}/login`);

  const supabase = getSupabaseServerClient();
  // RLS guarantees only the assigned client (or admin) can read.
  const { data: q } = await supabase
    .from("questionnaires")
    .select("id, client_name, client_company, status, preferred_locale")
    .eq("id", params.id)
    .maybeSingle();

  if (!q) notFound();

  if (q.status === "completed") {
    redirect(`/${params.locale}/cuestionario/${params.id}/gracias`);
  }
  if (q.status === "cancelled" || q.status === "draft") {
    notFound();
  }

  const { data: questions } = await supabase
    .from("questions")
    .select("id, position, block_es, block_en, type, label_es, label_en, options, required, multiline")
    .eq("questionnaire_id", params.id)
    .order("position", { ascending: true });

  const { data: answers } = await supabase
    .from("answers")
    .select("question_id, value")
    .eq("questionnaire_id", params.id);

  const answerMap: Record<string, unknown> = {};
  (answers || []).forEach((a) => {
    answerMap[a.question_id] = a.value;
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {dict.app.questionnaire.title}
          </h1>
          <div aria-hidden className="mt-3 h-px w-16 bg-[#c9a040]" />
          {(q.client_company || q.client_name) && (
            <p className="mt-3 text-xs uppercase tracking-widest text-white/50">
              {q.client_company || q.client_name}
            </p>
          )}
          <p className="mt-4 text-sm text-white/60">
            {dict.app.questionnaire.intro}
          </p>
        </div>
        <div className="flex justify-end">
          <CollaboratorsPanel
            questionnaireId={params.id}
            currentUserEmail={user.email}
          />
        </div>
      </header>
      <QuestionnaireForm
        questionnaireId={params.id}
        locale={params.locale as "es" | "en"}
        currentUserEmail={user.email}
        questions={(questions || []).map((q) => ({
          id: q.id,
          position: q.position,
          block: params.locale === "en" ? q.block_en : q.block_es,
          type: q.type as "text" | "single" | "multi",
          label: params.locale === "en" ? q.label_en : q.label_es,
          options: (q.options as Array<{ value: string; label_es: string; label_en: string }>) || [],
          required: q.required,
          multiline: q.multiline,
        }))}
        initialAnswers={answerMap}
      />
    </main>
  );
}
