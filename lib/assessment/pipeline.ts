import "server-only";

import { SELF_QUESTIONS, answerLabel, type SelfAnswers } from "./questions";
import type { ScoreResult } from "./scoring";
import { isCompanyEmail } from "./emailDomains";
import {
  isReportEnabled,
  legitCheck,
  generateReportContent,
  type ReportInput,
} from "./report";
import { renderReportPdf } from "./pdf";
import { saveReportToDrive } from "./drive";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { getResend, RESEND_FROM, safeHeader } from "@/lib/email/resend";
import { assessmentTeamEmail, type ReportStatus } from "@/lib/email/templates";

/**
 * Gated report pipeline for the Free AI Assessment. Runs after the fast submit
 * path (score + Sheet) inside the route's `waitUntil`.
 *
 *   company email? → rate limit → Haiku legit-check → Sonnet 5 content →
 *   PDF → Drive → team email (with PDF attached).
 *
 * A team notification is ALWAYS sent — either with the generated report, or
 * with the reason it was skipped/flagged — so nothing slips silently. The lead
 * report is NOT auto-sent; the team reviews the Drive PDF and forwards it.
 */

export type PipelineInput = {
  locale: "es" | "en";
  contact: { name: string; role: string; company: string; email: string; phone: string };
  answers: SelfAnswers;
  otherTexts: Record<string, string>;
  wish: string;
  score: ScoreResult;
  ip: string | null;
};

function labelFor(key: string, locale: "es" | "en", answers: SelfAnswers, otherTexts: Record<string, string>): string {
  const q = SELF_QUESTIONS.find((x) => x.key === key);
  if (!q) return "";
  let val = answerLabel(q, answers[key], locale);
  const other = otherTexts[key];
  if (other) val += ` (${other})`;
  return val;
}

function formatDate(locale: "es" | "en", d = new Date()): string {
  if (locale === "en") {
    return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" }).format(d);
  }
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${d.getDate()} de ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim().slice(0, 100);
}

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Skip the company-email + rate-limit gates for local testing. On in dev by
// default (like the rate-limiter's fail-open); force in any env with
// ASSESSMENT_SKIP_GATES=1. The legitimacy check still runs. Never skips in
// production unless the override is explicitly set.
const skipGates =
  process.env.NODE_ENV !== "production" || process.env.ASSESSMENT_SKIP_GATES === "1";

export async function generateAndNotifyReport(input: PipelineInput): Promise<void> {
  const resend = getResend();
  const notifyTo = process.env.INTERNAL_NOTIFY_EMAIL;

  const bottleneck = labelFor("bottleneck_1", "es", input.answers, input.otherTexts);
  const bandLabelEs = { explorer: "Explorador", in_progress: "En marcha", advanced: "Avanzado" }[input.score.band];

  async function notify(
    status: ReportStatus,
    extra?: { pdf?: Buffer; driveUrl?: string; legitReason?: string }
  ) {
    if (!resend || !notifyTo) return;
    const tpl = assessmentTeamEmail({
      name: input.contact.name,
      email: input.contact.email,
      company: input.contact.company,
      role: input.contact.role,
      score: input.score.score,
      band: bandLabelEs,
      bottleneck,
      wish: input.wish,
      status,
      driveUrl: extra?.driveUrl,
      legitReason: extra?.legitReason,
    });
    try {
      await resend.emails.send({
        from: RESEND_FROM,
        to: notifyTo,
        replyTo: input.contact.email,
        subject: safeHeader(tpl.subject),
        html: tpl.html,
        text: tpl.text,
        attachments: extra?.pdf
          ? [{ filename: `${sanitizeFilename(`Assessment - ${input.contact.company}`)}.pdf`, content: extra.pdf }]
          : undefined,
      });
    } catch (e) {
      console.error("[assessment] team email failed:", e instanceof Error ? e.message : String(e));
    }
  }

  // Gate 0 — report generation available?
  if (!isReportEnabled()) return notify("disabled");

  if (skipGates) {
    console.log("[assessment] gate bypass on (dev / ASSESSMENT_SKIP_GATES) — skipping email + rate-limit gates");
  }

  // Gate 1 — company email only (the main abuse guard).
  if (!skipGates && !isCompanyEmail(input.contact.email)) return notify("skipped_personal_email");

  // Gate 2 — rate limit by email + IP (only when Supabase is available).
  if (!skipGates && supabaseConfigured) {
    try {
      const emailRl = await checkRateLimit({
        bucket: "assessment_report_email",
        identifier: input.contact.email,
        limit: 1,
        windowSeconds: 7 * 24 * 3600,
      });
      const ipRl = input.ip
        ? await checkRateLimit({
            bucket: "assessment_report_ip",
            identifier: input.ip,
            limit: 5,
            windowSeconds: 24 * 3600,
          })
        : { allowed: true };
      if (!emailRl.allowed || !ipRl.allowed) return notify("skipped_rate_limit");
    } catch (e) {
      // Fail open — rate limiting is defense-in-depth, not a hard gate.
      console.warn("[assessment] rate limit check skipped:", e instanceof Error ? e.message : String(e));
    }
  }

  const industry = labelFor("industry", input.locale, input.answers, input.otherTexts);
  const reportInput: ReportInput = {
    locale: input.locale,
    firstName: input.contact.name.split(/\s+/)[0] || input.contact.name,
    fullName: input.contact.name,
    role: input.contact.role,
    company: input.contact.company,
    industry,
    answers: input.answers,
    otherTexts: input.otherTexts,
    wish: input.wish,
    score: input.score,
  };

  // Gate 3 — Haiku legitimacy screen (cheap) before the expensive report call.
  const legit = await legitCheck(reportInput);
  if (legit && !legit.legit) {
    return notify("flagged_not_legit", { legitReason: legit.reason });
  }

  // Generate the report prose (Sonnet 5).
  let generated;
  try {
    generated = await generateReportContent(reportInput);
  } catch (e) {
    console.error("[assessment] report generation threw:", e instanceof Error ? e.message : String(e));
    return notify("generation_failed");
  }
  if (!generated) return notify("generation_failed");

  // Render the PDF.
  let pdf: Buffer;
  try {
    pdf = await renderReportPdf({
      meta: {
        fullName: input.contact.name,
        role: input.contact.role,
        company: input.contact.company,
        industry,
        dateStr: formatDate(input.locale),
      },
      locale: input.locale,
      score: input.score,
      content: generated.content,
    });
  } catch (e) {
    console.error("[assessment] pdf render failed:", e instanceof Error ? e.message : String(e));
    return notify("generation_failed");
  }

  // Upload to Drive (best-effort — the team email still carries the PDF if this fails).
  // Structure: "Itzam — AI Free Assessment" / <Company> / <file>.pdf
  let driveUrl: string | undefined;
  try {
    const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (filename-safe, sortable)
    const saved = await saveReportToDrive({
      company: input.contact.company,
      filename: `${input.contact.company} (${input.contact.name}) - ${dateStr} - Free AI Assessment.pdf`,
      pdf,
    });
    driveUrl = saved.url;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const cause = (e as { cause?: { code?: string; message?: string } })?.cause;
    console.error(
      "[assessment] drive upload failed:",
      msg,
      cause ? `| cause: ${cause.code || cause.message || JSON.stringify(cause)}` : ""
    );
  }

  await notify("generated", { pdf, driveUrl });
}
