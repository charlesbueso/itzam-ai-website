/**
 * Itzam.ai — Contact form webhook (Google Sheets)
 *
 * Receives POST /api/contact rows (env GOOGLE_SHEETS_WEBHOOK_URL). Columns are
 * matched BY HEADER NAME, so the site can add fields (e.g. lead attribution)
 * without breaking the sheet: unknown headers are appended as new columns,
 * existing columns keep their position, and you can reorder or hide columns
 * freely in the sheet.
 *
 * Body (sent by the site):
 *   { headers: [...], values: [...],            ← preferred
 *     submitted_at, name, email, company, role, use_case, ip, user_agent }  ← legacy fallback
 *
 * SETUP / UPGRADE (replaces the snippet in docs/google-sheets-setup.md):
 *   1. Open the contact-leads Google Sheet → Extensions → Apps Script.
 *   2. Replace Code.gs with this file. Save.
 *   3. (Optional) Script properties:
 *        SHEET_NAME     = tab to write to (default: "Hoja 1", else the first tab)
 *        WEBHOOK_SECRET = shared secret; send it as ?key=… on the webhook URL
 *   4. Deploy → Manage deployments → Edit (✏️) → Version: New version → Deploy.
 *      Editing the EXISTING deployment keeps the URL already in Vercel.
 *      ("New deployment" would mint a different URL.)
 *
 * The first data row after the upgrade adds the new header cells to row 1.
 */

// The original script wrote these 8 fields, in this order, to "Hoja 1".
var LEGACY_FIELDS = ['submitted_at', 'name', 'email', 'company', 'role', 'use_case', 'ip', 'user_agent'];
var DEFAULT_SHEET_NAME = 'Hoja 1';

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut_({ ok: false, error: 'invalid_request' });
    }
    var body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (err) {
      return jsonOut_({ ok: false, error: 'invalid_json' });
    }

    var props = PropertiesService.getScriptProperties();
    var expectedSecret = props.getProperty('WEBHOOK_SECRET');
    if (expectedSecret) {
      var provided = (e.parameter && (e.parameter.key || e.parameter.secret)) || body.secret;
      if (provided !== expectedSecret) return jsonOut_({ ok: false, error: 'unauthorized' });
    }

    var headers, values;
    if (Array.isArray(body.headers) && Array.isArray(body.values) && body.headers.length === body.values.length) {
      headers = body.headers.map(function (h) { return String(h).slice(0, 200); });
      values = body.values;
    } else {
      headers = LEGACY_FIELDS;
      values = LEGACY_FIELDS.map(function (k) {
        return k === 'submitted_at' ? (body[k] || new Date().toISOString()) : body[k];
      });
    }

    var sheetName = props.getProperty('SHEET_NAME') || DEFAULT_SHEET_NAME;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName) || ss.getSheets()[0];

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      appendByHeader_(sheet, headers, values);
    } finally {
      lock.releaseLock();
    }
    return jsonOut_({ ok: true });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err).slice(0, 300) });
  }
}

function appendByHeader_(sheet, headers, values) {
  var existing = [];
  if (sheet.getLastRow() > 0 && sheet.getLastColumn() > 0) {
    existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
    // Ignore trailing empty header cells.
    while (existing.length && existing[existing.length - 1] === '') existing.pop();
  }

  var row = [];
  for (var c = 0; c < existing.length; c++) row.push('');

  for (var i = 0; i < headers.length; i++) {
    var idx = existing.indexOf(headers[i]);
    // The original fields keep their original column even if row 1 labels
    // them differently (e.g. Spanish headers typed by hand).
    var legacyPos = LEGACY_FIELDS.indexOf(headers[i]);
    if (idx === -1 && legacyPos !== -1 && legacyPos < existing.length) idx = legacyPos;
    if (idx === -1) {
      existing.push(headers[i]);
      idx = existing.length - 1;
      sheet.getRange(1, idx + 1).setValue(headers[i]);
      row.push('');
    }
    row[idx] = cell_(values[i]);
  }

  if (sheet.getFrozenRows() === 0) sheet.setFrozenRows(1);
  sheet.appendRow(row);
}

/**
 * Form input is untrusted: a value starting with = + - @ would be evaluated
 * as a formula by appendRow (e.g. =IMPORTXML(...) exfiltrating the sheet).
 * A leading apostrophe forces plain text and is not shown in the cell.
 */
function cell_(v) {
  var s = String(v == null ? '' : v).slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
