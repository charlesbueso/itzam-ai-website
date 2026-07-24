"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { SELF_QUESTIONS, type SelfQuestion } from "@/lib/assessment/questions";
import type { Band, DimensionKey } from "@/lib/assessment/scoring";

/**
 * Self-serve Free AI Assessment: one-page form → instant deterministic score.
 * Posts to /api/assessment, which appends the submission to a Google Sheet;
 * the team prepares and sends the full diagnostic by email.
 */

type Answers = Record<string, string | string[]>;

type SubmitResult = {
  score: number;
  band: Band;
  dimensions: { key: DimensionKey; value: number }[];
};

type Phase = "form" | "submitting" | "score";

const SECTION_ORDER: SelfQuestion["section"][] = ["company", "tools", "process"];

const BAND_COLORS: Record<Band, string> = {
  explorer: "#ef6a4d",
  in_progress: "#c9a040",
  advanced: "#4dbd74",
};

export default function AssessmentFlow() {
  const { locale, t } = useLocale();
  const a = t.assessment;

  const [phase, setPhase] = useState<Phase>("form");
  const [answers, setAnswers] = useState<Answers>({});
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});
  const [wish, setWish] = useState("");
  const [contact, setContact] = useState({ name: "", role: "", company: "", email: "", phone: "" });
  const [accepted, setAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const topRef = useRef<HTMLDivElement>(null);

  const requiredCount = useMemo(
    () => SELF_QUESTIONS.filter((q) => q.required).length + 1, // +1 = email
    []
  );

  const answeredCount = useMemo(() => {
    let n = 0;
    for (const q of SELF_QUESTIONS) {
      if (!q.required) continue;
      const v = answers[q.key];
      if (q.type === "multi" ? Array.isArray(v) && v.length > 0 : Boolean(v)) n++;
    }
    if (contact.email.includes("@")) n++;
    return n;
  }, [answers, contact.email]);

  function setSingle(key: string, value: string) {
    setAnswers((prev) => {
      // Tapping the selected option again deselects (useful for optional Qs).
      const next = { ...prev };
      if (prev[key] === value) delete next[key];
      else next[key] = value;
      return next;
    });
  }

  function toggleMulti(key: string, value: string) {
    setAnswers((prev) => {
      const cur = Array.isArray(prev[key]) ? (prev[key] as string[]) : [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...prev, [key]: next };
    });
  }

  function isSelected(q: SelfQuestion, value: string): boolean {
    const v = answers[q.key];
    return q.type === "multi" ? Array.isArray(v) && v.includes(value) : v === value;
  }

  function validate(): boolean {
    for (const q of SELF_QUESTIONS) {
      if (!q.required) continue;
      const v = answers[q.key];
      const ok = q.type === "multi" ? Array.isArray(v) && v.length > 0 : Boolean(v);
      if (!ok) return false;
    }
    const c = contact;
    if (!c.name.trim() || !c.role.trim() || !c.company.trim()) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) return false;
    if (!accepted) return false;
    return true;
  }

  async function handleSubmit() {
    setErrorMsg(null);
    if (!validate()) {
      setErrorMsg(a.errors.missing);
      return;
    }
    setPhase("submitting");
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          answers,
          otherTexts,
          wish,
          contact: {
            name: contact.name.trim(),
            role: contact.role.trim(),
            company: contact.company.trim(),
            email: contact.email.trim(),
            phone: contact.phone.trim(),
          },
          company_website: "",
        }),
      });
      if (res.status === 429) {
        setPhase("form");
        setErrorMsg(a.errors.rateLimited);
        return;
      }
      if (!res.ok) throw new Error(`submit ${res.status}`);
      const body = (await res.json()) as SubmitResult;
      setResult(body);
      setPhase("score");
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      console.error("assessment submit failed", err);
      setPhase("form");
      setErrorMsg(a.errors.generic);
    }
  }

  return (
    <div ref={topRef} className="scroll-mt-28">
      {phase !== "score" && (
        <FormView
          t={t}
          locale={locale}
          answers={answers}
          otherTexts={otherTexts}
          wish={wish}
          contact={contact}
          accepted={accepted}
          errorMsg={errorMsg}
          submitting={phase === "submitting"}
          answeredCount={answeredCount}
          requiredCount={requiredCount}
          onSingle={setSingle}
          onMulti={toggleMulti}
          isSelected={isSelected}
          onOtherText={(key, v) => setOtherTexts((p) => ({ ...p, [key]: v }))}
          onWish={setWish}
          onContact={(field, v) => setContact((p) => ({ ...p, [field]: v }))}
          onAccept={setAccepted}
          onSubmit={handleSubmit}
        />
      )}

      {phase === "score" && result && (
        <ResultsView t={t} locale={locale} result={result} email={contact.email.trim()} />
      )}
    </div>
  );
}

/* ───────────────────────── Form ───────────────────────── */

type Dict = ReturnType<typeof useLocale>["t"];

function FormView(props: {
  t: Dict;
  locale: "es" | "en";
  answers: Answers;
  otherTexts: Record<string, string>;
  wish: string;
  contact: { name: string; role: string; company: string; email: string; phone: string };
  accepted: boolean;
  errorMsg: string | null;
  submitting: boolean;
  answeredCount: number;
  requiredCount: number;
  onSingle: (key: string, value: string) => void;
  onMulti: (key: string, value: string) => void;
  isSelected: (q: SelfQuestion, value: string) => boolean;
  onOtherText: (key: string, value: string) => void;
  onWish: (v: string) => void;
  onContact: (field: "name" | "role" | "company" | "email" | "phone", v: string) => void;
  onAccept: (v: boolean) => void;
  onSubmit: () => void;
}) {
  const { t, locale } = props;
  const a = t.assessment;
  const pct = Math.round((props.answeredCount / props.requiredCount) * 100);

  let qNumber = 0;

  return (
    <div>
      {/* Sticky progress */}
      <div className="sticky top-0 z-20 -mx-6 bg-black/90 px-6 py-3 backdrop-blur-sm md:-mx-0 md:px-0">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#c9a040] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-white/50">
          {a.progress.replace("{n}", String(props.answeredCount)).replace("{total}", String(props.requiredCount))}
        </p>
      </div>

      {SECTION_ORDER.map((section) => (
        <section key={section} className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a040]">
            {a.sections[section]}
          </p>
          <div className="mt-4 space-y-4">
            {SELF_QUESTIONS.filter((q) => q.section === section).map((q) => {
              qNumber += 1;
              const label = locale === "en" ? q.label_en : q.label_es;
              const hint = locale === "en" ? q.hint_en : q.hint_es;
              const showOther =
                q.otherValue != null && props.isSelected(q, q.otherValue);
              return (
                <fieldset
                  key={q.key}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6"
                >
                  <legend className="sr-only">{label}</legend>
                  <p className="text-xs font-mono text-[#c9a040]/80">
                    {String(qNumber).padStart(2, "0")}
                  </p>
                  <p className="mt-1 text-base font-semibold text-white md:text-lg">
                    {label}{" "}
                    {hint && (
                      <span className="text-sm font-normal text-white/45">({hint})</span>
                    )}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {q.options.map((o) => {
                      const selected = props.isSelected(q, o.value);
                      return (
                        <button
                          key={o.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            q.type === "multi"
                              ? props.onMulti(q.key, o.value)
                              : props.onSingle(q.key, o.value)
                          }
                          className={`min-h-[42px] rounded-lg border px-4 py-2 text-sm transition ${
                            selected
                              ? "border-[#c9a040] bg-[#c9a040]/[0.14] font-semibold text-white"
                              : "border-white/15 bg-white/5 text-white/70 hover:border-[#c9a040]/60 hover:text-white"
                          }`}
                        >
                          {locale === "en" ? o.label_en : o.label_es}
                        </button>
                      );
                    })}
                  </div>
                  {showOther && (
                    <input
                      type="text"
                      value={props.otherTexts[q.key] || ""}
                      onChange={(e) => props.onOtherText(q.key, e.target.value)}
                      placeholder={a.otherPlaceholder}
                      maxLength={200}
                      className="mt-3 w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder-white/30 outline-none transition focus:border-[#c9a040] focus:bg-white/10"
                    />
                  )}
                </fieldset>
              );
            })}

            {section === "process" && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
                <p className="text-base font-semibold text-white md:text-lg">
                  {a.wish.label}{" "}
                  <span className="text-sm font-normal text-white/45">({a.optional})</span>
                </p>
                <input
                  type="text"
                  value={props.wish}
                  onChange={(e) => props.onWish(e.target.value)}
                  placeholder={a.wish.placeholder}
                  maxLength={600}
                  className="mt-4 w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder-white/30 outline-none transition focus:border-[#c9a040] focus:bg-white/10"
                />
              </div>
            )}
          </div>
        </section>
      ))}

      {/* Contact block */}
      <section className="mt-10 rounded-2xl border border-[#c9a040]/50 bg-[#c9a040]/[0.04] p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a040]">
          {a.contactBlock.heading}
        </p>
        <p className="mt-2 text-sm text-white/65">{a.contactBlock.sub}</p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ContactField
            label={a.contactBlock.fields.name}
            value={props.contact.name}
            onChange={(v) => props.onContact("name", v)}
            autoComplete="name"
            required
          />
          <ContactField
            label={a.contactBlock.fields.role}
            value={props.contact.role}
            onChange={(v) => props.onContact("role", v)}
            autoComplete="organization-title"
            required
          />
          <ContactField
            label={a.contactBlock.fields.company}
            value={props.contact.company}
            onChange={(v) => props.onContact("company", v)}
            autoComplete="organization"
            required
          />
          <ContactField
            label={a.contactBlock.fields.email}
            value={props.contact.email}
            onChange={(v) => props.onContact("email", v)}
            type="email"
            autoComplete="email"
            required
          />
          <ContactField
            label={a.contactBlock.fields.phone}
            value={props.contact.phone}
            onChange={(v) => props.onContact("phone", v)}
            type="tel"
            autoComplete="tel"
          />
        </div>
        <p className="mt-4 text-xs text-white/50">{a.contactBlock.hint}</p>

        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-white/75">
          <input
            type="checkbox"
            checked={props.accepted}
            onChange={(e) => props.onAccept(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#c9a040]"
          />
          <span>
            {t.legal.accept.intro}{" "}
            <Link
              href={`/${locale}/privacy`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c9a040] underline-offset-4 hover:underline"
            >
              {t.legal.accept.privacy}
            </Link>{" "}
            {t.legal.accept.and}{" "}
            <Link
              href={`/${locale}/terms`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c9a040] underline-offset-4 hover:underline"
            >
              {t.legal.accept.terms}
            </Link>
            .
          </span>
        </label>
      </section>

      {props.errorMsg && (
        <p className="mt-5 text-center text-sm text-red-400" role="alert">
          {props.errorMsg}
        </p>
      )}

      <button
        type="button"
        onClick={props.onSubmit}
        disabled={props.submitting}
        className="btn-gold mt-7 w-full text-base disabled:cursor-not-allowed disabled:opacity-60"
      >
        {props.submitting ? a.submitting : a.submit}
        {!props.submitting && <span className="btn-arrow">→</span>}
      </button>
    </div>
  );
}

function ContactField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-white/60">
        {props.label}
        {props.required && <span className="ml-1 text-[#c9a040]">*</span>}
      </span>
      <input
        type={props.type || "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        autoComplete={props.autoComplete}
        required={props.required}
        maxLength={160}
        className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder-white/30 outline-none transition focus:border-[#c9a040] focus:bg-white/10"
      />
    </label>
  );
}

/* ─────────────────────── Results ─────────────────────── */

function ResultsView(props: {
  t: Dict;
  locale: "es" | "en";
  result: SubmitResult;
  email: string;
}) {
  const { t, locale, result } = props;
  const a = t.assessment;
  const band = a.score.bands[result.band];
  const color = BAND_COLORS[result.band];

  return (
    <div className="motion-safe:animate-fadeInUp">
      {/* Score */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-7 text-center md:p-10">
        <span className="inline-flex items-center rounded-full border border-[#c9a040]/50 bg-[#c9a040]/[0.08] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#c9a040]">
          {a.score.pill}
        </span>
        <p className="mt-5 text-xs uppercase tracking-[0.2em] text-white/50">{a.score.heading}</p>
        <p className="mt-2 text-[64px] font-bold leading-none" style={{ color }}>
          {result.score}
          <span className="text-2xl text-white/40">/100</span>
        </p>
        <p className="mt-2 text-xl font-semibold" style={{ color }}>
          {band.label}
        </p>
        <div className="mx-auto mt-5 h-2.5 max-w-md overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${result.score}%`, background: color }}
          />
        </div>
        <p className="mx-auto mt-4 max-w-lg text-sm text-white/70 md:text-base">{band.desc}</p>
      </div>

      {/* Dimensions */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a040]">
          {a.score.dimsHeading}
        </p>
        <div className="mt-4 space-y-4">
          {result.dimensions.map((d) => (
            <div key={d.key}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm text-white/80">{a.score.dims[d.key]}</p>
                <p className="font-mono text-xs text-white/50">{d.value}/100</p>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(4, d.value)}%`,
                    background: d.value < 35 ? "#ef6a4d" : d.value < 65 ? "#c9a040" : "#4dbd74",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What happens next */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-7">
        <p className="text-lg font-semibold text-white md:text-xl">✦ {a.next.heading}</p>
        <p className="mt-3 text-white/75">{a.next.body}</p>
        <p className="mt-4 text-sm text-[#c9a040]">
          {a.next.emailNote.replace("{email}", props.email)}
        </p>
      </div>

      {/* CTA to full assessment */}
      <div className="mt-8 rounded-3xl border border-[#c9a040]/50 bg-gradient-to-br from-[#c9a040]/[0.10] to-transparent p-7 text-center md:p-9">
        <p className="text-2xl font-semibold text-[#c9a040]">{a.next.cta.heading}</p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/75 md:text-base">{a.next.cta.body}</p>
        <Link href={`/${locale}/contact`} className="btn-gold mt-6">
          {a.next.cta.button}
          <span className="btn-arrow">→</span>
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-white/40">{a.next.disclaimer}</p>
    </div>
  );
}
