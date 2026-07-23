import { NextResponse } from "next/server";
import { renderTestPdf } from "@/lib/assessment/pdf";
import { saveReportToDrive } from "@/lib/assessment/drive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Dev-only Drive connectivity check. Renders a tiny PDF and uploads it to the
 * "Itzam — AI Free Assessment" Drive folder via the Apps Script webhook — no
 * Anthropic tokens, no rate limits. Confirms the save_report redeploy + Drive
 * authorization. Returns 404 in production.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (!process.env.GOOGLE_SHEETS_ASSESSMENT_WEBHOOK_URL) {
    return NextResponse.json(
      { ok: false, error: "GOOGLE_SHEETS_ASSESSMENT_WEBHOOK_URL not set in .env.local" },
      { status: 400 }
    );
  }
  try {
    const pdf = await renderTestPdf();
    const saved = await saveReportToDrive({
      company: "Drive Test Co",
      filename: `Drive Test Co (Connectivity Check) - ${new Date().toISOString().slice(0, 10)} - Free AI Assessment.pdf`,
      pdf,
    });
    return NextResponse.json({ ok: true, drive_url: saved.url, file_id: saved.id });
  } catch (e) {
    const cause = (e as { cause?: { code?: string; message?: string } })?.cause;
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        cause: cause ? cause.code || cause.message || JSON.stringify(cause) : undefined,
      },
      { status: 502 }
    );
  }
}
