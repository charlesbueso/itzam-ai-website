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
  is_custom: boolean;
};

type EditorLabels = {
  questionLabel: string;
  optionsLabel: string;
  optionPlaceholder: string;
  saved: string;
  saving: string;
  saveError: string;
  customHeading: string;
  customHint: string;
  addCustomCta: string;
  addingCustom: string;
  deleteCustom: string;
  confirmDeleteCustom: string;
  newQuestionLabelEs: string;
  newQuestionLabelEn: string;
  newQuestionType: string;
  typeText: string;
  typeSingle: string;
  typeMulti: string;
  newQuestionMultiline: string;
  newQuestionOptionsLabel: string;
  newQuestionOptionEsPlaceholder: string;
  newQuestionOptionEnPlaceholder: string;
  newQuestionAddOption: string;
  newQuestionRemoveOption: string;
  newQuestionSave: string;
  newQuestionCancel: string;
  newQuestionMinOptions: string;
  newQuestionMissingLabel: string;
  customLimitReached: string;
};

type Props = {
  questionnaireId: string;
  locale: "es" | "en";
  questions: Question[];
  labels: EditorLabels;
};

const MAX_CUSTOM = 20;

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

export function QuestionsEditor({ questionnaireId, locale, questions: initial, labels }: Props) {
  const [questions, setQuestions] = useState<Question[]>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showNew, setShowNew] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
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

  async function deleteCustom(qid: string) {
    if (!confirm(labels.confirmDeleteCustom)) return;
    try {
      const res = await fetch(
        `/api/admin/questionnaires/${questionnaireId}/questions/${qid}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(String(res.status));
      setQuestions((prev) => prev.filter((q) => q.id !== qid));
    } catch {
      setStatus("error");
    }
  }

  async function handleAddCustom(payload: NewQuestionPayload): Promise<boolean> {
    setAddError(null);
    try {
      const res = await fetch(
        `/api/admin/questionnaires/${questionnaireId}/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setAddError(data?.error || "error");
        return false;
      }
      const data = (await res.json()) as { question: Question };
      setQuestions((prev) => [...prev, data.question]);
      setShowNew(false);
      return true;
    } catch {
      setAddError("network");
      return false;
    }
  }

  const statusText = useMemo(() => {
    if (status === "saving") return labels.saving;
    if (status === "saved") return labels.saved;
    if (status === "error") return labels.saveError;
    return "";
  }, [status, labels]);

  const customCount = questions.filter((q) => q.is_custom).length;
  const canAdd = customCount < MAX_CUSTOM;

  return (
    <div>
      <div className="mb-3 h-4 text-xs text-white/50">{statusText}</div>
      <div className="space-y-6">
        {questions.map((qu) => {
          const block = locale === "en" ? qu.block_en : qu.block_es;
          const label = locale === "en" ? qu.label_en : qu.label_es;
          return (
            <div key={qu.id} className="rounded border border-white/10 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs uppercase tracking-wider text-white/40">{block}</div>
                {qu.is_custom && (
                  <button
                    type="button"
                    onClick={() => deleteCustom(qu.id)}
                    className="text-xs text-white/50 hover:text-red-400"
                  >
                    {labels.deleteCustom}
                  </button>
                )}
              </div>
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
                {qu.type === "text" ? labels.typeText : qu.type === "single" ? labels.typeSingle : labels.typeMulti}
                {qu.required ? " · *" : ""}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
          {labels.customHeading}
        </h3>
        <p className="mt-1 text-xs text-white/40">{labels.customHint}</p>

        {showNew ? (
          <NewQuestionForm
            labels={labels}
            onCancel={() => {
              setShowNew(false);
              setAddError(null);
            }}
            onSubmit={handleAddCustom}
            error={addError}
          />
        ) : (
          <button
            type="button"
            disabled={!canAdd}
            onClick={() => setShowNew(true)}
            className="mt-3 rounded border border-white/20 px-4 py-2 text-sm text-white/90 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {canAdd ? labels.addCustomCta : labels.customLimitReached}
          </button>
        )}
      </div>
    </div>
  );
}

type NewQuestionPayload = {
  type: "text" | "single" | "multi";
  label_es: string;
  label_en: string;
  multiline: boolean;
  required: boolean;
  options: Option[];
};

function NewQuestionForm({
  labels,
  onCancel,
  onSubmit,
  error,
}: {
  labels: EditorLabels;
  onCancel: () => void;
  onSubmit: (p: NewQuestionPayload) => Promise<boolean>;
  error: string | null;
}) {
  const [type, setType] = useState<"text" | "single" | "multi">("text");
  const [labelEs, setLabelEs] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [multiline, setMultiline] = useState(false);
  const [opts, setOpts] = useState<Array<{ label_es: string; label_en: string }>>([
    { label_es: "", label_en: "" },
    { label_es: "", label_en: "" },
  ]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isChoice = type !== "text";

  async function submit() {
    setLocalError(null);
    const es = labelEs.trim();
    const en = labelEn.trim();
    if (!es || !en) {
      setLocalError(labels.newQuestionMissingLabel);
      return;
    }
    let finalOptions: Option[] = [];
    if (isChoice) {
      const filled = opts
        .map((o) => ({ label_es: o.label_es.trim(), label_en: o.label_en.trim() }))
        .filter((o) => o.label_es.length > 0 && o.label_en.length > 0);
      if (filled.length < 2) {
        setLocalError(labels.newQuestionMinOptions);
        return;
      }
      const seen = new Map<string, number>();
      finalOptions = filled.map((o) => {
        const base = slugify(o.label_en || o.label_es) || "opt";
        const count = seen.get(base) || 0;
        seen.set(base, count + 1);
        const value = count === 0 ? base : `${base}_${count + 1}`;
        return { value, label_es: o.label_es, label_en: o.label_en };
      });
    }
    setSubmitting(true);
    await onSubmit({
      type,
      label_es: es,
      label_en: en,
      multiline: type === "text" ? multiline : false,
      required: true,
      options: finalOptions,
    });
    setSubmitting(false);
  }

  return (
    <div className="mt-4 rounded border border-white/15 bg-white/[0.02] p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-white/50">{labels.newQuestionLabelEs}</span>
          <input
            type="text"
            value={labelEs}
            onChange={(e) => setLabelEs(e.target.value)}
            className="w-full rounded border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-white/50">{labels.newQuestionLabelEn}</span>
          <input
            type="text"
            value={labelEn}
            onChange={(e) => setLabelEn(e.target.value)}
            className="w-full rounded border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label className="block">
          <span className="mb-1 block text-xs text-white/50">{labels.newQuestionType}</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "text" | "single" | "multi")}
            className="rounded border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
          >
            <option value="text">{labels.typeText}</option>
            <option value="single">{labels.typeSingle}</option>
            <option value="multi">{labels.typeMulti}</option>
          </select>
        </label>
        {type === "text" && (
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={multiline}
              onChange={(e) => setMultiline(e.target.checked)}
            />
            {labels.newQuestionMultiline}
          </label>
        )}
      </div>

      {isChoice && (
        <div className="mt-4">
          <div className="mb-2 text-xs text-white/50">{labels.newQuestionOptionsLabel}</div>
          <div className="space-y-2">
            {opts.map((o, idx) => (
              <div key={idx} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <input
                  type="text"
                  value={o.label_es}
                  placeholder={labels.newQuestionOptionEsPlaceholder}
                  onChange={(e) =>
                    setOpts((prev) => prev.map((p, i) => (i === idx ? { ...p, label_es: e.target.value } : p)))
                  }
                  className="rounded border border-white/10 bg-black px-3 py-1.5 text-sm text-white/90 outline-none focus:border-white/30"
                />
                <input
                  type="text"
                  value={o.label_en}
                  placeholder={labels.newQuestionOptionEnPlaceholder}
                  onChange={(e) =>
                    setOpts((prev) => prev.map((p, i) => (i === idx ? { ...p, label_en: e.target.value } : p)))
                  }
                  className="rounded border border-white/10 bg-black px-3 py-1.5 text-sm text-white/90 outline-none focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={() => setOpts((prev) => prev.filter((_, i) => i !== idx))}
                  disabled={opts.length <= 2}
                  className="rounded border border-white/10 px-2 py-1 text-xs text-white/60 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {labels.newQuestionRemoveOption}
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpts((prev) => [...prev, { label_es: "", label_en: "" }])}
            disabled={opts.length >= 20}
            className="mt-2 text-xs text-white/60 hover:text-white disabled:opacity-30"
          >
            + {labels.newQuestionAddOption}
          </button>
        </div>
      )}

      {(localError || error) && (
        <div className="mt-3 text-xs text-red-400">{localError || error}</div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="rounded bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50"
        >
          {submitting ? labels.addingCustom : labels.newQuestionSave}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
        >
          {labels.newQuestionCancel}
        </button>
      </div>
    </div>
  );
}
