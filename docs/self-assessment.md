# Free AI Assessment (self-serve lead magnet)

Public form at `itzam.ai/{es|en}/assessment`. Instant deterministic score on
screen; a personalized 6-page PDF report is generated (gated) and dropped in
Drive for the team to review and send.

```
form (14 questions + contact)
  → POST /api/assessment  (fast path, returns instantly)
        • deterministic score (pure math, lib/assessment/scoring.ts)
        • append row to Google Sheet                 (hard dependency)
        • return score + dimensions → on-screen result
     …then in the background (waitUntil):
        • HubSpot contact + timeline note
        • confirmation email to the lead
        • GATED report pipeline (lib/assessment/pipeline.ts):
            company email? → rate limit → Haiku legit-check
              → Sonnet 5 report prose → render PDF (lib/assessment/pdf.tsx)
              → upload to Drive "Itzam — AI Free Assessment"
              → email the TEAM the Drive link + PDF for review
```

The lead report is **not** auto-sent — the team reviews the Drive PDF and
forwards it. Flip that by having the pipeline also email the PDF to
`input.contact.email`.

## Protecting the API key (gates, in order)

1. **Honeypot** — hidden field, kills dumb bots.
2. **Company email only** — free providers (gmail/hotmail/yahoo/outlook/icloud/
   proton…) never trigger a paid call. `lib/assessment/emailDomains.ts`.
3. **Rate limit** — 1 report per email / 7 days, 5 per IP / day (reuses the
   existing Supabase `rate_limit_hit`; skipped automatically if Supabase env is
   absent — fail-open, since the strong gates are above).
4. **Haiku legitimacy check** — `claude-haiku-4-5` decides if the answers look
   real or invented; invented/spam is flagged and never reaches the report
   model.

A submission that fails any gate is still saved to the Sheet, and the team gets
a notification explaining why no report was generated. No silent drops.

## Models (env-overridable)

| Job | Default | Override |
|---|---|---|
| Legitimacy check | `claude-haiku-4-5` | `ASSESSMENT_LEGIT_MODEL` |
| Report prose | `claude-sonnet-5` | `ASSESSMENT_REPORT_MODEL` |

The **PDF layout is code** (`lib/assessment/pdf.tsx`), not a prompt — Claude
only returns ~a dozen short strings, and the stable system prompt is
prompt-cached. Cost ≈ **$0.001 legit-check + ~$0.03 report** per qualifying
lead. (Fable 5 was deliberately avoided: 2× the cost, refusal classifiers,
30-day-retention requirement — wrong fit for a templated marketing report.)

## What each credential powers

| Env var | Used for | Without it |
|---|---|---|
| `GOOGLE_SHEETS_ASSESSMENT_WEBHOOK_URL` | Sheet row **and** Drive PDF upload | Submission fails (502) — **required** |
| `GOOGLE_SHEETS_ASSESSMENT_SECRET` | Optional webhook shared secret | Webhook accepts unsigned posts |
| `ANTHROPIC_API_KEY` | Report generation | Score + Sheet still work; team notified to do it manually |
| `HUBSPOT_ACCESS_TOKEN` | Contact upsert (MQL) + note | Silently skipped |
| `RESEND_API_KEY` (+ `RESEND_FROM`, `INTERNAL_NOTIFY_EMAIL`) | Lead confirmation + team report email | Silently skipped |

## Deploy checklist

1. **Apps Script** — in the contact@itzam.ai Drive, on the leads spreadsheet:
   Extensions → Apps Script → paste `apps-script/assessment-webhook.gs`. It
   handles **both** the Sheet row and the `save_report` Drive upload.
   - **Grant Drive access (one-time):** select the `authorizeDrive` function →
     Run ▶ → Allow. Apps Script auth is **per-project**, so even if another
     script already uses Drive, this project needs its own grant. Verify the
     Execution log prints *"Drive authorized."*
   - Redeploy after any code change via **Manage deployments → Edit → New
     version** (keeps the URL — "New deployment" mints a different one).
   - Optional: Script property `REPORT_FOLDER_ID` to pin a specific Drive
     folder; otherwise it finds/creates **"Itzam — AI Free Assessment"**.
   - Optional: Script property `WEBHOOK_SECRET` (match `GOOGLE_SHEETS_ASSESSMENT_SECRET`).
2. **Vercel env** (Preview + Production):
   - `GOOGLE_SHEETS_ASSESSMENT_WEBHOOK_URL` (required)
   - `ANTHROPIC_API_KEY` (for reports)
   - optional: `GOOGLE_SHEETS_ASSESSMENT_SECRET`, model overrides
3. Local testing: same vars in `.env.local`, restart `npm run dev`.
   - Dev-only PDF preview: `GET /api/assessment/preview` (`?locale=en`) renders
     the template with sample content — no tokens spent. Returns 404 in prod.
4. (Optional) HubSpot contact properties for filtering: `itzam_assessment_score`
   (number), `itzam_assessment_band` (single-line text).

## QR code

`public/assessment-qr.{png,svg}` encodes `https://itzam.ai/en/assessment`,
served at `https://itzam.ai/assessment-qr.png` once deployed. Regenerate with
the `qrcode` npm package if the target URL changes.

## Notes

- Report/PDF template matches `Itzam_MiniAssessment_Reporte_EJEMPLO.pdf`; only
  the prose is AI-generated. Static parts (page 5 comparison table, CTA, prices)
  live in `pdf.tsx`.
- If you change questions in `lib/assessment/questions.ts`, the Sheet column
  order shifts — start a fresh sheet/tab.
