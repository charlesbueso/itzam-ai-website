# Free AI Assessment (self-serve lead magnet)

Public form at `itzam.ai/{es|en}/assessment`. Same shape as the contact form —
**no Supabase, no AI on our end.** The lead gets an instant deterministic score
on screen; the team generates and sends the full diagnostic from the Sheet.

```
form (14 questions + contact)
  → POST /api/assessment
        • deterministic score (pure math, lib/assessment/scoring.ts)
        • append a row to the Google Sheet          (hard dependency)
        • HubSpot contact + timeline note            (non-blocking)
        • confirmation email to lead + internal ping (non-blocking, Resend)
  → screen shows score + dimensions + "diagnostic on the way"
```

## What each credential powers

| Env var | Used for | Without it |
|---|---|---|
| `GOOGLE_SHEETS_ASSESSMENT_WEBHOOK_URL` | Appends each submission to the Sheet | Submission fails (502) — **required** |
| `GOOGLE_SHEETS_ASSESSMENT_SECRET` | Optional shared secret for the webhook | Webhook accepts unsigned posts |
| `HUBSPOT_ACCESS_TOKEN` | Contact upsert (MQL) + note with answers/score | Silently skipped |
| `RESEND_API_KEY` (+ `RESEND_FROM`, `INTERNAL_NOTIFY_EMAIL`) | Lead confirmation + internal ping | Silently skipped |

Reuses the existing HubSpot + Resend config. **No Supabase, no Anthropic key.**

## Deploy checklist (deploy today)

1. **Google Sheet** — in the contact@itzam.ai Drive, create a new spreadsheet
   ("Itzam — Free AI Assessment leads"). Extensions → Apps Script → paste
   `apps-script/assessment-webhook.gs` → Save.
2. (Optional) Apps Script → Project Settings → Script properties →
   `WEBHOOK_SECRET = <random string>`.
3. Apps Script → Deploy → New deployment → **Web app**: execute as *Me*,
   access *Anyone*. Copy the Web app URL.
4. **Vercel** (dev/preview + prod env):
   - `GOOGLE_SHEETS_ASSESSMENT_WEBHOOK_URL` = the Web app URL
   - `GOOGLE_SHEETS_ASSESSMENT_SECRET` = same value as step 2 (or leave blank)
5. Deploy. That's it — **no database migration needed.** Vercel deploys the
   app; the Sheet is the store of record.
6. (Optional, recommended) In HubSpot create two contact properties so the
   score is filterable — otherwise the values only show in the note:
   - `itzam_assessment_score` — number
   - `itzam_assessment_band` — single-line text

## Notes

- The Sheet gets one row per submission. Headers are Spanish (team-facing); the
  header row is written automatically on the first submission and frozen. Answer
  cells render in the respondent's language.
- If you later add/remove a question in `lib/assessment/questions.ts`, the
  column order shifts — start a fresh sheet tab or note the change so old rows
  aren't misread.
- Abuse protection is the hidden honeypot field (same as the contact form).
- Bringing the AI-generated report back later is easy: the deterministic score,
  scoring dimensions, and answer payload are all already computed server-side.
