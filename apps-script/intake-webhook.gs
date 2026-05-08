/**
 * Itzam.ai — Intake webhook (Apps Script v2)
 *
 * Two actions, dispatched by the `action` field on the JSON body.
 *
 *   action: "ensure_client_folder"
 *     Creates (or finds) ROOT/<client_name>. Idempotent.
 *     Body: { action, secret?, client_name }
 *     Returns: { ok, client_folder_url, client_folder_id }
 *
 *   action: "create_assessment"
 *     Inside ROOT/<client_name>, creates:
 *       Assessment (dd/mm/yyyy)/
 *         01 - Intake y Discovery/
 *           Respuestas Intake Form - <client_name>   (Google Sheet, populated)
 *         02 - Analisis Interno/
 *         03 - Assessment Report/
 *         04 - Propuesta e Implementacion/
 *     Body: { action, secret?, client_name, client_contact?, client_email,
 *             locale, submitted_at, rows: [{position, question, answer}, ...] }
 *     Returns: { ok, assessment_folder_url, sheet_url }
 *
 * Required script properties (Project settings → Script properties):
 *   WEBHOOK_SECRET   — shared secret; matches Vercel DRIVE_WEBHOOK_SECRET
 *   ROOT_FOLDER_ID   — Drive folder ID of the "Clientes" folder
 */

function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var expectedSecret = props.getProperty('WEBHOOK_SECRET');
    var rootFolderId = props.getProperty('ROOT_FOLDER_ID');
    if (!expectedSecret || !rootFolderId) {
      return jsonOut_({ ok: false, error: 'not_configured' });
    }

    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut_({ ok: false, error: 'invalid_request' });
    }

    var body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (err) {
      return jsonOut_({ ok: false, error: 'invalid_json' });
    }

    // Apps Script Web Apps don't always expose custom headers via e.parameter,
    // so we accept the secret via header (preferred) OR a top-level body field.
    var headerSecret = (e.parameter && e.parameter['X-Itzam-Secret']) || null;
    var providedSecret = body.secret || headerSecret;
    if (providedSecret !== expectedSecret) {
      return jsonOut_({ ok: false, error: 'unauthorized' });
    }

    var rootFolder = DriveApp.getFolderById(rootFolderId);
    var clientName = sanitizeName_(body.client_name || 'Cliente');

    if (body.action === 'ensure_client_folder') {
      var clientFolder = ensureChildFolder_(rootFolder, clientName);
      return jsonOut_({
        ok: true,
        client_folder_url: clientFolder.getUrl(),
        client_folder_id: clientFolder.getId(),
      });
    }

    if (body.action === 'create_assessment') {
      var rows = Array.isArray(body.rows) ? body.rows : [];
      if (rows.length > 200) {
        return jsonOut_({ ok: false, error: 'too_many_rows' });
      }

      var clientRoot = ensureChildFolder_(rootFolder, clientName);
      var assessmentName = 'Assessment (' + formatDateDMY_(new Date()) + ')';
      // If a same-day assessment folder exists, append a counter so we never
      // overwrite an existing assessment.
      var assessmentFolder = createUniqueChildFolder_(clientRoot, assessmentName);

      var f01 = assessmentFolder.createFolder('01 - Intake y Discovery');
      assessmentFolder.createFolder('02 - Analisis Interno');
      assessmentFolder.createFolder('03 - Assessment Report');
      assessmentFolder.createFolder('04 - Propuesta e Implementacion');

      var sheetName = 'Respuestas Intake Form - ' + clientName;
      var sheet = SpreadsheetApp.create(sheetName);
      var sheetFile = DriveApp.getFileById(sheet.getId());
      f01.addFile(sheetFile);
      DriveApp.getRootFolder().removeFile(sheetFile);

      var clientEmail = String(body.client_email || '').slice(0, 320);
      var clientContact = String(body.client_contact || '').slice(0, 200);
      var locale = String(body.locale || 'es');
      var submittedAt = String(body.submitted_at || '');

      var intakeTab = sheet.getActiveSheet();
      intakeTab.setName('Intake');
      intakeTab.appendRow(['Empresa', clientName]);
      if (clientContact) {
        intakeTab.appendRow(['Contacto', clientContact]);
      }
      intakeTab.appendRow(['Email', clientEmail]);
      intakeTab.appendRow(['Idioma', locale]);
      intakeTab.appendRow(['Enviado', submittedAt]);
      // Spacer row — appendRow() rejects empty arrays, so use a single empty string.
      intakeTab.appendRow(['']);
      intakeTab.appendRow(['#', 'Pregunta', 'Respuesta']);
      rows.forEach(function (r) {
        var position = Number(r.position) || 0;
        var question = String(r.question || '').slice(0, 1000);
        var answer = String(r.answer || '').slice(0, 5000);
        // appendRow rejects rows where every cell is empty.
        if (!question && !answer) return;
        intakeTab.appendRow([position, question, answer]);
      });

      sheet.insertSheet('Notas');

      return jsonOut_({
        ok: true,
        assessment_folder_url: assessmentFolder.getUrl(),
        sheet_url: sheet.getUrl(),
      });
    }

    return jsonOut_({ ok: false, error: 'unknown_action' });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err).slice(0, 300) });
  }
}

function ensureChildFolder_(parent, name) {
  var iter = parent.getFoldersByName(name);
  if (iter.hasNext()) return iter.next();
  return parent.createFolder(name);
}

function createUniqueChildFolder_(parent, name) {
  var candidate = name;
  var n = 2;
  while (parent.getFoldersByName(candidate).hasNext()) {
    candidate = name + ' #' + n;
    n += 1;
    if (n > 50) break; // sanity
  }
  return parent.createFolder(candidate);
}

function formatDateDMY_(d) {
  var dd = String(d.getDate()).padStart(2, '0');
  var mm = String(d.getMonth() + 1).padStart(2, '0');
  var yyyy = String(d.getFullYear());
  return dd + '/' + mm + '/' + yyyy;
}

function sanitizeName_(name) {
  return String(name)
    .replace(/[\\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'Cliente';
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
