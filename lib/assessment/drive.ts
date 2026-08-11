import "server-only";

/**
 * Uploads a generated report PDF to Google Drive via the assessment Apps Script
 * webhook (apps-script/assessment-webhook.gs, action "save_report") — the same
 * Web App + secret as the Sheet append, so all assessment logic lives in one
 * script. That project must be Drive-authorized once (run its authorizeDrive
 * function); no new credentials live in Vercel.
 *
 * Env: GOOGLE_SHEETS_ASSESSMENT_WEBHOOK_URL, GOOGLE_SHEETS_ASSESSMENT_SECRET
 *      (optional). Folder defaults to "Itzam — AI Free Assessment" (or the
 *      Apps Script REPORT_FOLDER_ID property).
 */

const DRIVE_FOLDER = "Itzam — AI Free Assessment";

export type DriveSaveResult = { url: string; id: string; folderUrl?: string };

/** Save a file (PDF or DOCX) into <DRIVE_FOLDER>/<company>/ via the webhook. */
export async function saveReportToDrive(opts: {
  company: string;
  filename: string;
  data: Buffer;
  mime: string;
}): Promise<DriveSaveResult> {
  const url = process.env.GOOGLE_SHEETS_ASSESSMENT_WEBHOOK_URL;
  if (!url) throw new Error("drive_webhook_not_configured");
  const secret = process.env.GOOGLE_SHEETS_ASSESSMENT_SECRET || undefined;

  const payload = JSON.stringify({
    secret,
    action: "save_report",
    filename: opts.filename,
    company: opts.company, // one subfolder per company inside DRIVE_FOLDER
    folder: DRIVE_FOLDER,
    mime: opts.mime,
    file_base64: opts.data.toString("base64"),
  });

  // Retry transient connection failures (the route to Google occasionally
  // times out on connect). Don't retry once we get an HTTP response.
  const ATTEMPTS = 3;
  let res: Response | null = null;
  for (let i = 0; i < ATTEMPTS; i++) {
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      break;
    } catch (e) {
      if (i === ATTEMPTS - 1) throw e;
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
  if (!res) throw new Error("drive_save_no_response");

  const body = (await res.json().catch(() => null)) as
    | { ok?: boolean; error?: string; file_url?: string; file_id?: string; folder_url?: string }
    | null;
  if (!res.ok || !body || body.ok === false || !body.file_url) {
    throw new Error(`drive_save_${res.status}: ${body?.error ?? "unknown"}`);
  }
  return { url: body.file_url, id: body.file_id || "", folderUrl: body.folder_url };
}
