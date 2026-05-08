"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  questionnaireId: string;
  initial: {
    client_name: string;
    client_company: string;
    client_email: string;
    preferred_locale: "es" | "en";
  };
  labels: {
    nameLabel: string;
    nameHint?: string;
    companyLabel: string;
    companyHint?: string;
    emailLabel: string;
    localeLabel: string;
    saving: string;
    saved: string;
    saveError: string;
    invalidEmail: string;
  };
};

export function ClientInfoEditor({ questionnaireId, initial, labels }: Props) {
  const [name, setName] = useState(initial.client_name);
  const [company, setCompany] = useState(initial.client_company);
  const [email, setEmail] = useState(initial.client_email);
  const [locale, setLocale] = useState<"es" | "en">(initial.preferred_locale);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error" | "invalid">("idle");
  const dirty = useRef<Record<string, string>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function schedule() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 800);
  }

  async function flush() {
    if (Object.keys(dirty.current).length === 0) return;
    if (dirty.current.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dirty.current.client_email)) {
      setStatus("invalid");
      return;
    }
    const body = { ...dirty.current };
    dirty.current = {};
    setStatus("saving");
    try {
      const res = await fetch(`/api/admin/questionnaires/${questionnaireId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("saved");
      setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 1500);
    } catch {
      setStatus("error");
    }
  }

  function update(field: "client_name" | "client_company" | "client_email" | "preferred_locale", value: string) {
    dirty.current[field] = value;
    schedule();
  }

  const statusText =
    status === "saving" ? labels.saving :
    status === "saved" ? labels.saved :
    status === "error" ? labels.saveError :
    status === "invalid" ? labels.invalidEmail :
    "";

  return (
    <div className="rounded border border-white/10 bg-white/[0.02] p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-white/50">{labels.nameLabel}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); update("client_name", e.target.value); }}
            onBlur={flush}
            maxLength={200}
            className="w-full rounded border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
          />
          {labels.nameHint && <span className="mt-1 block text-[11px] text-white/40">{labels.nameHint}</span>}
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-white/50">{labels.companyLabel}</span>
          <input
            type="text"
            value={company}
            onChange={(e) => { setCompany(e.target.value); update("client_company", e.target.value); }}
            onBlur={flush}
            maxLength={200}
            className="w-full rounded border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
          />
          {labels.companyHint && <span className="mt-1 block text-[11px] text-white/40">{labels.companyHint}</span>}
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-white/50">{labels.emailLabel}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value.toLowerCase()); update("client_email", e.target.value.trim().toLowerCase()); }}
            onBlur={flush}
            maxLength={320}
            className="w-full rounded border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
          />
        </label>
        <label className="block sm:col-span-2 sm:max-w-[10rem]">
          <span className="mb-1 block text-xs text-white/50">{labels.localeLabel}</span>
          <select
            value={locale}
            onChange={(e) => {
              const v = e.target.value as "es" | "en";
              setLocale(v); update("preferred_locale", v); flush();
            }}
            className="w-full rounded border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>
      <div className="mt-2 h-4 text-xs text-white/50">{statusText}</div>
    </div>
  );
}
