/**
 * Itzam.ai — Free AI Assessment webhook (Google Sheets + Drive)
 *
 * All assessment logic lives here. Two actions, dispatched by the body:
 *   • Sheet row (default): { secret?, headers: [...], values: [...] }
 *       Appends one row per /assessment submission. Row 1 is written with
 *       `headers` the first time the sheet is empty.
 *   • Save report:         { secret?, action: "save_report", filename,
 *                            company, file_base64, mime?, folder? }
 *       Saves a file (PDF or DOCX) into <parent>/<company>/, where <parent> is
 *       the REPORT_FOLDER_ID script property, or the named folder (default
 *       "Itzam — AI Free Assessment"). One subfolder per company. `mime`
 *       defaults to application/pdf. Returns the file URL and folder URL.
 *
 * SETUP (once):
 *   1. Create a Google Sheet in the contact@itzam.ai Drive
 *      (e.g. "Itzam — Free AI Assessment leads").
 *   2. Extensions → Apps Script. Paste this file. Save.
 *   3. GRANT DRIVE ACCESS (needed for save_report): in the editor, select the
 *      `authorizeDrive` function → Run ▶ → Allow the Drive permission. The
 *      Execution log should print "Drive authorized. Root folder: My Drive".
 *   4. (Optional) Script properties:
 *        WEBHOOK_SECRET   = a random string (also set GOOGLE_SHEETS_ASSESSMENT_SECRET in Vercel)
 *        REPORT_FOLDER_ID = pin a specific Drive folder (else it finds/creates by name)
 *   5. Deploy → New deployment → "Web app": Execute as **Me**, access **Anyone**.
 *      Copy the URL → Vercel GOOGLE_SHEETS_ASSESSMENT_WEBHOOK_URL.
 *   6. After ANY code change, redeploy the SAME deployment:
 *        Deploy → Manage deployments → Edit (✏️) → Version: New version → Deploy.
 *      (Keeps the URL. "New deployment" would mint a different URL.)
 */

function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var expectedSecret = props.getProperty('WEBHOOK_SECRET'); // may be null

    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut_({ ok: false, error: 'invalid_request' });
    }

    var body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (err) {
      return jsonOut_({ ok: false, error: 'invalid_json' });
    }

    // Apps Script Web Apps don't reliably expose custom headers, so the secret
    // is accepted via a top-level body field.
    if (expectedSecret) {
      var provided = body.secret || (e.parameter && e.parameter.secret);
      if (provided !== expectedSecret) {
        return jsonOut_({ ok: false, error: 'unauthorized' });
      }
    }

    if (body.action === 'save_report') {
      return saveReport_(props, body);
    }

    var headers = Array.isArray(body.headers) ? body.headers : [];
    var values = Array.isArray(body.values) ? body.values : [];
    if (!values.length) {
      return jsonOut_({ ok: false, error: 'no_values' });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Write the header row once, when the sheet is empty.
    if (sheet.getLastRow() === 0 && headers.length) {
      sheet.appendRow(headers.map(function (h) { return String(h).slice(0, 200); }));
      sheet.setFrozenRows(1);
    }

    sheet.appendRow(values.map(function (v) { return String(v == null ? '' : v).slice(0, 5000); }));

    return jsonOut_({ ok: true });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err).slice(0, 300) });
  }
}

/**
 * Run this ONCE from the editor (select it, click Run ▶) to grant the Drive
 * permission the save_report action needs. It creates and trashes a temp file
 * so Google grants the FULL Drive write scope (creating files needs
 * https://www.googleapis.com/auth/drive — a read-only grant is not enough).
 * On the consent screen, allow "See, edit, create, and delete all of your
 * Google Drive files". After approving, redeploy:
 *   Deploy → Manage deployments → Edit → New version.
 */
function authorizeDrive() {
  var f = DriveApp.createFile('itzam-drive-auth-check.txt', 'ok');
  f.setTrashed(true);
  Logger.log('Drive WRITE authorized. Temp file created and trashed: ' + f.getName());
}

function saveReport_(props, body) {
  var b64 = String(body.file_base64 || body.pdf_base64 || '');
  if (!b64) return jsonOut_({ ok: false, error: 'no_file' });
  var filename = sanitizeName_(body.filename || 'Assessment.pdf');
  var mime = String(body.mime || 'application/pdf');
  var company = sanitizeName_(body.company || 'Sin empresa');

  // Parent report folder: REPORT_FOLDER_ID if pinned, else the named folder.
  var parent;
  var folderId = props.getProperty('REPORT_FOLDER_ID');
  if (folderId) {
    parent = DriveApp.getFolderById(folderId);
  } else {
    var parentName = String(body.folder || 'Itzam — AI Free Assessment');
    var pit = DriveApp.getFoldersByName(parentName);
    parent = pit.hasNext() ? pit.next() : DriveApp.createFolder(parentName);
  }

  // One subfolder per company, created inside the parent.
  var sit = parent.getFoldersByName(company);
  var clientFolder = sit.hasNext() ? sit.next() : parent.createFolder(company);

  var blob = Utilities.newBlob(Utilities.base64Decode(b64), mime, filename);
  var file = clientFolder.createFile(blob);
  return jsonOut_({
    ok: true,
    file_url: file.getUrl(),
    file_id: file.getId(),
    folder_url: clientFolder.getUrl(),
  });
}

function sanitizeName_(name) {
  return String(name)
    .replace(/[\\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'Assessment.pdf';
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
