"use client";

import { FormEvent, useState } from "react";
import { useT } from "@/lib/i18n/LocaleProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm({ locale }: { locale: string }) {
  const t = useT();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim().toLowerCase();
    const password = String(fd.get("password") || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
      setError(t.app.login.invalid);
      setSubmitting(false);
      return;
    }
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        // Generic message — never leak which field is wrong.
        setError(t.app.login.invalid);
        setSubmitting(false);
        return;
      }
      window.location.href = `/${locale}/post-login`;
    } catch (err) {
      console.error(err);
      setError(t.app.login.invalid);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} method="post" className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm text-white/70">
          {t.app.login.emailLabel}
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="w-full rounded border border-white/15 bg-black px-3 py-2 text-white outline-none focus:border-white/40"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-white/70">
          {t.app.login.passwordLabel}
        </span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="current-password"
          className="w-full rounded border border-white/15 bg-black px-3 py-2 text-white outline-none focus:border-white/40"
        />
      </label>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-white px-4 py-2 font-medium text-black transition hover:bg-white/90 disabled:opacity-60"
      >
        {submitting ? t.app.login.submitting : t.app.login.submit}
      </button>
    </form>
  );
}
