import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/requireUser";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminQuestionnaireActions } from "./AdminQuestionnaireActions";
import { QuestionsEditor } from "./QuestionsEditor";
import { ClientInfoEditor } from "./ClientInfoEditor";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminQuestionnaireDetail({
  params,
}: {
  params: { locale: string; id: string };
}) {
  if (!isLocale(params.locale)) redirect("/");
  if (!UUID_RE.test(params.id)) notFound();
  const dict = getDictionary(params.locale);
  await requireAdmin(params.locale);

  const supabase = getSupabaseServerClient();
  const { data: q } = await supabase
    .from("questionnaires")
    .select(
      "id, client_name, client_email, preferred_locale, status, created_at, sent_at, completed_at, drive_folder_url, drive_sheet_url, invite_url, invite_token_expires_at, invite_token_uses_count"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!q) notFound();

  const { data: questions } = await supabase
    .from("questions")
    .select("id, position, block_es, block_en, type, label_es, label_en, options, required, multiline")
    .eq("questionnaire_id", params.id)
    .order("position", { ascending: true });

  const { data: answers } = await supabase
    .from("answers")
    .select("question_id, value, updated_at")
    .eq("questionnaire_id", params.id);

  const answerMap = new Map((answers || []).map((a) => [a.question_id, a.value]));

  const isLocked = q.status !== "draft";
  const isCompleted = q.status === "completed";

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/${params.locale}/admin`}
        className="mb-6 inline-block text-sm text-white/60 hover:text-white"
      >
        ← {dict.app.common.back}
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{q.client_name}</h1>
        <p className="text-sm text-white/50">{q.client_email}</p>
        <p className="mt-1 text-xs text-white/40">
          {dict.app.admin.colStatus}: {q.status}
        </p>
      </header>

      {!isLocked && (
        <ClientInfoEditor
          questionnaireId={q.id}
          initial={{
            client_name: q.client_name,
            client_email: q.client_email,
            preferred_locale: (q.preferred_locale as "es" | "en") || "es",
          }}
          labels={{
            nameLabel: dict.app.admin.clientNameLabel,
            emailLabel: dict.app.admin.clientEmailLabel,
            localeLabel: dict.app.admin.preferredLocaleLabel,
            saving: dict.app.admin.editSaving,
            saved: dict.app.admin.editSaved,
            saveError: dict.app.admin.editError,
            invalidEmail: dict.app.admin.editInvalidEmail,
          }}
        />
      )}

      <div className="mt-6">
        <AdminQuestionnaireActions
          locale={params.locale}
          questionnaireId={q.id}
          clientEmail={q.client_email}
          status={q.status}
          driveFolderUrl={q.drive_folder_url}
          inviteUrl={q.invite_url}
          inviteExpiresAt={q.invite_token_expires_at}
          inviteUsesCount={q.invite_token_uses_count}
        />
      </div>

      {isLocked && (
        <p className="mt-4 text-xs text-white/40">{dict.app.admin.lockedAfterSend}</p>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">
          {isCompleted ? dict.app.admin.answersHeading : dict.app.admin.questionsHeading}
        </h2>
        {!isLocked ? (
          <QuestionsEditor
            questionnaireId={q.id}
            locale={params.locale as "es" | "en"}
            questions={(questions || []) as any}
            labels={{
              questionLabel: dict.app.admin.editQuestionLabel,
              optionsLabel: dict.app.admin.editOptionsLabel,
              optionPlaceholder: dict.app.admin.editOptionPlaceholder,
              saving: dict.app.admin.editSaving,
              saved: dict.app.admin.editSaved,
              saveError: dict.app.admin.editError,
            }}
          />
        ) : (
          <div className="space-y-6">
            {(questions || []).map((qu) => {
              const label = params.locale === "en" ? qu.label_en : qu.label_es;
              const block = params.locale === "en" ? qu.block_en : qu.block_es;
              const value = answerMap.get(qu.id);
              return (
                <div key={qu.id} className="rounded border border-white/10 p-4">
                  <div className="text-xs uppercase tracking-wider text-white/40">{block}</div>
                  <div className="mt-1 text-sm font-medium">
                    {qu.position}. {label}
                  </div>
                  {isCompleted ? (
                    <div className="mt-3 whitespace-pre-wrap text-sm text-white/80">
                      {renderValue(qu.type, qu.options as any, value, params.locale as "es" | "en")}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-white/40">
                      {qu.type === "text" ? "Texto" : qu.type === "single" ? "Selección única" : "Selección múltiple"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function renderValue(
  type: string,
  options: Array<{ value: string; label_es: string; label_en: string }>,
  value: unknown,
  locale: "es" | "en"
): string {
  if (value == null) return "—";
  if (type === "text") return String(value);
  const labelFor = (v: string) => {
    const o = options.find((opt) => opt.value === v);
    if (!o) return v;
    return locale === "en" ? o.label_en : o.label_es;
  };
  if (type === "single") return labelFor(String(value));
  if (type === "multi" && Array.isArray(value)) return (value as string[]).map(labelFor).join(", ");
  return String(value);
}
