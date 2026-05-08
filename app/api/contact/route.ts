import { NextResponse } from "next/server";
import { contactNotification } from "@/lib/email/templates";
import {
  getResend,
  RESEND_FROM,
  RESEND_REPLY_TO,
  safeHeader,
} from "@/lib/email/resend";

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

  return NextResponse.json({ ok: true });
}
