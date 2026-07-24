/**
 * Company-email gate for the Free AI Assessment report pipeline.
 *
 * Free/personal inboxes are the main abuse vector (throwaway addresses), so we
 * only spend model tokens generating reports for business domains. Free-email
 * leads are still saved to the Sheet — just flagged for manual review instead
 * of auto-generating a report.
 */

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.es",
  "hotmail.co.uk",
  "outlook.com",
  "outlook.es",
  "live.com",
  "live.com.mx",
  "msn.com",
  "yahoo.com",
  "yahoo.com.mx",
  "yahoo.es",
  "ymail.com",
  "rocketmail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "gmx.com",
  "gmx.net",
  "mail.com",
  "yandex.com",
  "zoho.com",
  "tutanota.com",
  "hey.com",
]);

export function emailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  return at === -1 ? "" : email.slice(at + 1).trim().toLowerCase();
}

/** True when the email is on a business domain (not a known free provider). */
export function isCompanyEmail(email: string): boolean {
  const domain = emailDomain(email);
  if (!domain || !domain.includes(".")) return false;
  return !FREE_EMAIL_DOMAINS.has(domain);
}
