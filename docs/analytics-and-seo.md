# Analytics, lead attribution & SEO

How itzam.ai measures traffic and leads, where every lead lands, and the SEO
setup. Written after the Q3-2026 audit, which found that GA4 recorded **zero
leads** (form submissions weren't tracked), roughly a third of the recorded
visits were our own team, test sites or the client app, and the Services
pages weren't indexed.

---

## 1. Lead flow — what happens on submit

```
Browser                                   Server (/api/contact, /api/assessment)
───────                                   ──────────────────────────────────────
Analytics.tsx records first/last touch    validate · honeypot · per-IP rate limit (fails open)
  (UTM, click ids, referrer, landing)       │
form submit ── { …fields, locale, page,   ├─ Google Sheet row   (hard dependency → 502 if it fails)
                 attribution } ─────────▶ │     + attribution columns
on success:                               ├─ Resend: team notification  (+ "Origen del lead" block)
  gtag generate_lead { lead_type, … }     ├─ Resend: confirmation to the lead
  HubSpot identify (links visitor         ├─ HubSpot: upsert contact (+ attribution properties)
  history to the contact)                 │           + timeline note (answers + origin)
                                          └─ assessment only: gated AI report pipeline → Drive → team email
```

| Form | Sheet (Apps Script) | HubSpot lifecycle | `itzam_source` |
|---|---|---|---|
| Contact (home + /contact) | `apps-script/contact-webhook.gs` → `GOOGLE_SHEETS_WEBHOOK_URL` | `lead` | `contact_form` |
| Free AI Assessment | `apps-script/assessment-webhook.gs` → `GOOGLE_SHEETS_ASSESSMENT_WEBHOOK_URL` | `marketingqualifiedlead` | `self_assessment` |

**Attribution** (`lib/analytics/attribution.ts` → `lib/leads/attribution.ts`):

- *First touch*: how the person first found us (kept for 90 days in localStorage).
- *Last touch*: the most recent visit that came from a campaign or an external site.
- *Form page*: where they submitted (`/es/assessment`, `/en`, …).

It lands in:

- **Sheet columns** "Página del formulario", "Origen / medio (1er contacto)", …
- **HubSpot properties** `itzam_first_source`, `itzam_first_campaign`, `itzam_first_landing_page`, `itzam_first_referrer`, `itzam_last_source`, `itzam_last_campaign`, `itzam_lead_page`.
- The **team email** and the **HubSpot note**.

**HubSpot resilience:** HubSpot rejects the *whole* write if any property is
invalid. That includes a property that was never created, or a lifecycle stage
moving backwards. `lib/hubspot/client.ts` now drops the rejected properties
and retries, so the contact is never lost. This silently broke *every*
assessment sync until Sep 2026, because `itzam_assessment_score` and
`itzam_assessment_band` didn't exist. Create missing properties with
`node scripts/hubspot-setup.mjs --apply`.

---

## 2. GA4

Property **Itzam AI** (`properties/536870606`), stream `G-JVXTVD9NXY`.

**Where it loads:** only on `itzam.ai` / `www.itzam.ai` (`lib/analytics/gtag.ts`).
It does not load on Vercel previews, localhost or `app.itzam.ai`. To test tags on
a preview, set `NEXT_PUBLIC_GA_FORCE=1`. Off-host, `track()` logs
`[ga] …` to the console in dev, so events can be checked locally.

**Internal traffic:** a browser is tagged `traffic_type=internal` when:

- an admin logs into app.itzam.ai (a cookie is set on `.itzam.ai`), or
- anyone opens any page with `?internal=1`. `?internal=0` clears the tag.

**Everyone on the team should open `https://itzam.ai/?internal=1` once on every
browser and phone they use.** The tag does nothing until the GA4 data filter is
**Active** (see setup below).

### Events

| Event | When | Params | Key event |
|---|---|---|---|
| `generate_lead` | Contact form or assessment submitted successfully | `lead_type` (contact / assessment), `form_location`, `assessment_score`, `assessment_band` | **Yes** |
| `assessment_start` | First answer or contact field touched | `form_location` | |
| `assessment_error` | Validation / rate limit / server error on submit | `reason` | |
| `cta_click` | Click on any link to the assessment or contact page (from another page) | `cta_target`, `link_text`, `form_location` | |
| `contact_email_click` | Click on a `mailto:` link | `form_location` | |
| `language_switch` | EN/ES toggle | `from_language`, `to_language` | |

GA4 enhanced measurement already covers `page_view`, `scroll`, outbound
clicks and `form_start` / `form_submit`. `form_submit` fires even when the
form fails, so count leads with `generate_lead`, not `form_submit`.

**Debugging:** open any page with `?ga_debug=1` → GA4 Admin → DebugView.

---

## 3. UTM links — tag everything we share

Untagged links from WhatsApp, email and most apps arrive as "Direct", which
tells us nothing. Tag every link we post:

| Where | Example |
|---|---|
| LinkedIn post | `https://itzam.ai/es/assessment?utm_source=linkedin&utm_medium=social&utm_campaign=assessment-oct26` |
| Instagram bio | `https://itzam.ai/es?utm_source=instagram&utm_medium=social&utm_campaign=bio` |
| Email signature | `https://itzam.ai/es?utm_source=email&utm_medium=signature&utm_campaign=team` |
| Sales email / proposal | `https://itzam.ai/es/assessment?utm_source=email&utm_medium=outbound&utm_campaign=<prospect-or-sequence>` |
| WhatsApp | `https://itzam.ai/es/assessment?utm_source=whatsapp&utm_medium=referral&utm_campaign=<context>` |
| Event / QR code | `https://itzam.ai/es/assessment?utm_source=<event>&utm_medium=qr&utm_campaign=<event>-2026` |

Rules: lowercase, hyphens instead of spaces, `utm_source` = the platform,
`utm_medium` = the kind of channel, `utm_campaign` = the initiative. The same
values then show up in GA4, the Sheet, HubSpot and the lead email.

---

## 4. SEO — what's in place

- **Titles:** `pageMetadata()` in `lib/seo.ts` builds each page's title, description, canonical, hreflang (en, en-US, es, es-MX, x-default → en), OG and Twitter tags. The `[locale]` layout carries the `%s | Itzam.ai` template. Before this, it replaced the template, so pages were titled just "Services" or "Servicios".
- **Share images:** branded 1200×630 cards from `app/[locale]/**/opengraph-image.tsx` (copy in `lib/og.tsx`). Before this, pages had no `og:image`.
- **`<html lang>`:** `es-MX` on Spanish pages (`components/HtmlLang.tsx` + `LocaleProvider`).
- **Redirects** (`middleware.ts`):
  - `/` and bare `/about`, `/services`, … redirect to `/es` or `/en` based on the browser's language (307 + `Vary`). Crawlers land on `/en` = x-default.
  - `/ai-opportunity-assessment` redirects (308) to `/…/assessment`.
- **Sitemap:** `app/sitemap.ts` uses real per-page `updated` dates. **Bump a page's date when its content changes.**
- **Structured data:**
  - Organization + ProfessionalService (with address and `sameAs`) in `app/layout.tsx`.
  - BreadcrumbList, AboutPage, ContactPage and a Service ItemList on their pages.
  - FAQPage on /services and /assessment, matching the visible FAQ sections (`components/Faq.tsx`, copy in the dictionaries).
- **Brand entity:** add every official profile (Instagram, YouTube, Google Business Profile, directories) to `SAME_AS` in `app/layout.tsx`. This, plus consistent links back to itzam.ai, is how "itzam" moves from page 2 to #1.
- **Fonts:** self-hosted via `next/font`, so there's no render-blocking Google Fonts request.

**Adding a page:**

1. Use `pageMetadata()` for its metadata.
2. Add an `opengraph-image.tsx` (and copy in `OG_COPY`).
3. Add it to `ROUTES` in `app/sitemap.ts`.
4. If it should work without a locale prefix, add it to `BARE_PAGES` in `middleware.ts`.

**Blog** (`/es/blog`, `/en/blog`)

Posts are typed data in `lib/blog/posts/*.ts`: one file per post, both languages, each language with its own slug. There's no MDX or CMS. To add a post:

1. Copy an existing post file and write both translations. Inline markup is limited to `**bold**` and `[links](/es/…)`. Blocks: `p`, `h2`, `ul`, `ol`, `facts`, `stats`, `table`, `cta`.
2. Register it in `POSTS` in `lib/blog/index.ts`.

These are automatic:

- sitemap entries with hreflang pairs
- `BlogPosting` + breadcrumb structured data
- share card
- reading time
- "Keep reading" links
- the EN|ES toggle redirect to the translated slug

Editorial rules (staying on Google's good side):

- Every post needs something only Itzam knows: a real (anonymized) project, the numbers, the decisions.
- A founder's byline (`author: "ceo" | "cto"`), human review.
- About 2 posts a month, never mass-produced pages.
- Client case studies are anonymous by default, with no names, domains or product names, and aggregate numbers only.

---

## 5. Google login (for the scripts)

The scripts use Application Default Credentials for `cbueso@itzam.ai`,
through the **Itzam Reports** OAuth client in GCP project `itzam-reports`.
gcloud's built-in client is blocked for Analytics scopes. One login covers
quarterly reports, `scripts/google_setup.py` and `scripts/apps_script_deploy.py`:

```powershell
gcloud auth application-default login --client-id-file="<path>\itzam-oauth-client.json" --scopes="https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/analytics.edit,https://www.googleapis.com/auth/webmasters,https://www.googleapis.com/auth/script.projects,https://www.googleapis.com/auth/script.deployments,https://www.googleapis.com/auth/cloud-platform"
gcloud auth application-default set-quota-project itzam-reports
```

The APIs enabled on `itzam-reports` are `analyticsadmin`, `analyticsdata`,
`searchconsole` and `script.googleapis.com`. Apps Script also needs the API
toggled on per account at <https://script.google.com/home/usersettings>.

---

## 6. One-time setup checklist

The code works in any order. The steps below turn on what code can't.

1. **HubSpot properties:** `node scripts/hubspot-setup.mjs --apply`. The service key needs `crm.schemas.contacts.write`.
2. **Apps Scripts:**
   - Run `python scripts/apps_script_deploy.py --contact <id> --assessment <id>`, check the diff, then run it again with `--apply`. This keeps the same URLs.
   - To do it by hand instead: paste each file into its sheet's script, then **Deploy → Manage deployments → Edit → New version**.
   - Until then, the old contact script keeps working (legacy fields are still sent), but without the new columns.
3. **GA4 + Search Console:**
   - Re-authenticate with edit scopes (command in `scripts/google_setup.py`).
   - Run `python scripts/google_setup.py`, check the plan, then run it with `--apply`.
   - It marks `generate_lead` as a key event, removes unused placeholder key events, creates the custom dimensions, sets retention to 14 months and resubmits the sitemap.
4. **GA4 UI** (no API):
   - Data filters → **Internal Traffic → Active**.
   - Unwanted referrals: `vercel.com`, `accounts.google.com`, `app.itzam.ai`.
5. **Search Console UI:** URL inspection → **Request indexing** for `/en/services`, `/es/services`, `/es`, `/es/about`.
6. **Team:** open `https://itzam.ai/?internal=1` on every device.

**Verify after deploy:**

1. Submit the contact form with `?ga_debug=1`.
2. Check that `generate_lead` shows in DebugView.
3. Check the Sheet row has the attribution columns.
4. Check the HubSpot contact has `itzam_first_source` and the note has "Origen del lead".
5. Check the team email shows the lead source.
