"use client";

import { FormEvent, useState } from "react";
import { useT } from "@/lib/i18n/LocaleProvider";

export function NewQuestionnaireForm({ locale }: { locale: string }) {
  const t = useT();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("client_email") || "").trim().toLowerCase();
    const emailConfirm = String(fd.get("client_email_confirm") || "").trim().toLowerCase();
    const name = String(fd.get("client_name") || "").trim();
    const preferred_locale = String(fd.get("preferred_locale") || "es");

    if (!name || name.length > 200) {
      setError(t.app.common.error);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.app.common.error);
      return;
    }
    if (email !== emailConfirm) {
      setError(locale === "en" ? "Emails do not match." : "Los correos no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/questionnaires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: name,
          client_email: email,
          preferred_locale,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "create_failed");
      window.location.href = `/${locale}/admin/${body.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : t.app.common.error);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label={t.app.admin.clientNameLabel}>
        <input
          name="client_name"
          required
          maxLength={200}
          className="w-full rounded border border-white/15 bg-black px-3 py-2 outline-none focus:border-white/40"
        />
      </Field>
      <Field label={t.app.admin.clientEmailLabel}>
        <input
          type="email"
          name="client_email"
          required
          maxLength={320}
          autoComplete="off"
          className="w-full rounded border border-white/15 bg-black px-3 py-2 outline-none focus:border-white/40"
        />
      </Field>
      <Field label={t.app.admin.clientEmailConfirmLabel}>
        <input
          type="email"
          name="client_email_confirm"
          required
          maxLength={320}
          autoComplete="off"
          onPaste={(e) => e.preventDefault()}
          className="w-full rounded border border-white/15 bg-black px-3 py-2 outline-none focus:border-white/40"
        />
      </Field>
      <Field label={t.app.admin.preferredLocaleLabel}>
        <select
          name="preferred_locale"
          defaultValue="es"
          className="w-full rounded border border-white/15 bg-black px-3 py-2 outline-none focus:border-white/40"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </Field>

      {error && <p className="text-sm text-red-300">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-white px-4 py-2 font-medium text-black hover:bg-white/90 disabled:opacity-60"
      >
        {submitting ? t.app.common.saving : t.app.admin.saveDraft}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-white/70">{label}</span>
      {children}
    </label>
  );
}
