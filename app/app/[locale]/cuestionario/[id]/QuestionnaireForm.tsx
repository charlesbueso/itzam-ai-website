"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useT } from "@/lib/i18n/LocaleProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Q = {
  id: string;
  position: number;
  block: string;
  type: "text" | "single" | "multi";
  label: string;
  options: Array<{ value: string; label_es: string; label_en: string }>;
  required: boolean;
  multiline: boolean;
};

type AnswerValue = string | string[] | null;

const DEBOUNCE_MS = 800;
const MAX_TEXT = 5000;

export function QuestionnaireForm({
  questionnaireId,
  locale,
  questions,
  initialAnswers,
  currentUserEmail: _currentUserEmail,
}: {
  questionnaireId: string;
  locale: "es" | "en";
  questions: Q[];
  initialAnswers: Record<string, unknown>;
  currentUserEmail?: string;
}) {
  const t = useT();
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(() => {
    const a: Record<string, AnswerValue> = {};
    for (const q of questions) {
      const v = initialAnswers[q.id];
      if (v == null) {
        a[q.id] = q.type === "multi" ? [] : "";
      } else if (q.type === "multi") {
        a[q.id] = Array.isArray(v) ? (v as string[]) : [];
      } else {
        a[q.id] = String(v);
      }
    }
    return a;
  });
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const pending = useRef<Map<string, AnswerValue>>(new Map());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusedQid = useRef<string | null>(null);
  const questionTypes = useMemo(() => {
    const m = new Map<string, Q["type"]>();
    for (const q of questions) m.set(q.id, q.type);
    return m;
  }, [questions]);

  const flush = async () => {
    if (pending.current.size === 0) return;
    const batch = Array.from(pending.current.entries()).map(([qid, value]) => ({
      question_id: qid,
      value,
    }));
    pending.current.clear();
    setSavingState("saving");
    try {
      const res = await fetch("/api/answers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionnaire_id: questionnaireId, items: batch }),
      });
      if (!res.ok) throw new Error("save failed");
      setSavingState("saved");
    } catch {
      setSavingState("error");
      // Re-queue items for retry.
      for (const item of batch) pending.current.set(item.question_id, item.value);
    }
  };

  const queueSave = (qid: string, value: AnswerValue) => {
    pending.current.set(qid, value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // ---- Realtime: collaborator answer updates ("almost realtime, last write wins").
  // We subscribe to row changes on `answers` filtered by questionnaire_id.
  // Skip remote updates for fields the user is currently focused on or has
  // unflushed local changes for, so their typing isn't clobbered mid-stroke.
  useEffect(() => {
    const sb = getSupabaseBrowserClient();
    const channel = sb
      .channel(`answers:${questionnaireId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "answers",
          filter: `questionnaire_id=eq.${questionnaireId}`,
        },
        (payload: { new?: { question_id?: string; value?: unknown }; old?: { question_id?: string } }) => {
          const row = payload.new ?? payload.old;
          const qid = row?.question_id;
          if (!qid) return;
          const type = questionTypes.get(qid);
          if (!type) return;
          if (focusedQid.current === qid) return;
          if (pending.current.has(qid)) return;
          const raw = (payload.new as { value?: unknown } | undefined)?.value;
          const next: AnswerValue =
            raw == null
              ? type === "multi"
                ? []
                : ""
              : type === "multi"
                ? Array.isArray(raw) ? (raw as string[]) : []
                : String(raw);
          setAnswers((prev) => {
            const cur = prev[qid];
            // Cheap equality to avoid useless re-renders.
            if (Array.isArray(cur) && Array.isArray(next)) {
              if (cur.length === next.length && cur.every((v, i) => v === next[i])) return prev;
            } else if (cur === next) {
              return prev;
            }
            return { ...prev, [qid]: next };
          });
        }
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [questionnaireId, questionTypes]);

  const onChange = (q: Q, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    queueSave(q.id, value);
  };

  const groups = useMemo(() => {
    const map = new Map<string, Q[]>();
    for (const q of questions) {
      const arr = map.get(q.block) || [];
      arr.push(q);
      map.set(q.block, arr);
    }
    return Array.from(map.entries());
  }, [questions]);

  const isComplete = useMemo(() => {
    for (const q of questions) {
      if (!q.required) continue;
      const v = answers[q.id];
      if (q.type === "multi") {
        if (!Array.isArray(v) || v.length === 0) return false;
      } else {
        if (typeof v !== "string" || v.trim() === "") return false;
      }
    }
    return true;
  }, [answers, questions]);

  const totalRequired = questions.filter((q) => q.required).length;
  const completedRequired = questions.filter((q) => {
    if (!q.required) return false;
    const v = answers[q.id];
    if (q.type === "multi") return Array.isArray(v) && v.length > 0;
    return typeof v === "string" && v.trim() !== "";
  }).length;
  const pct = totalRequired === 0 ? 100 : Math.round((completedRequired / totalRequired) * 100);

  const onSubmit = async () => {
    setSubmitState("submitting");
    setSubmitError(null);
    await flush();
    try {
      const res = await fetch(`/api/questionnaires/${questionnaireId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "submit_failed");
      }
      setSubmitState("done");
      window.location.href = `/${locale}/cuestionario/${questionnaireId}/gracias`;
    } catch (e) {
      setSubmitState("error");
      setSubmitError(e instanceof Error ? e.message : "error");
    }
  };

  return (
    <div className="space-y-10">
      <div className="sticky top-0 z-10 -mx-6 border-b border-white/10 bg-black/80 px-6 py-3 backdrop-blur">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>
            {t.app.questionnaire.progress}: {completedRequired}/{totalRequired}
          </span>
          <span>
            {savingState === "saving" && t.app.common.saving}
            {savingState === "saved" && t.app.questionnaire.autosaved}
            {savingState === "error" && (
              <span className="text-red-300">{t.app.questionnaire.autosaveError}</span>
            )}
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-white transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {groups.map(([block, qs]) => (
        <section key={block}>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">
            {block}
          </h2>
          <div className="space-y-6">
            {qs.map((q) => (
              <QuestionField
                key={q.id}
                q={q}
                locale={locale}
                value={answers[q.id]}
                onChange={(v) => onChange(q, v)}
                onFocus={() => { focusedQid.current = q.id; }}
                onBlur={() => {
                  if (focusedQid.current === q.id) focusedQid.current = null;
                }}
              />
            ))}
          </div>
        </section>
      ))}

      <footer className="border-t border-white/10 pt-6">
        {!isComplete && (
          <p className="mb-3 text-sm text-white/50">{t.app.questionnaire.submitDisabled}</p>
        )}
        {submitError && <p className="mb-3 text-sm text-red-300">{submitError}</p>}
        <button
          type="button"
          disabled={!isComplete || submitState === "submitting" || submitState === "done"}
          onClick={onSubmit}
          className="rounded bg-white px-6 py-3 font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitState === "submitting"
            ? t.app.questionnaire.submitting
            : t.app.questionnaire.submit}
        </button>
      </footer>
    </div>
  );
}

function QuestionField({
  q,
  locale,
  value,
  onChange,
  onFocus,
  onBlur,
}: {
  q: Q;
  locale: "es" | "en";
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const t = useT();
  return (
    <div>
      <label className="mb-2 block text-sm">
        <span className="text-white/90">{q.position}. {q.label}</span>
        {q.required && (
          <span className="ml-2 text-xs text-white/40">{t.app.questionnaire.requiredHint}</span>
        )}
      </label>

      {q.type === "text" && q.multiline && (
        <textarea
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_TEXT))}
          onFocus={onFocus}
          onBlur={onBlur}
          maxLength={MAX_TEXT}
          rows={4}
          className="w-full rounded border border-white/15 bg-black/40 px-3 py-2 text-white outline-none focus:border-white/40"
        />
      )}

      {q.type === "text" && !q.multiline && (
        <input
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_TEXT))}
          onFocus={onFocus}
          onBlur={onBlur}
          maxLength={MAX_TEXT}
          className="w-full rounded border border-white/15 bg-black/40 px-3 py-2 text-white outline-none focus:border-white/40"
        />
      )}

      {q.type === "single" && (
        <div className="space-y-2">
          {q.options.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-3 rounded border border-white/10 px-3 py-2 hover:bg-white/5">
              <input
                type="radio"
                name={q.id}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="accent-white"
              />
              <span className="text-sm">
                {locale === "en" ? opt.label_en : opt.label_es}
              </span>
            </label>
          ))}
        </div>
      )}

      {q.type === "multi" && (
        <div className="space-y-2">
          {q.options.map((opt) => {
            const checked = Array.isArray(value) && value.includes(opt.value);
            return (
              <label key={opt.value} className="flex cursor-pointer items-center gap-3 rounded border border-white/10 px-3 py-2 hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const arr = Array.isArray(value) ? [...value] : [];
                    if (checked) {
                      onChange(arr.filter((v) => v !== opt.value));
                    } else {
                      onChange([...arr, opt.value]);
                    }
                  }}
                  className="accent-white"
                />
                <span className="text-sm">
                  {locale === "en" ? opt.label_en : opt.label_es}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
