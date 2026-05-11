<p align="center">
  <img src="https://alquimia-felina-spaces-bucket.nyc3.cdn.digitaloceanspaces.com/itzam/logotype-darkmode-nobg.png" alt="Itzam.ai" width="320" />
</p>

<p align="center">
  <strong>Intelligence, deployed.</strong><br/>
  The AI agency for sales teams in Mexico and LatAm. Diagnosis, implementation, and results — in weeks.
</p>

---

## Stack

- **Next.js 14** (App Router) · TypeScript · React 18
- **Tailwind CSS** for styling, custom cream tone (`#ece7e7`) replacing pure white
- **GSAP + ScrollTrigger** for the desktop hero pan
- **i18n**: English (`/en`) and Spanish (`/es`) routes via dictionary-based provider
- **API**: Google Sheets webhook for the contact form (`/api/waitlist`)
- **Hosting**: Vercel · Media on DigitalOcean Spaces CDN

## Quick start

```powershell
npm install
npm run dev
```

Open <http://localhost:3000> — the root redirects to `/en`.

## Project layout

```
app/
  layout.tsx              # Root <html>, global metadata, JSON-LD
  page.tsx                # Redirects / → /en
  [locale]/
    layout.tsx            # LocaleProvider + Navbar + per-locale metadata
    page.tsx              # Hero + Conviction + Waitlist
  api/waitlist/route.ts   # Posts form data to Google Sheets webhook
components/               # Hero, Conviction, Waitlist, Navbar, RevealText
lib/
  assets.ts               # CDN URLs (videos, logos, flags)
  i18n/
    dictionaries.ts       # EN + ES copy
    LocaleProvider.tsx    # useT() / useLocale() hook
public/                   # Local fallbacks (icons during dev)
scripts/crop_video.py     # One-off ffmpeg-based video cropper
```

## Environment variables

Copy `.env.local.example` → `.env.local` and fill in:

```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
```

The webhook receives `{ name, email, company, role, use_case, submitted_at }` and appends to a sheet named **"Hoja 1"** (Spanish locale).

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — ESLint

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full Vercel deployment guide.
