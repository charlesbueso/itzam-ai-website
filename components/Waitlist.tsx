"use client";

import { FormEvent, useState } from "react";
import { useT } from "@/lib/i18n/LocaleProvider";

type Status = "idle" | "submitting" | "success" | "error";

export default function Waitlist() {
  const t = useT();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    if (data.get("company_website")) {
      setStatus("success");
      form.reset();
      return;
    }

    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      company: String(data.get("company") || "").trim(),
      role: String(data.get("role") || "").trim(),
      use_case: String(data.get("use_case") || "").trim(),
      submitted_at: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <section
      id="waitlist"
      className="relative w-full bg-black py-28 md:py-40"
    >
      <div className="mx-auto w-full max-w-3xl px-8 sm:px-6 md:px-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
            {t.waitlist.pill}
          </span>
        </div>

        <h2 className="text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl md:text-6xl">
          {t.waitlist.heading}
        </h2>
        <p className="mt-5 max-w-xl text-lg font-medium text-white/75 md:text-xl">
          {t.waitlist.sub}
        </p>

        {status === "success" ? (
          <div className="mt-12 rounded-xl border border-white/15 bg-white/5 p-8 backdrop-blur-sm">
            <p className="text-xl font-semibold text-white">
              {t.waitlist.successTitle}
            </p>
            <p className="mt-2 text-white/70">
              {t.waitlist.successBody}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <input
              type="text"
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />

            <Field label={t.waitlist.fields.name} name="name" required autoComplete="name" />
            <Field
              label={t.waitlist.fields.email}
              name="email"
              type="email"
              required
              autoComplete="email"
            />
            <Field
              label={t.waitlist.fields.company}
              name="company"
              required
              autoComplete="organization"
            />
            <Field label={t.waitlist.fields.role} name="role" autoComplete="organization-title" />

            <div className="md:col-span-2">
              <FieldTextarea
                label={t.waitlist.fields.useCase}
                name="use_case"
                rows={4}
                required
              />
            </div>

            <div className="md:col-span-2 flex flex-col items-start gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-white/50">
                {t.waitlist.disclaimer}
              </p>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex items-center justify-center rounded-full bg-[#c9a040] px-7 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? t.waitlist.submitting : t.waitlist.submit}
              </button>
            </div>

            {status === "error" && errorMsg && (
              <p className="md:col-span-2 text-sm text-red-400">{errorMsg}</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-white/60">
        {label}
        {required && <span className="ml-1 text-[#c9a040]">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder-white/30 outline-none transition focus:border-[#c9a040] focus:bg-white/10"
      />
    </label>
  );
}

function FieldTextarea({
  label,
  name,
  rows = 4,
  required,
}: {
  label: string;
  name: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-white/60">
        {label}
        {required && <span className="ml-1 text-[#c9a040]">*</span>}
      </span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder-white/30 outline-none transition focus:border-[#c9a040] focus:bg-white/10"
      />
    </label>
  );
}
