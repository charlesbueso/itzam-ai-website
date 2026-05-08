/**
 * Centralized asset URLs.
 * All media is hosted on the DigitalOcean Spaces CDN.
 */
const CDN = "https://alquimia-felina-spaces-bucket.nyc3.cdn.digitaloceanspaces.com/itzam";

export const ASSETS = {
  heroVideo: `${CDN}/landing-bg-desktop-web.mp4`,
  logoGold: `${CDN}/logo-gold-nobg.png`,
  logotypeDark: `${CDN}/logotype-darkmode-nobg.png`,
  logotypeLight: `${CDN}/logotype-lightmode-nobg.png`,
} as const;
