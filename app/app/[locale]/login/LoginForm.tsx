"use client";

import { FormEvent, useState } from "react";
import { useT } from "@/lib/i18n/LocaleProvider";
import { PasswordInput } from "@/components/PasswordInput";
import { Turnstile } from "@/components/Turnstile";

export function LoginForm({ locale, next }: { locale: string; next?: string | null }) {
  const t = useT();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRequired = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

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
    if (captchaRequired && !captchaToken) {
      setError(t.app.login.captcha);
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, turnstileToken: captchaToken }),
      });
      if (res.status === 429) {
        setError(t.app.login.rateLimited);
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        if (body?.error === "captcha") {
          setError(t.app.login.captcha);
          // Force a fresh challenge by clearing the stored token.
          setCaptchaToken("");
          setSubmitting(false);
          return;
        }
        // Generic message — never leak which field is wrong.
        setError(t.app.login.invalid);
        setSubmitting(false);
        return;
      }
      const target = next
        ? `/${locale}/post-login?next=${encodeURIComponent(next)}`
        : `/${locale}/post-login`;
      window.location.href = target;
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
        <PasswordInput
          name="password"
          required
          minLength={8}
          autoComplete="current-password"
          showLabel={t.app.common.showPassword}
          hideLabel={t.app.common.hidePassword}
        />
      </label>
      <Turnstile onToken={setCaptchaToken} action="login" />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={submitting || (captchaRequired && !captchaToken)}
        className="w-full rounded bg-white px-4 py-2 font-medium text-black transition hover:bg-white/90 disabled:opacity-60"
      >
        {submitting ? t.app.login.submitting : t.app.login.submit}
      </button>
    </form>
  );
}
