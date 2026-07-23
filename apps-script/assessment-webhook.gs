/**
 * Itzam.ai — Free AI Assessment webhook (Google Sheets)
 *
 * Appends one row per public /assessment submission to a Google Sheet.
 * Mirrors the contact-form sheet pattern, in its own spreadsheet/tab so the
 * two lead sources stay separate.
 *
 * SETUP (once):
 *   1. Create a new Google Sheet in the contact@itzam.ai Drive
 *      (e.g. "Itzam — Free AI Assessment leads").
 *   2. Extensions → Apps Script. Paste this file. Save.
 *   3. (Optional but recommended) Project Settings → Script properties →
 *      add  WEBHOOK_SECRET = <a long random string>.
 *      If you set it here, set the SAME value in Vercel as
 *      GOOGLE_SHEETS_ASSESSMENT_SECRET. Leave both blank to skip the check.
 *   4. Deploy → New deployment → type "Web app":
 *        Execute as: Me (contact@itzam.ai)
 *        Who has access: Anyone
 *      Copy the Web app URL → set it in Vercel as
 *      GOOGLE_SHEETS_ASSESSMENT_WEBHOOK_URL.
 *
 * The site sends: { secret?, headers: [...], values: [...] }
 * Row 1 is written with `headers` the first time the sheet is empty; every
 * submission appends `values` in the same column order.
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

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
