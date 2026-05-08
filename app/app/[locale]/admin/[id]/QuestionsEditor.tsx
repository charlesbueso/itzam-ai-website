"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Option = { value: string; label_es: string; label_en: string };
type Question = {
  id: string;
  position: number;
  block_es: string;
  block_en: string;
  type: "text" | "single" | "multi";
  label_es: string;
  label_en: string;
  options: Option[];
  required: boolean;
  multiline: boolean;
};

type Props = {
  questionnaireId: string;
  locale: "es" | "en";
  questions: Question[];
  labels: {
    questionLabel: string;
    optionsLabel: string;
    optionPlaceholder: string;
    saved: string;
    saving: string;
    saveError: string;
  };
};

export function QuestionsEditor({ questionnaireId, locale, questions: initial, labels }: Props) {
  const [questions, setQuestions] = useState<Question[]>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const dirtyRef = useRef<Map<string, Partial<Question>>>(new Map());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function scheduleFlush() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 800);
  }

  async function flush() {
    if (dirtyRef.current.size === 0) return;
    const items = Array.from(dirtyRef.current.entries()).map(([id, patch]) => ({
      id,
      label_es: patch.label_es,
      label_en: patch.label_en,
      options: patch.options,
    }));
    dirtyRef.current.clear();
    setStatus("saving");
    try {
      const res = await fetch(`/api/admin/questionnaires/${questionnaireId}/questions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("saved");
      setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 1500);
    } catch {
      setStatus("error");
    }
  }

  function markDirty(id: string, patch: Partial<Question>) {
    const cur = dirtyRef.current.get(id) || {};
    dirtyRef.current.set(id, { ...cur, ...patch });
    scheduleFlush();
  }

  function updateLabel(id: string, value: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [locale === "en" ? "label_en" : "label_es"]: value } : q))
    );
    const key = locale === "en" ? "label_en" : "label_es";
    markDirty(id, { [key]: value } as Partial<Question>);
  }

  function updateOption(qid: string, idx: number, value: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qid) return q;
        const next = q.options.map((o, i) =>
          i === idx ? { ...o, [locale === "en" ? "label_en" : "label_es"]: value } : o
        );
        markDirty(qid, { options: next });
        return { ...q, options: next };
      })
    );
  }

  const statusText = useMemo(() => {
    if (status === "saving") return labels.saving;
    if (status === "saved") return labels.saved;
    if (status === "error") return labels.saveError;
    return "";
  }, [status, labels]);

  return (
    <div>
      <div className="mb-3 h-4 text-xs text-white/50">{statusText}</div>
      <div className="space-y-6">
        {questions.map((qu) => {
          const block = locale === "en" ? qu.block_en : qu.block_es;
          const label = locale === "en" ? qu.label_en : qu.label_es;
          return (
            <div key={qu.id} className="rounded border border-white/10 p-4">
              <div className="text-xs uppercase tracking-wider text-white/40">{block}</div>
              <label className="mt-2 block">
                <span className="mb-1 block text-xs text-white/50">
                  {qu.position}. {labels.questionLabel}
                </span>
                {qu.multiline ? (
                  <textarea
                    value={label}
                    onChange={(e) => updateLabel(qu.id, e.target.value)}
                    onBlur={flush}
                    rows={2}
                    className="w-full rounded border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
                  />
                ) : (
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => updateLabel(qu.id, e.target.value)}
                    onBlur={flush}
                    className="w-full rounded border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
                  />
                )}
              </label>

              {(qu.type === "single" || qu.type === "multi") && qu.options.length > 0 && (
                <div className="mt-3">
                  <div className="mb-1 text-xs text-white/50">{labels.optionsLabel}</div>
                  <div className="space-y-1.5">
                    {qu.options.map((opt, idx) => {
                      const v = locale === "en" ? opt.label_en : opt.label_es;
                      return (
                        <input
                          key={`${qu.id}-${idx}`}
                          type="text"
                          value={v}
                          placeholder={labels.optionPlaceholder}
                          onChange={(e) => updateOption(qu.id, idx, e.target.value)}
                          onBlur={flush}
                          className="w-full rounded border border-white/10 bg-black px-3 py-1.5 text-sm text-white/90 outline-none focus:border-white/30"
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-2 text-[10px] uppercase tracking-wider text-white/30">
                {qu.type === "text" ? "Texto" : qu.type === "single" ? "Selección única" : "Selección múltiple"}
                {qu.required ? " · Obligatoria" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
