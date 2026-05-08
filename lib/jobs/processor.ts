import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getResend, RESEND_FROM, RESEND_REPLY_TO, safeHeader } from "@/lib/email/resend";
import { adminNotifyEmail, clientCompletedEmail } from "@/lib/email/templates";

const MAX_BATCH = 20;

/**
 * Outbox job processor. Idempotent — each job either succeeds (status=succeeded)
 * or schedules a backoff retry until max_attempts is hit.
 */
export async function processJobs(opts: { limit?: number; questionnaireId?: string } = {}) {
  const supabase = getSupabaseAdminClient();
  const limit = Math.min(opts.limit ?? MAX_BATCH, MAX_BATCH);

  let q = supabase
    .from("submission_jobs")
    .select("id, questionnaire_id, kind, attempts, max_attempts, status")
    .eq("status", "pending")
    .lte("next_retry_at", new Date().toISOString())
    .order("next_retry_at", { ascending: true })
    .limit(limit);

  if (opts.questionnaireId) q = q.eq("questionnaire_id", opts.questionnaireId);

  const { data: jobs, error } = await q;
  if (error || !jobs) {
    console.error("processJobs fetch failed", error);
    return { processed: 0 };
  }

  console.log(`🔧 processJobs: found ${jobs.length} pending job(s)${opts.questionnaireId ? ` for ${opts.questionnaireId}` : ""}`);

  let processed = 0;
  for (const job of jobs) {
    // Claim the job — set status=running with optimistic concurrency.
    const { data: claimed } = await supabase
      .from("submission_jobs")
      .update({ status: "running" })
      .eq("id", job.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (!claimed) continue;

    try {
      await runJob(job.kind as JobKind, job.questionnaire_id as string);
      await supabase
        .from("submission_jobs")
        .update({ status: "succeeded", last_error: null })
        .eq("id", job.id);
      console.log(`✅ job ${job.kind} succeeded for ${job.questionnaire_id}`);
      processed += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const attempts = (job.attempts as number) + 1;
      const giveUp = attempts >= (job.max_attempts as number);
      const backoffMin = Math.min(60, Math.pow(2, attempts)); // 2,4,8,16,32,60 minutes
      const next = new Date(Date.now() + backoffMin * 60 * 1000);
      await supabase
        .from("submission_jobs")
        .update({
          status: giveUp ? "failed" : "pending",
          attempts,
          last_error: msg.slice(0, 500),
          next_retry_at: next.toISOString(),
        })
        .eq("id", job.id);
      console.error(`❌ job ${job.kind} failed for ${job.questionnaire_id} (attempt ${attempts}/${job.max_attempts}): ${msg}`);
    }
  }

  return { processed };
}

type JobKind = "client_folder" | "drive" | "client_email" | "admin_email";

async function runJob(kind: JobKind, questionnaireId: string) {
  const supabase = getSupabaseAdminClient();
  const { data: q, error } = await supabase
    .from("questionnaires")
    .select("id, client_name, client_company, client_email, preferred_locale, client_folder_url, drive_folder_url")
    .eq("id", questionnaireId)
    .single();
  if (error || !q) throw new Error(`questionnaire not found ${questionnaireId}`);

  // Drive folders are organized by company. Fall back to client_name for any
  // pre-migration row that didn't get backfilled.
  const driveRoot = (q.client_company as string | null) || (q.client_name as string);

  if (kind === "client_folder") {
    if (q.client_folder_url) return; // already done
    const url = process.env.DRIVE_WEBHOOK_URL;
    const secret = process.env.DRIVE_WEBHOOK_SECRET;
    if (!url || !secret) throw new Error("drive webhook not configured");
    const body = await postDrive(url, secret, {
      action: "ensure_client_folder",
      client_name: driveRoot,
    });
    await supabase
      .from("questionnaires")
      .update({ client_folder_url: body.client_folder_url || null })
      .eq("id", q.id);
    return;
  }

  if (kind === "drive") {
    if (q.drive_folder_url) return; // already done
    const url = process.env.DRIVE_WEBHOOK_URL;
    const secret = process.env.DRIVE_WEBHOOK_SECRET;
    if (!url || !secret) throw new Error("drive webhook not configured");

    // Fetch answers + question labels for the Sheet.
    const { data: questions } = await supabase
      .from("questions")
      .select("id, position, label_es, label_en, type, options")
      .eq("questionnaire_id", q.id)
      .order("position", { ascending: true });
    const { data: answers } = await supabase
      .from("answers")
      .select("question_id, value")
      .eq("questionnaire_id", q.id);
    const ansMap = new Map((answers || []).map((a) => [a.question_id, a.value]));

    const payload = {
      action: "create_assessment",
      questionnaire_id: q.id,
      client_name: driveRoot,
      client_contact: q.client_name,
      client_email: q.client_email,
      locale: q.preferred_locale,
      submitted_at: new Date().toISOString(),
      rows: (questions || []).map((qu) => ({
        position: qu.position,
        question:
          q.preferred_locale === "en" ? (qu.label_en as string | undefined) ?? (qu as any).label_es : (qu as any).label_es,
        answer: stringifyAnswer(qu.type as string, qu.options as any, ansMap.get(qu.id), (q.preferred_locale as "es" | "en") || "es"),
      })),
    };

    const body = await postDrive(url, secret, payload);
    await supabase
      .from("questionnaires")
      .update({
        drive_folder_url: body.assessment_folder_url || null,
        drive_sheet_url: body.sheet_url || null,
      })
      .eq("id", q.id);
    return;
  }

  if (kind === "client_email") {
    const resend = getResend();
    if (!resend) throw new Error("resend not configured");
    const tpl = clientCompletedEmail({
      clientName: q.client_name as string,
      locale: ((q.preferred_locale as "es" | "en") || "es"),
    });
    const { error: err } = await resend.emails.send({
      from: RESEND_FROM,
      to: q.client_email as string,
      replyTo: RESEND_REPLY_TO,
      subject: safeHeader(tpl.subject),
      html: tpl.html,
      text: tpl.text,
    });
    if (err) throw new Error(`resend client: ${err.message}`);
    return;
  }

  if (kind === "admin_email") {
    const resend = getResend();
    if (!resend) throw new Error("resend not configured");
    const to = process.env.INTERNAL_NOTIFY_EMAIL;
    if (!to) throw new Error("INTERNAL_NOTIFY_EMAIL not set");
    const baseUrl = process.env.APP_BASE_URL || "https://app.itzam.ai";
    const locale = (q.preferred_locale as string) || "es";
    const tpl = adminNotifyEmail({
      clientName: q.client_name as string,
      clientEmail: q.client_email as string,
      questionnaireUrl: `${baseUrl}/${locale}/admin/${q.id}`,
    });
    const { error: err } = await resend.emails.send({
      from: RESEND_FROM,
      to,
      replyTo: RESEND_REPLY_TO,
      subject: safeHeader(tpl.subject),
      html: tpl.html,
      text: tpl.text,
    });
    if (err) throw new Error(`resend admin: ${err.message}`);
    return;
  }
}

function stringifyAnswer(
  type: string,
  options: Array<{ value: string; label_es: string; label_en: string }> | null,
  value: unknown,
  locale: "es" | "en"
): string {
  if (value == null) return "";
  if (type === "text") return String(value);
  const labelFor = (v: string) => {
    const o = (options || []).find((opt) => opt.value === v);
    if (!o) return v;
    return locale === "en" ? o.label_en : o.label_es;
  };
  if (type === "single") return labelFor(String(value));
  if (type === "multi" && Array.isArray(value)) return (value as string[]).map(labelFor).join(", ");
  return String(value);
}

async function postDrive(url: string, secret: string, payload: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Itzam-Secret": secret,
    },
    // Body fallback for the secret — Apps Script Web Apps don't always expose
    // custom request headers, so we send it both ways.
    body: JSON.stringify({ ...payload, secret }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body || body.ok === false) {
    throw new Error(`drive webhook ${res.status}: ${JSON.stringify(body).slice(0, 200)}`);
  }
  return body as Record<string, any>;
}
