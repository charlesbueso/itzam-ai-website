"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/LocaleProvider";

type Collaborator = {
  user_id: string;
  email: string;
  joined_at: string;
  is_self: boolean;
};

type Pending = { email: string; invited_at: string };

type ListResponse = {
  collaborators: Collaborator[];
  pending: Pending[];
  max_total: number;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CollaboratorsPanel({
  questionnaireId,
  currentUserEmail,
}: {
  questionnaireId: string;
  currentUserEmail: string;
}) {
  const t = useT();
  const c = t.app.questionnaire.collaborators;
  const [data, setData] = useState<ListResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch(`/api/questionnaires/${questionnaireId}/collaborators`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const body = (await res.json()) as ListResponse;
      setData(body);
    } catch {
      // ignore — panel is non-critical
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionnaireId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value)) {
      setStatus("error");
      setErrorMsg(c.invalidEmail);
      return;
    }
    if (value === currentUserEmail.toLowerCase()) {
      setStatus("error");
      setErrorMsg(c.selfInvite);
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(`/api/questionnaires/${questionnaireId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        if (body.error === "limit_reached") setErrorMsg(c.limitReached);
        else if (body.error === "self_invite") setErrorMsg(c.selfInvite);
        else setErrorMsg(c.genericError);
        return;
      }
      setStatus("ok");
      setEmail("");
      await load();
      setTimeout(() => setStatus((s) => (s === "ok" ? "idle" : s)), 1800);
    } catch {
      setStatus("error");
      setErrorMsg(c.genericError);
    }
  }

  const max = data?.max_total ?? 4;
  const total = (data?.collaborators.length ?? 0) + (data?.pending.length ?? 0);
  const atLimit = total >= max;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-[11px] uppercase tracking-widest text-white/50 hover:text-white/80"
      >
        {c.heading} ({total}/{max}) {open ? "▾" : "▸"}
      </button>
      {open && (
        <div className="mt-2 w-72 rounded border border-white/10 bg-white/[0.03] p-3 text-left">
          <ul className="space-y-1 text-xs">
            {(data?.collaborators ?? []).map((p) => (
              <li key={p.user_id} className="flex items-center justify-between gap-2">
                <span className="truncate text-white/85">{p.email || "—"}</span>
                {p.is_self && <span className="text-[10px] text-white/40">{c.you}</span>}
              </li>
            ))}
            {(data?.pending ?? []).map((p) => (
              <li key={`pending-${p.email}`} className="flex items-center justify-between gap-2">
                <span className="truncate text-white/60">{p.email}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#c9a040]">
                  {c.pending}
                </span>
              </li>
            ))}
          </ul>

          {!atLimit && (
            <form onSubmit={onSubmit} className="mt-3 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder={c.addPlaceholder}
                className="flex-1 rounded border border-white/15 bg-black/40 px-2 py-1 text-xs text-white outline-none focus:border-white/40"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded bg-white px-3 py-1 text-xs font-medium text-black hover:bg-white/90 disabled:opacity-50"
              >
                {status === "sending" ? c.adding : c.addCta}
              </button>
            </form>
          )}

          <div className="mt-2 min-h-[1rem] text-[11px]">
            {status === "ok" && <span className="text-emerald-300">{c.added}</span>}
            {status === "error" && errorMsg && <span className="text-red-300">{errorMsg}</span>}
            {status === "idle" && !atLimit && <span className="text-white/40">{c.max}</span>}
            {atLimit && <span className="text-white/50">{c.limitReached}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
