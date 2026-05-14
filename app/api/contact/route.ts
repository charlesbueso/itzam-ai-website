import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { contactNotification, contactConfirmationEmail } from "@/lib/email/templates";
import {
  getResend,
  RESEND_FROM,
  RESEND_REPLY_TO,
  safeHeader,
} from "@/lib/email/resend";
import { upsertContact, createNoteForContact, nameFrom } from "@/lib/hubspot/client";

export const runtime = "nodejs";

/**
 * Contact form submissions.
 * 1) Forwards row to Google Sheets (same webhook as before).
 * 2) Fires a non-blocking Resend email to INTERNAL_NOTIFY_EMAIL.
 *
 * Env: GOOGLE_SHEETS_WEBHOOK_URL, INTERNAL_NOTIFY_EMAIL (optional).
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = String(body.email || "").trim();
  const name = String(body.name || "").trim();
  const company = String(body.company || "").trim();
  const role = String(body.role || "").trim();
  const use_case = String(body.use_case || "").trim();

  if (!email || !name || !company || !use_case) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  // Honeypot — silently accept then drop.
  if (typeof body.company_website === "string" && body.company_website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhook) {
    console.error("GOOGLE_SHEETS_WEBHOOK_URL is not set");
    return NextResponse.json(
      { error: "Server is not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        ip:
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          null,
        user_agent: req.headers.get("user-agent") || null,
      }),
    });
    const responseBody = await res.json().catch(() => null);
    if (!res.ok || (responseBody && responseBody.ok === false)) {
      console.error("Sheets webhook failed:", res.status, responseBody);
      return NextResponse.json(
        { error: "Could not save submission" },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("Sheets webhook threw:", err);
    return NextResponse.json(
      { error: "Could not save submission" },
      { status: 502 }
    );
  }

  // Non-blocking Resend notification.
  const notifyTo = process.env.INTERNAL_NOTIFY_EMAIL || RESEND_REPLY_TO;
  const resend = getResend();
  if (resend && notifyTo) {
    const tpl = contactNotification({ name, email, company, role, use_case });
    void resend.emails
      .send({
        from: RESEND_FROM,
        to: notifyTo,
        subject: safeHeader(tpl.subject),
        html: tpl.html,
        text: tpl.text,
        replyTo: email,
      })
      .catch((err) => {
        console.error("Resend contact notification failed:", err);
      });
  }

  // Detect locale + variant from the request. The form lives at both
  // /en/contact and /es/contact (plus the legacy /api/waitlist alias).
  const referer = req.headers.get("referer") || "";
  const path = (() => {
    try {
      return new URL(referer).pathname;
    } catch {
      return "";
    }
  })();
  const locale: "es" | "en" = /^\/en(\/|$)/.test(path) ? "en" : "es";
  const isWaitlist = new URL(req.url).pathname.includes("waitlist");
  const source = isWaitlist ? "waitlist" : "contact_form";

  // Non-blocking confirmation email to the submitter. Reply-To is our
  // internal address so any reply lands in the team inbox.
  if (resend) {
    const tpl = contactConfirmationEmail({
      name,
      locale,
      variant: isWaitlist ? "waitlist" : "contact",
    });
    void resend.emails
      .send({
        from: RESEND_FROM,
        to: email,
        replyTo: RESEND_REPLY_TO,
        subject: safeHeader(tpl.subject),
        html: tpl.html,
        text: tpl.text,
      })
      .catch((err) => {
        console.error("Resend contact confirmation failed:", err);
      });
  }

  // Non-blocking HubSpot CRM sync.
  const { firstname, lastname } = nameFrom(name);
  // `waitUntil` keeps the serverless function alive past the response so the
  // HubSpot round-trips (contact upsert + note attach) actually complete on
  // Vercel. Locally, it just resolves whenever the promise does.
  waitUntil(
    (async () => {
      const r = await upsertContact({
        email,
        firstname,
        lastname,
        company,
        jobtitle: role || undefined,
        lifecyclestage: "lead",
        source,
        properties: {
          // Custom property — create it in HubSpot if you want it queryable
          // (Settings → Properties → Contacts → multi-line text). It's also
          // duplicated in the Note below so it's always visible regardless.
          itzam_use_case: use_case || null,
        },
      });
      if (!r.ok) {
        if (r.error !== "hubspot_not_configured") {
          console.warn("[hubspot] contact sync failed:", r.error);
        }
        return;
      }
      console.log(`[hubspot] contact ${r.created ? "created" : "updated"} id=${r.id} for ${email}`);

      // Attach the submission as a Note so it shows on the contact's timeline
      // (the right place for freeform messages — custom properties get buried).
      if (!use_case) return;
      const noteBody = [
        `<p><strong>New ${isWaitlist ? "waitlist" : "contact form"} submission</strong></p>`,
        `<p><strong>Name:</strong> ${escapeHtml(name)}<br/>`,
        `<strong>Email:</strong> ${escapeHtml(email)}<br/>`,
        `<strong>Company:</strong> ${escapeHtml(company)}<br/>`,
        role ? `<strong>Role:</strong> ${escapeHtml(role)}<br/>` : "",
        `<strong>Source:</strong> ${escapeHtml(source)}</p>`,
        `<p><strong>Message:</strong></p>`,
        `<p>${escapeHtml(use_case).replace(/\n/g, "<br/>")}</p>`,
      ].join("");
      const noteRes = await createNoteForContact({ contactId: r.id, body: noteBody });
      if (!noteRes.ok) {
        if (noteRes.error !== "hubspot_not_configured") {
          console.warn("[hubspot] note attach failed:", noteRes.error);
        }
        return;
      }
      console.log(`[hubspot] note attached id=${noteRes.id} to contact ${r.id}`);
    })().catch((e) => {
      console.error("[hubspot] background sync threw", e);
    })
  );

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
