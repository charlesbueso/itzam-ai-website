"use client";

import { useState } from "react";

import { useT } from "@/lib/i18n/LocaleProvider";

export function SignupForm({
  locale,
  defaultEmail,
}: {
  locale: string;
  defaultEmail: string;
}) {
  const t = useT();
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password.length < 10) {
      setError(t.app.signup.errPasswordShort);
      return;
    }
    if (password !== confirm) {
      setError(t.app.signup.errPasswordMismatch);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (body?.error === "exists") {
          window.location.href = `/${locale}/signup?reason=exists`;
          return;
        }
        if (body?.error === "weak_password") {
          setError(t.app.signup.errPasswordShort);
          return;
        }
        setError(t.app.signup.errGeneric);
        return;
      }
      window.location.href = `/${locale}/signup?confirm=1`;
    } catch {
      setError(t.app.signup.errGeneric);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form method="post" onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-white/50">
          {t.app.signup.emailLabel}
        </span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          className="w-full rounded border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-[#c9a040]"
          maxLength={320}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-white/50">
          {t.app.signup.passwordLabel}
        </span>
        <input
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-[#c9a040]"
          minLength={10}
          maxLength={128}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-white/50">
          {t.app.signup.confirmLabel}
        </span>
        <input
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-[#c9a040]"
          minLength={10}
          maxLength={128}
        />
      </label>

      {error && (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded bg-[#c9a040] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#d8b257] disabled:opacity-60"
      >
        {busy ? t.app.signup.submitting : t.app.signup.submit}
      </button>

      <p className="text-xs text-white/40">{t.app.signup.passwordHelp}</p>
    </form>
  );
}
