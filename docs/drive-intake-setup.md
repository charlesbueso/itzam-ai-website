# Drive intake webhook (Apps Script v2)

Receives requests from `app.itzam.ai` to manage client Drive structure.
Two actions:

- `ensure_client_folder` — called when a magic link is issued. Creates
  `Clientes/<client_name>/` if missing. Idempotent.
- `create_assessment` — called when a questionnaire is submitted. Creates
  the per-assessment tree:

  ```
  Clientes/
    <client_name>/
      Assessment (dd/mm/yyyy)/
        01 - Intake y Discovery/
          Respuestas Intake Form - <client_name>   (Google Sheet)
        02 - Analisis Interno/
        03 - Assessment Report/
        04 - Propuesta e Implementacion/
  ```

Separate from the existing waitlist Apps Script. Do **not** reuse that
deployment — different secret, different shape.

---

## 1. Create the script

1. Visit <https://script.google.com> and create a new project named
   `itzam-intake-webhook`.
2. Replace `Code.gs` with the contents of [`apps-script/intake-webhook.gs`](../apps-script/intake-webhook.gs).
3. **Project settings → Script properties** → add:
   - `WEBHOOK_SECRET` — the shared secret. Copy the same value into Vercel as
     `DRIVE_WEBHOOK_SECRET`.
   - `ROOT_FOLDER_ID` — the ID of your `Clientes` folder in Drive. Open
     `My Drive/Clientes` in a browser; the ID is the last path segment of
     the URL. **The script writes everything as children of this folder.**

## 2. Deploy

1. **Deploy → New deployment → Web app**.
2. Settings:
   - **Execute as**: Me
   - **Who has access**: Anyone with the link
3. Click **Deploy**, copy the `https://script.google.com/macros/s/.../exec`
   URL, and store it in Vercel as `DRIVE_WEBHOOK_URL`.

## 3. Verify

```powershell
curl -X POST $env:DRIVE_WEBHOOK_URL `
  -H "Content-Type: application/json" `
  -d (@{ action='ensure_client_folder'; secret=$env:DRIVE_WEBHOOK_SECRET; client_name='TestCliente' } | ConvertTo-Json -Compress)
```

Response should be `{"ok":true,"client_folder_url":"...","client_folder_id":"..."}`.
A second call must return the **same** folder URL (idempotency).

A request with a wrong secret must return `{"ok":false,"error":"unauthorized"}`.

## 4. Rotation

To rotate the secret:
1. Update `WEBHOOK_SECRET` in Apps Script project properties.
2. Update `DRIVE_WEBHOOK_SECRET` in Vercel.
3. Redeploy the Apps Script (Deploy → Manage deployments → Edit → New version).
4. Redeploy the Vercel project (env change auto-triggers).

Secrets are accepted in lockstep, so do steps 1 and 2 quickly. The outbox will
retry any submissions that fail during the swap window.
