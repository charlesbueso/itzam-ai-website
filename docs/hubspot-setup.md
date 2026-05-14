# HubSpot integration

Itzam.ai syncs to HubSpot in two layers:

1. **Browser tracking** (`_hsq`) — anonymous page views + identify-on-login,
   loaded site-wide from [components/HubSpot.tsx](../components/HubSpot.tsx).
2. **Server-side CRM sync** — Contact and Deal records pushed via the
   HubSpot CRM v3 API from [lib/hubspot/client.ts](../lib/hubspot/client.ts).

Both layers are **safe no-ops** when env vars are missing. Form submissions
and signups never fail because of HubSpot.

---

## 1. Get credentials

### Private App access token (server)

> **HubSpot UI note (as of 2026):** Use **Service Keys** — HubSpot's new
> recommended path for single-account API access. No CLI or app management
> overhead. The token format (`pat-na1-…`) and all API endpoints are
> **identical** to legacy private apps, so no code changes are needed.
> (Service Keys are currently in public beta.)

1. In HubSpot, go to **Development** (left sidebar) → **Keys → Service keys**.
2. Click **Create service key** (top right).
3. Name it `Itzam.ai backend`.
4. Click **Add new scope** and enable:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`
5. Click **Update**, then **Create** → confirm.
6. On the key detail page, click **Show** → **Copy**.
7. Add to env:
   ```
   HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

> **Rotate every 6 months**: on the key detail page → **Rotate → Rotate and
> expire later** (7-day grace period). Update `HUBSPOT_ACCESS_TOKEN` in
> Vercel before the old key expires.

### Portal ID (browser tracker)

1. Top-right of HubSpot → click your avatar → **Account Defaults** (or look
   in the URL: `app.hubspot.com/contacts/<PORTAL_ID>/...`).
2. Add to env:
   ```
   NEXT_PUBLIC_HUBSPOT_PORTAL_ID=12345678
   ```

Deploy both to Vercel (Project → Settings → Environment Variables).

---

## 2. Create custom contact + deal properties

The integration writes a few custom properties so you can segment cleanly.
Create these in HubSpot before going live (Settings → Properties).

**Contact properties** (object type: Contact)

| Internal name              | Label                     | Type           | Notes                                |
| -------------------------- | ------------------------- | -------------- | ------------------------------------ |
| `itzam_source`             | Itzam source              | Single-line    | `contact_form`, `waitlist`, etc.     |
| `itzam_use_case`           | Itzam use case            | Multi-line     | Free text from the contact form      |
| `itzam_invite_id`          | Itzam invite id           | Single-line    | UUID of the originating invite       |
| `itzam_signup_confirmed`   | Itzam signup confirmed    | Single checkbox| Flips to true after email confirm    |
| `itzam_preferred_locale`   | Itzam preferred locale    | Single-line    | `es` / `en`                          |
| `itzam_questionnaire_id`   | Itzam questionnaire id    | Single-line    | UUID                                 |

**Deal properties** (object type: Deal)

| Internal name              | Label                     | Type           |
| -------------------------- | ------------------------- | -------------- |
| `itzam_source`             | Itzam source              | Single-line    |
| `itzam_questionnaire_id`   | Itzam questionnaire id    | Single-line    |

> The integration never crashes if a custom property is missing — HubSpot
> just rejects that one field with a 400, which our client logs as a warning.

---

## 3. What gets synced where

| Trigger                                  | HubSpot action                                                    | Source tag       |
| ---------------------------------------- | ----------------------------------------------------------------- | ---------------- |
| `POST /api/contact` (contact form)       | Upsert Contact + `lifecyclestage=lead`                            | `contact_form`   |
| `POST /api/waitlist` (alias of contact)  | Same as above                                                     | `waitlist`       |
| `POST /api/auth/signup`                  | Upsert Contact + `itzam_signup_confirmed=false`                   | `app_signup`     |
| Questionnaire submit (outbox job)        | Upsert Contact (`marketingqualifiedlead`) + create Deal           | `questionnaire`  |

The questionnaire sync runs through the existing `submission_jobs` outbox,
so it retries with exponential backoff if HubSpot is briefly unreachable.

### Apply the migration

After deploying, run the new migration in Supabase:

```
supabase/migrations/0006_hubspot_job_kind.sql
```

It extends the `job_kind` enum to include `'hubspot'`.

---

## 4. Identifying logged-in users in the browser tracker

Anywhere on the client, after you know the user's email:

```tsx
"use client";
import { useEffect } from "react";
import { hsTrack } from "@/components/HubSpot";

export function IdentifyOnMount({ email, name }: { email: string; name?: string }) {
  useEffect(() => {
    hsTrack.identify({ email, name });
    hsTrack.trackPageView();
  }, [email, name]);
  return null;
}
```

Drop `<IdentifyOnMount email={user.email} />` into the authed app layout.

---

## 5. Local testing

1. Set `HUBSPOT_ACCESS_TOKEN` in `.env.local`.
2. Submit the contact form on `http://localhost:3000`.
3. In HubSpot → Contacts, you should see the new contact within a second.
4. Check terminal logs for any `[hubspot] ...` warnings.

To temporarily disable everything (e.g. on staging), leave both env vars
empty — the integration silently skips.

---

## 6. Production deployment checklist

### Vercel

| Env var | Where to get it | Scope |
| ------- | --------------- | ----- |
| `HUBSPOT_ACCESS_TOKEN` | Development → Keys → Service keys → Copy | Server only (never expose to browser) |
| `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` | HubSpot URL or Account Defaults | All environments |

> Set both on **Production** environment in Vercel (Project → Settings →
> Environment Variables). Redeploy after saving.

### Supabase migration

Apply before going live or the questionnaire-to-HubSpot job will fail silently:

```sql
-- supabase/migrations/0006_hubspot_job_kind.sql
alter type job_kind add value if not exists 'hubspot';
```

Run it via **Supabase Dashboard → SQL Editor**, or with the CLI:

```bash
supabase db push
```

### Smoke test in production

1. Submit the contact form at `https://itzam.ai/contact` with a new email.
2. Watch Vercel → Project → Functions → `api/contact` logs for:
   ```
   [hubspot] contact created id=... for your@email.com
   [hubspot] note attached id=... to contact ...
   ```
3. Open HubSpot → Contacts — the contact should appear within seconds.
4. Click it → **Activity** tab → confirm the Note is there with your message.

---

## 7. Connect your domain in HubSpot (important for analytics accuracy)

Without domain connection, HubSpot's tracking script still works, but traffic
attribution will be generic ("Direct / None") and page-view reports won't
group by URL path cleanly.

### Add itzam.ai as a connected domain

1. In HubSpot, go to **Settings** (gear icon, top right) → **Website** →
   **Domains & URLs**.
2. Click **Connect a domain** → choose **External / Other** (since your site
   is on Vercel, not HubSpot CMS).
3. Enter `itzam.ai` (and optionally `www.itzam.ai`).
4. HubSpot will give you a **CNAME verification record** — add it to your
   DNS (Vercel DNS or wherever your nameservers are).
5. Once verified, click **Confirm** in HubSpot. Status turns green.

> You do **not** need to host your site on HubSpot CMS. Domain connection is
> only for tracking attribution and analytics reporting.

### Allow-list your domain for the tracking script

1. Settings → **Privacy & Consent** → **Cookie Policy**.
2. Under **Domains**, add `itzam.ai` and `www.itzam.ai`.
3. This ensures the cookie banner (if you add one) only shows on your domain,
   and tracking is scoped correctly.

---

## 8. HubSpot analytics — where to find everything

### Traffic analytics (page views, sessions, sources)

**Reports → Traffic Analytics**

- **Overview** tab: sessions, page views, bounce rate, new vs returning
  visitors — all sourced from the `_hsq` tracking script on your site.
- **Sources** tab: breaks traffic into Organic Search, Direct, Social,
  Email, Referral. This is where you see if SEO / campaigns are working.
- **Pages** tab: lists every URL that got traffic, with sessions and
  bounce rate per page. Great for spotting which service pages convert.
- **UTM Campaigns** tab: if you add `?utm_source=...&utm_campaign=...`
  to any links, they appear here. Use UTMs on any paid ads or newsletter links.

> Traffic analytics data populates **after** your domain is connected and
> the tracking script (`NEXT_PUBLIC_HUBSPOT_PORTAL_ID`) is set in production.
> Expect a 24 h lag for the first data.

### Contact activity timeline (per-contact audit trail)

**Contacts** → click any contact → **Activity** tab (center column)

- Each contact form or waitlist submission creates a **Note** that appears
  here immediately (our server-side sync).
- Page views by identified users also show here once the browser tracker
  calls `hsq.push(["identify", { email }])`.
- You can filter the timeline by type: Notes, Page Views, Emails, etc.

### Deal pipeline

**CRM → Deals** → use the default **Sales Pipeline** view.

- Every completed questionnaire creates a Deal named
  `«Company» — AI Opportunity Assessment` in the first stage.
- Drag cards across stages as you work them. Set close date and amount
  to unlock revenue forecasting in **Reports → Sales**.

### Contact list / segmentation

**CRM → Contacts** → **Filter** (top right)

Useful saved filters to create:
- `itzam_source = contact_form` — everyone from the website contact form
- `itzam_source = waitlist` — waitlist subscribers
- `lifecyclestage = marketingqualifiedlead` — completed questionnaire
- `createdate > [last month]` — new contacts this month

Save each as a **List** (Actions → Save as List) to reuse in workflows or
email blasts later.

### Email & campaign analytics (future)

If you send emails through HubSpot (Marketing Hub), open rates, clicks, and
unsubscribes live under **Marketing → Email**. The integration currently uses
**Resend** for transactional email, so those stats stay in the Resend dashboard.

---

## 9. Future enhancements (not yet implemented)

- **Email/timeline events**: log questionnaire-completed as a custom
  timeline event on the contact (requires Marketing Hub Pro+).
- **Workflow trigger**: when a deal is created with `itzam_source=questionnaire`,
  trigger a HubSpot workflow that emails the CEO and assigns an owner.
- **Webhook back**: receive HubSpot lifecycle changes (e.g. deal won) and
  reflect them in our admin dashboard.
