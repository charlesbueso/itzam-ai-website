"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/LocaleProvider";

export function AdminQuestionnaireActions({
  locale,
  questionnaireId,
  clientEmail,
  status,
  driveFolderUrl,
  inviteUrl,
  inviteExpiresAt,
  inviteUsesCount,
}: {
  locale: string;
  questionnaireId: string;
  clientEmail: string;
  status: string;
  driveFolderUrl: string | null;
  inviteUrl: string | null;
  inviteExpiresAt: string | null;
  inviteUsesCount: number | null;
}) {
  const t = useT();
  const [issuing, setIssuing] = useState(false);
  const [link, setLink] = useState<string | null>(inviteUrl);
  const [expiresAt, setExpiresAt] = useState<string | null>(inviteExpiresAt);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function issue() {
    if (!confirm(`${t.app.admin.typoConfirm}\n\n${clientEmail}`)) return;
    setIssuing(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/questionnaires/${questionnaireId}/issue-link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "issue_failed");
      setLink(body.invite_url);
      setExpiresAt(body.expires_at || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "error");
    } finally {
      setIssuing(false);
    }
  }

  async function cancel() {
    if (!confirm(locale === "en" ? "Cancel this questionnaire?" : "¿Cancelar este cuestionario?")) return;
    const res = await fetch(
      `/api/admin/questionnaires/${questionnaireId}/cancel`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }
    );
    if (res.ok) window.location.reload();
  }

  const canIssue = status !== "completed" && status !== "cancelled";
  const isInitial = status === "draft";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {canIssue && (
          <button
            type="button"
            onClick={issue}
            disabled={issuing}
            className="rounded bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-60"
          >
            {issuing
              ? t.app.common.saving
              : isInitial
                ? t.app.admin.issueLink
                : t.app.admin.regenerateLink}
          </button>
        )}
        {driveFolderUrl && (
          <a
            href={driveFolderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/5"
          >
            {t.app.admin.driveFolder}
          </a>
        )}
        {canIssue && status !== "draft" && (
          <button
            type="button"
            onClick={cancel}
            className="rounded border border-red-500/40 px-4 py-2 text-sm text-red-200 hover:bg-red-500/10"
          >
            {t.app.admin.cancel}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}

      {link && (
        <div className="rounded border border-[#c9a040]/40 bg-[#c9a040]/5 p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-white/50">
            {t.app.admin.linkLabel}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 rounded border border-white/15 bg-black px-3 py-2 text-xs"
            />
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="rounded bg-[#c9a040] px-3 py-2 text-xs font-medium text-black hover:bg-[#d8b257]"
            >
              {copied ? t.app.admin.copied : t.app.admin.copyLink}
            </button>
          </div>
          <p className="mt-2 text-xs text-white/50">
            {locale === "en"
              ? "Copy this link and email it to the client. They can share it with teammates — it works for everyone on the client side until it expires. Regenerating invalidates the previous link."
              : "Copia este link y envíaselo al cliente por email. Puede compartirlo con su equipo — funciona para todos hasta que expire. Si lo regeneras, el anterior queda inválido."}
          </p>
          {(expiresAt || inviteUsesCount != null) && (
            <p className="mt-1 text-xs text-white/40">
              {expiresAt && (
                <>
                  {locale === "en" ? "Expires" : "Expira"}:{" "}
                  {new Date(expiresAt).toLocaleString(locale)}
                </>
              )}
              {expiresAt && inviteUsesCount != null && " · "}
              {inviteUsesCount != null && (
                <>
                  {locale === "en" ? "Opens" : "Aperturas"}: {inviteUsesCount}
                </>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
