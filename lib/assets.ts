/**
 * Centralized asset URLs.
 * All media is hosted on the DigitalOcean Spaces CDN.
 */
const CDN = "https://alquimia-felina-spaces-bucket.nyc3.cdn.digitaloceanspaces.com/itzam";
const AI_VIDEOS = `${CDN}/ai-videos`;

export const ASSETS = {
  heroVideo: `${CDN}/landing-bg-desktop-web.mp4`,
  logoGold: `${CDN}/logo-gold-nobg.png`,
  logotypeDark: `${CDN}/logotype-darkmode-nobg.png`,
  logotypeLight: `${CDN}/logotype-lightmode-nobg.png`,
  // AI-generated looping product videos
  serviceOpportunity: `${AI_VIDEOS}/ai-opportunity.mp4`,
  serviceSalesPlaybook: `${AI_VIDEOS}/sales-playbook.mp4`,
  serviceSupportEngine: `${AI_VIDEOS}/customer-support-engine.mp4`,
  serviceBrainLab: `${AI_VIDEOS}/brain-lab.mp4`,
} as const;

/**
 * Per-service looping background videos (used in the landing services teaser).
 * Keys must match the `slug` of each service in `lib/i18n/dictionaries.ts`.
 */
export const SERVICE_VIDEOS: Record<string, string> = {
  "service-1": ASSETS.serviceOpportunity,
  "service-2": ASSETS.serviceSalesPlaybook,
  "service-3": ASSETS.serviceSupportEngine,
  "service-4": ASSETS.serviceBrainLab,
};
