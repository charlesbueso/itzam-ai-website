# Itzam Brand Assets — Email Image Reference

This document lists the public CDN URLs for Itzam brand assets. Use these URLs directly in HTML email drafts via `<img src="...">` tags. Do **not** attach images locally — always reference them via these URLs.

---

## Available Assets

### 1. Logotype — Dark Mode (white text)
Use on **dark backgrounds**.

- **URL:** `https://alquimia-felina-spaces-bucket.nyc3.cdn.digitaloceanspaces.com/itzam/logotype-darkmode-nobg.png`
- **Background:** transparent
- **Best for:** dark-themed email headers, dark hero banners

```html
<img src="https://alquimia-felina-spaces-bucket.nyc3.cdn.digitaloceanspaces.com/itzam/logotype-darkmode-nobg.png" alt="Itzam" width="200" />
```

---

### 2. Logotype — Light Mode (dark text)
Use on **light backgrounds**.

- **URL:** `https://alquimia-felina-spaces-bucket.nyc3.cdn.digitaloceanspaces.com/itzam/logotype-lightmode-nobg.png`
- **Background:** transparent
- **Best for:** white/light email backgrounds, standard email signatures

```html
<img src="https://alquimia-felina-spaces-bucket.nyc3.cdn.digitaloceanspaces.com/itzam/logotype-lightmode-nobg.png" alt="Itzam" width="200" />
```

---

### 3. Logo Mark — Gold
Icon-only logo in gold. Works on both light and dark backgrounds.

- **URL:** `https://alquimia-felina-spaces-bucket.nyc3.cdn.digitaloceanspaces.com/itzam/logo-gold-nobg.png`
- **Background:** transparent
- **Best for:** small icon use, favicons-in-email, footers, accent placement

```html
<img src="https://alquimia-felina-spaces-bucket.nyc3.cdn.digitaloceanspaces.com/itzam/logo-gold-nobg.png" alt="Itzam" width="48" />
```

---

## Usage Guidelines for Email Drafts

1. **Always use the full URL** in the `src` attribute — never a local file path.
2. **Match the logo to the email background**:
   - Dark background → dark mode logotype (white text)
   - Light background → light mode logotype (dark text)
   - Accent / icon-only → gold logo mark
3. **Always include `alt="Itzam"`** for accessibility and for clients that block images.
4. **Set a `width`** (e.g., `width="200"` for logotype, `width="48"` for icon) so the image renders correctly before it loads.
5. **Do not resize via height alone** — set width and let height scale automatically.

---

## Quick Copy-Paste Snippets

**Header (light email):**
```html
<div style="text-align:center;padding:24px 0;">
  <img src="https://alquimia-felina-spaces-bucket.nyc3.cdn.digitaloceanspaces.com/itzam/logotype-lightmode-nobg.png" alt="Itzam" width="200" />
</div>
```

**Header (dark email):**
```html
<div style="text-align:center;padding:24px 0;background:#0a0a0a;">
  <img src="https://alquimia-felina-spaces-bucket.nyc3.cdn.digitaloceanspaces.com/itzam/logotype-darkmode-nobg.png" alt="Itzam" width="200" />
</div>
```

**Footer icon:**
```html
<img src="https://alquimia-felina-spaces-bucket.nyc3.cdn.digitaloceanspaces.com/itzam/logo-gold-nobg.png" alt="Itzam" width="32" />
```
