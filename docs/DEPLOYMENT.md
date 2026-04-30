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
