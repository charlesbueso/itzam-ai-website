import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { z } from "zod";
import { SELF_QUESTIONS, type SelfAnswers } from "@/lib/assessment/questions";
import { computeScore, computeValueAtStake } from "@/lib/assessment/scoring";
import { sendToSheet } from "@/lib/assessment/sheet";
import { generateAndNotifyReport } from "@/lib/assessment/pipeline";
import { upsertContact, createNoteForContact, nameFrom } from "@/lib/hubspot/client";
import {
  getResend,
  RESEND_FROM,
  RESEND_REPLY_TO,
  safeHeader,
  htmlEscape,
} from "@/lib/email/resend";
import { assessmentConfirmationEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
// The gated report pipeline (Haiku + Sonnet 5 + PDF + Drive + email) runs in
// waitUntil after the response; give it headroom (capped to the plan limit).
export const maxDuration = 60;

/**
 * POST /api/assessment — self-serve Free AI Assessment submission.
 *
 * Mirrors the contact-form flow (no Supabase, no AI):
 *   1) Validate answers + contact info (zod), honeypot.
 *   2) Compute the deterministic score server-side.
 *   3) Append a row to the Google Sheet (hard dependency).
 *   4) Non-blocking: HubSpot contact upsert + note, confirmation email to the
 *      lead, internal notify. The team generates & sends the full report from
 *      the sheet.
 *
 * Returns { score, band, dimensions } for the instant on-screen result.
 */

const AnswerValue = z.union([z.string().max(120), z.array(z.string().max(120)).max(12)]);

const BodySchema = z.object({
  locale: z.enum(["es", "en"]).default("es"),
  answers: z.record(z.string(), AnswerValue),
  otherTexts: z.record(z.string(), z.string().max(200)).default({}),
  wish: z.string().max(600).default(""),
  comments: z.string().max(1500).default(""),
  contact: z.object({
    name: z.string().min(2).max(120),
    role: z.string().min(2).max(120),
    company: z.string().min(1).max(160),
    email: z.string().email().max(200),
    phone: z.string().max(40).default(""),
  }),
  // Honeypot — real users never fill this.
  company_website: z.string().default(""),
});

function validateAnswers(answers: SelfAnswers): string | null {
  for (const q of SELF_QUESTIONS) {
    const v = answers[q.key];
    if (q.required) {
      if (q.type === "single" && (typeof v !== "string" || !v)) return q.key;
      if (q.type === "multi" && (!Array.isArray(v) || v.length === 0)) return q.key;
    }
    // Reject values outside the option set (defense in depth).
    const valid = new Set(q.options.map((o) => o.value));
    const vals = v == null ? [] : Array.isArray(v) ? v : [v];
    for (const val of vals) {
      if (!valid.has(val)) return q.key;
    }
  }
  return null;
}

export async function POST(req: Request) {
  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // Honeypot — silently accept then drop.
  if (parsed.company_website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const missing = validateAnswers(parsed.answers as SelfAnswers);
  if (missing) {
    return NextResponse.json({ error: "invalid_answers", question: missing }, { status: 400 });
  }

  const answers = parsed.answers as SelfAnswers;
  const score = computeScore(answers);
  const valueAtStake = computeValueAtStake(answers);

  const contact = {
    name: parsed.contact.name.trim(),
    role: parsed.contact.role.trim(),
    company: parsed.contact.company.trim(),
    email: parsed.contact.email.trim().toLowerCase(),
    phone: parsed.contact.phone.trim(),
  };
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const userAgent = req.headers.get("user-agent")?.slice(0, 300) || null;

  // Google Sheet is the store of record — fail the request if it doesn't land.
  try {
    await sendToSheet({
      locale: parsed.locale,
      contact,
      answers,
      otherTexts: parsed.otherTexts,
      wish: parsed.wish.trim(),
      comments: parsed.comments.trim(),
      valueAtStakeMxn: valueAtStake.mxnPerMonth,
      score,
      ip,
      userAgent,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "sheet_webhook_not_configured") {
      console.error("[assessment] GOOGLE_SHEETS_ASSESSMENT_WEBHOOK_URL is not set");
    } else {
      console.error("[assessment] sheet append failed:", msg);
    }
    return NextResponse.json({ error: "storage_failed" }, { status: 502 });
  }

  // Non-blocking: HubSpot sync + emails. `waitUntil` keeps the function alive
  // past the response so these complete on Vercel.
  const resend = getResend();
  const { firstname, lastname } = nameFrom(contact.name);

  waitUntil(
    (async () => {
      // HubSpot contact + timeline note with the full answers.
      const hs = await upsertContact({
        email: contact.email,
        firstname,
        lastname,
        company: contact.company,
        jobtitle: contact.role,
        phone: contact.phone || undefined,
        lifecyclestage: "marketingqualifiedlead",
        source: "self_assessment",
        properties: {
          itzam_assessment_score: score.score,
          itzam_assessment_band: score.band,
        },
      });
      if (hs.ok) {
        const answerRows = SELF_QUESTIONS.map((q) => {
          const label = htmlEscape(q.label_es);
          const opt = q.options.find(
            (o) => o.value === (parsed.answers as SelfAnswers)[q.key]
          );
          const raw = (parsed.answers as SelfAnswers)[q.key];
          const val = Array.isArray(raw)
            ? raw
                .map((rv) => q.options.find((o) => o.value === rv)?.label_es || rv)
                .join(", ")
            : opt?.label_es || (typeof raw === "string" ? raw : "");
          const other = parsed.otherTexts[q.key];
          return `<strong>${label}</strong><br/>${htmlEscape(val + (other ? ` (${other})` : "") || "—")}`;
        });
        const noteBody = [
          `<p><strong>Free AI Assessment completed</strong> — score ${score.score}/100 (${score.band})</p>`,
          valueAtStake.mxnPerMonth != null
            ? `<p><strong>Value at stake:</strong> ~$${valueAtStake.mxnPerMonth.toLocaleString("es-MX")} MXN/mo pipeline (directional)</p>`
            : "",
          parsed.wish ? `<p><strong>One thing to fix:</strong> ${htmlEscape(parsed.wish)}</p>` : "",
          parsed.comments ? `<p><strong>Comments:</strong> ${htmlEscape(parsed.comments)}</p>` : "",
          `<p>${answerRows.join("<br/><br/>")}</p>`,
        ].join("");
        const note = await createNoteForContact({ contactId: hs.id, body: noteBody });
        if (!note.ok && note.error !== "hubspot_not_configured") {
          console.warn("[assessment] hubspot note failed:", note.error);
        }
      } else if (hs.error !== "hubspot_not_configured") {
        console.warn("[assessment] hubspot contact sync failed:", hs.error);
      }

      // Confirmation email to the lead (score received, diagnostic on the way).
      if (resend) {
        const leadTpl = assessmentConfirmationEmail({
          name: contact.name,
          score: score.score,
          locale: parsed.locale,
        });
        const { error: leadErr } = await resend.emails.send({
          from: RESEND_FROM,
          to: contact.email,
          replyTo: RESEND_REPLY_TO,
          subject: safeHeader(leadTpl.subject),
          html: leadTpl.html,
          text: leadTpl.text,
        });
        if (leadErr) console.error("[assessment] lead confirmation email failed:", leadErr.message);
      }

      // Gated report pipeline — sends the team notification itself (with the
      // generated PDF + DOCX, or the reason it was skipped/flagged).
      await generateAndNotifyReport({
        locale: parsed.locale,
        contact,
        answers,
        otherTexts: parsed.otherTexts,
        wish: parsed.wish.trim(),
        comments: parsed.comments.trim(),
        score,
        ip,
      });
    })().catch((e) => console.error("[assessment] background task threw", e))
  );

  return NextResponse.json({
    ok: true,
    score: score.score,
    band: score.band,
    dimensions: score.dimensions,
  });
}
