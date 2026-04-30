import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Forwards waitlist submissions to a Google Apps Script Web App, which
 * appends a row to a Google Sheet. See README for setup.
 *
 * Required env var: GOOGLE_SHEETS_WEBHOOK_URL
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
    // Apps Script always returns HTTP 200 — inspect the body for errors.
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

  return NextResponse.json({ ok: true });
}
