/**
 * Branded email layout — mirrors `docs/email-template-general.html`.
 *
 * Email-safe HTML: tables for layout, inline styles only. Do NOT add a
 * <style> block; many clients strip them.
 *
 * Logo URLs are pinned to the public CDN so they render without auth.
 */

const LOGO_DARK =
  "https://alquimia-felina-spaces-bucket.nyc3.cdn.digitaloceanspaces.com/itzam/logotype-darkmode-nobg.png";
const MARK_GOLD =
  "https://alquimia-felina-spaces-bucket.nyc3.cdn.digitaloceanspaces.com/itzam/logo-gold-nobg.png";

/**
 * Wraps a body fragment (already-escaped HTML) in the Itzam brand layout.
 * `body` must be self-contained block-level HTML using inline styles.
 */
export function renderBrandedEmail(opts: {
  body: string;
  preheader?: string;
}): string {
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Itzam</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
    ${preheader}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:32px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <tr>
            <td align="center" style="background-color:#0a0a0a;padding:32px 24px;">
              <img src="${LOGO_DARK}" alt="Itzam" width="220" style="display:block;border:0;outline:none;text-decoration:none;max-width:220px;height:auto;" />
            </td>
          </tr>
          <tr><td style="height:4px;background-color:#c9a14a;line-height:4px;font-size:4px;">&nbsp;</td></tr>
          <tr>
            <td style="padding:40px 32px;font-size:16px;line-height:1.6;color:#1a1a1a;">
              ${opts.body}
            </td>
          </tr>
          <tr>
            <td style="background-color:#0a0a0a;padding:32px 24px;text-align:center;color:#cccccc;font-size:13px;line-height:1.6;">
              <img src="${MARK_GOLD}" alt="Itzam" width="40" style="display:block;margin:0 auto 12px auto;border:0;outline:none;text-decoration:none;height:auto;" />
              <div style="color:#c9a14a;font-weight:bold;font-size:14px;letter-spacing:1px;margin-bottom:8px;">ITZAM</div>
              <div style="margin-bottom:12px;">
                <a href="https://itzam.ai" style="color:#ffffff;text-decoration:none;">itzam.ai</a>
                &nbsp;&middot;&nbsp;
                <a href="mailto:contact@itzam.ai" style="color:#ffffff;text-decoration:none;">contact@itzam.ai</a>
              </div>
              <div style="color:#888888;font-size:12px;">&copy; ${new Date().getFullYear()} Itzam. All rights reserved.</div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

/** Brand-styled CTA button. `label` is rendered as text; do not pass HTML. */
export function brandButton(opts: { href: string; label: string }): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="background-color:#c9a14a;border-radius:6px;"><a href="${opts.href}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:bold;color:#0a0a0a;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">${opts.label}</a></td></tr></table>`;
}
