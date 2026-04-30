# Google Sheets — Apps Script setup

Connect the waitlist form to a Google Sheet via Google Apps Script.

## 1. Create the sheet

1. Create a new Google Sheet (e.g. **"Itzam.ai Waitlist"**).
2. In **Sheet1**, add this header row in **A1:H1**:

   ```
   submitted_at	name	email	company	role	use_case	ip	user_agent
   ```

## 2. Add the Apps Script

1. In the sheet: **Extensions → Apps Script**.
2. Replace `Code.gs` with the script below.
3. Click **Save**.

```javascript
const SHEET_NAME = "Sheet1";
// Optional: set this to a random string and include the same value as
// `?key=...` on the deployed URL to lightly authenticate requests.
const SHARED_SECRET = "";

function doPost(e) {
  try {
    if (SHARED_SECRET) {
      const key = (e && e.parameter && e.parameter.key) || "";
      if (key !== SHARED_SECRET) {
        return _json({ ok: false, error: "Unauthorized" }, 401);
      }
    }

    const body = JSON.parse(e.postData.contents || "{}");

    const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
    sheet.appendRow([
      body.submitted_at || new Date().toISOString(),
      body.name || "",
      body.email || "",
      body.company || "",
      body.role || "",
      body.use_case || "",
      body.ip || "",
      body.user_agent || "",
    ]);

    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) }, 500);
  }
}

function _json(obj, status) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
```

## 3. Deploy as Web App

1. **Deploy → New deployment**.
2. Type: **Web app**.
3. **Execute as**: *Me*.
4. **Who has access**: *Anyone*.
5. Click **Deploy**, copy the **Web app URL**.

## 4. Add to environment variables

Locally — create `.env.local` in the project root:

```
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfy.../exec
```

On **Vercel** — Project Settings → Environment Variables → add the same
variable for *Production*, *Preview*, and *Development* as needed.

## 5. Test

```powershell
curl -Method POST https://your-site/api/waitlist `
  -ContentType "application/json" `
  -Body '{"name":"Test","email":"t@t.com","company":"Test Co"}'
```

A new row should appear in the Sheet.
