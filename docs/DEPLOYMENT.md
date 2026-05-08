# Deploying Itzam.ai to Vercel

End-to-end guide. Assumes you've just run `git init` and have a GitHub account and a Vercel account ready.

---

## 1. Push the repo to GitHub

```powershell
# From b:\repos\itzam.ai
git add .
git commit -m "Initial commit: Itzam.ai landing"

# Create a new empty repo on GitHub (via the web UI or `gh` CLI)
# then add the remote and push:
git branch -M main
git remote add origin https://github.com/<your-user>/itzam.ai.git
git push -u origin main
```

> **Sanity check before pushing**: confirm `.gitignore` is doing its job —
> `git status` should NOT show `node_modules/`, `.next/`, `.venv/`,
> `.env.local`, or `.vercel/`.

---

## 2. Import the project into Vercel

1. Go to <https://vercel.com/new>.
2. Click **Import Git Repository** and authorize GitHub if prompted.
3. Pick the `itzam.ai` repo.
4. Vercel auto-detects Next.js. Leave the defaults:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `next build` (auto)
   - **Output Directory**: `.next` (auto)
   - **Install Command**: `npm install` (auto)
   - **Node.js Version**: 20.x

## 3. Add environment variables

Under **Environment Variables** before the first deploy, add:

| Name                          | Value                                                 | Environments                  |
| ----------------------------- | ----------------------------------------------------- | ----------------------------- |
| `GOOGLE_SHEETS_WEBHOOK_URL`   | `https://script.google.com/macros/s/AKfy.../exec`     | Production, Preview, Development |
| `APP_BASE_URL`                | `https://app.itzam.ai`                                | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL`    | `https://<project>.supabase.co`                       | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon key from Supabase API settings)               | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY`   | (service role key — **server-only**, never exposed)   | Production, Preview, Development |
| `ADMIN_EMAILS`                | `you@itzam.ai,co@itzam.ai` (bootstrap fallback)       | Production, Preview, Development |
| `RESEND_API_KEY`              | `re_...`                                              | Production, Preview, Development |
| `RESEND_FROM`                 | `Itzam.ai <hello@notifications.itzam.ai>`             | Production, Preview, Development |
| `INTERNAL_NOTIFY_EMAIL`       | `you@itzam.ai`                                        | Production, Preview, Development |
| `DRIVE_WEBHOOK_URL`           | (Apps Script v2 web app URL — see drive-intake-setup.md) | Production, Preview, Development |
| `DRIVE_WEBHOOK_SECRET`        | (random 32+ char string, also set in Apps Script)     | Production, Preview, Development |
| `CRON_SECRET`                 | (random 32+ char string for Vercel Cron auth)         | Production, Preview, Development |

You can also paste them in bulk (one `KEY=VALUE` per line). If you ever rotate the webhook, update it here and trigger a redeploy.

## 4. Deploy

Click **Deploy**. The first build takes ~1–2 minutes. When it finishes you'll get:

- A production URL like `itzam-ai.vercel.app`
- A preview URL on every push to a non-main branch / pull request

## 5. Hook up the custom domain `itzam.ai`

1. In your Vercel project: **Settings → Domains → Add**.
2. Enter `itzam.ai` and `www.itzam.ai`.
3. Vercel will show DNS records to add. At your domain registrar:
   - **Apex (`itzam.ai`)** → `A` record to `76.76.21.21`
   - **`www`** → `CNAME` to `cname.vercel-dns.com`
   - (Or use Vercel's Nameservers option for full DNS delegation — easier.)
4. Wait for DNS propagation (usually <10 minutes). Vercel will auto-issue an SSL certificate.
5. Set the production redirect: in **Domains**, mark `itzam.ai` as the primary and configure `www.itzam.ai` to redirect to it (or vice versa, your call).

## 6. Verify the deployment

After deploy, check:

- [ ] `https://itzam.ai/` redirects to `https://itzam.ai/en`
- [ ] `https://itzam.ai/es` renders the Spanish version
- [ ] Language switcher in the navbar swaps locales
- [ ] Hero video plays (DigitalOcean CDN must allow your origin — it does, the bucket is public)
- [ ] Submitting the contact form returns a success state and the row appears in the linked Google Sheet
- [ ] Open DevTools → Network → confirm `/api/waitlist` returns `200`
- [ ] `view-source:` shows the JSON-LD `<script>` and `<link rel="alternate" hreflang="...">` tags
- [ ] Lighthouse score is green (Performance, Accessibility, SEO)

## 7. Production workflow

- Pushing to `main` triggers a Production deployment.
- Pushing to any other branch (or opening a PR) triggers a Preview deployment with its own URL — share these for QA.
- Roll back instantly from **Deployments → … → Promote to Production** on any earlier successful build.

## 8. Useful Vercel CLI commands (optional)

```powershell
npm i -g vercel
vercel login
vercel link        # link the local folder to the Vercel project
vercel env pull    # download env vars into .env.local
vercel             # deploy a preview from your machine
vercel --prod      # deploy directly to production
```

## 9. Common gotchas

| Symptom                                                   | Fix                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------- |
| 500 on `/api/waitlist`                                    | `GOOGLE_SHEETS_WEBHOOK_URL` not set in Vercel envs → add and redeploy. |
| Form succeeds but sheet not updated                       | Apps Script not deployed as **Web App, "Anyone" access**, or sheet name is not `"Hoja 1"`. |
| Hero video not playing on iOS                             | Ensure the `<video>` has `muted playsInline autoPlay` (it already does). |
| Fonts flash unstyled                                      | Already mitigated by `<link rel="preconnect">` to fonts.googleapis. |
| CDN images blocked by Vercel image optimization           | We use plain `<img>` (not `next/image`) — no allowlist needed.      |

---

That's it. After step 5 your site is live at `https://itzam.ai`.

---

## 10. App subdomain (`app.itzam.ai`) — admin + intake

The authenticated app lives at `app.itzam.ai`. Same repo, same Vercel project,
routed via `middleware.ts` (host-based rewrite into `/app/*`).

### 10.1 Add the subdomain in Vercel
1. **Settings → Domains → Add** → `app.itzam.ai`.
2. At your registrar, add `CNAME app → cname.vercel-dns.com`.
3. Wait for SSL.
4. Add a CAA record on `itzam.ai` allowing only `letsencrypt.org` (defense in depth):
   `itzam.ai. CAA 0 issue "letsencrypt.org"`

### 10.2 Provision Supabase
1. Create a project at <https://supabase.com> (free tier).
2. SQL editor → run `supabase/migrations/0001_init.sql`.
3. Edit `supabase/migrations/0002_seed_admins.sql` with real admin emails and run it.
4. Auth settings → URL configuration:
   - Site URL: `https://app.itzam.ai`
   - Additional redirect URLs: `https://app.itzam.ai/en/auth/callback`, `https://app.itzam.ai/es/auth/callback`
5. Copy `URL`, `anon key`, and `service_role key` into Vercel env vars (table above).

### 10.3 Configure Resend
1. Verify `notifications.itzam.ai` (or any subdomain) in Resend — add SPF, DKIM, DMARC DNS records.
2. Set `p=quarantine` on DMARC at minimum.
3. Add `RESEND_API_KEY` to Vercel.

### 10.4 Deploy the Drive intake webhook
Follow [`drive-intake-setup.md`](drive-intake-setup.md). Add `DRIVE_WEBHOOK_URL`
and `DRIVE_WEBHOOK_SECRET` to Vercel.

### 10.5 Configure Vercel Cron
1. Generate a strong random value, set as `CRON_SECRET` in Vercel.
2. `vercel.json` already declares `*/5 * * * *` against `/api/cron/process-jobs`.
3. Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically.

### 10.6 First admin login
1. Open `https://app.itzam.ai/es/login` (or `/en/login`).
2. Enter an email that's in the `admins` table.
3. Click the magic link in your inbox → lands on `/admin`.
4. Create a new questionnaire → "Generar link" → copy URL → manually email it to the client.

### 10.7 Local development
1. Copy `.env.local.example` → `.env.local` and fill values.
2. `npm run dev`.
3. Hit `http://localhost:3000/app/es/login` for the app, or set `FORCE_APP_HOST=1`
   to also exercise the host rewrite at `http://localhost:3000/login`.
4. Local cron trigger: `curl -H "Authorization: Bearer $env:CRON_SECRET" http://localhost:3000/api/cron/process-jobs`.

### 10.8 Security checklist (post-deploy)
- [ ] `securityheaders.com` reports A or A+ for `app.itzam.ai`.
- [ ] `mail-tester.com` shows SPF/DKIM/DMARC pass for Resend emails.
- [ ] Service role key not present in any client bundle (`.next/static/**`).
- [ ] Logging in as a non-admin redirects to `/login?reason=forbidden`.
- [ ] Tampering with `?t=` on an invite shows the same error as a non-existent ID.
- [ ] After regenerating a link, the previous token returns the same generic invalid page.
- [ ] Two simultaneous submits result in a single set of emails / Drive folder.
