import type { Metadata } from "next";
import { LOCALES, type Locale } from "@/lib/i18n/dictionaries";

export const SITE_URL = "https://itzam.ai";
export const SITE_NAME = "Itzam.ai";

const OG_LOCALE: Record<Locale, string> = { en: "en_US", es: "es_MX" };

/** schema.org FAQPage for a visible FAQ section (answers must match the page). */
export function faqJsonLd(opts: { url: string; locale: Locale; items: { q: string; a: string }[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${opts.url}#faq`,
    inLanguage: opts.locale === "es" ? "es-MX" : "en-US",
    mainEntity: opts.items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

/**
 * Metadata for a public, bilingual page.
 *
 * - canonical + hreflang (en, en-US, es, es-MX, x-default → en)
 * - Open Graph / Twitter text. Images come from the `opengraph-image.tsx`
 *   file convention, so they are intentionally NOT set here (a page-level
 *   `openGraph` object replaces the parent's, which used to drop the image).
 * - `title` goes through the "%s | Itzam.ai" template set in the [locale]
 *   layout; pass `absoluteTitle` for pages that already contain the brand.
 */
export function pageMetadata(opts: {
  locale: Locale;
  /** Path after the locale, "" for the home page, e.g. "/services". */
  path: string;
  /** Per-locale paths when they differ (e.g. blog posts with localized slugs). */
  paths?: Record<Locale, string>;
  title: string;
  description: string;
  absoluteTitle?: boolean;
  ogType?: "website" | "article" | "profile";
  /** Article dates (ISO), for ogType "article". */
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const { locale, title, description } = opts;
  const pathFor = (l: Locale) => opts.paths?.[l] ?? opts.path;
  const path = pathFor(locale);
  const languages: Record<string, string> = { "x-default": `/en${pathFor("en")}` };
  for (const l of LOCALES) languages[l] = `/${l}${pathFor(l)}`;
  languages["en-US"] = `/en${pathFor("en")}`;
  languages["es-MX"] = `/es${pathFor("es")}`;

  const fullTitle = opts.absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: opts.absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: `/${locale}${path}`, languages },
    openGraph: {
      type: opts.ogType ?? "website",
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: `${SITE_URL}/${locale}${path}`,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
      ...(opts.modifiedTime ? { modifiedTime: opts.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
