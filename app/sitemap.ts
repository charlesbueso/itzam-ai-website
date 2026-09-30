import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/dictionaries";
import { SITE_URL } from "@/lib/seo";
import { POSTS, postPaths } from "@/lib/blog";

/**
 * `updated` is the date the page's content last changed — bump it when you
 * edit a page. (It used to be `new Date()`, i.e. "changed on every crawl",
 * which teaches Google to ignore lastmod entirely.)
 */
const ROUTES: {
  path: string;
  updated: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "", updated: "2026-09-29", changeFrequency: "weekly", priority: 1.0 },
  { path: "/services", updated: "2026-09-29", changeFrequency: "monthly", priority: 0.9 },
  { path: "/assessment", updated: "2026-09-29", changeFrequency: "monthly", priority: 0.9 },
  { path: "/about", updated: "2026-09-30", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", updated: "2026-09-29", changeFrequency: "monthly", priority: 0.7 },
  { path: "/blog", updated: "2026-09-30", changeFrequency: "weekly", priority: 0.8 },
  { path: "/privacy", updated: "2026-05-01", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", updated: "2026-05-01", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of ROUTES) {
    for (const locale of LOCALES) {
      const url = `${SITE_URL}/${locale}${route.path}`;
      const languages: Record<string, string> = {
        "x-default": `${SITE_URL}/en${route.path}`,
      };
      for (const l of LOCALES) {
        languages[l] = `${SITE_URL}/${l}${route.path}`;
        if (l === "en") languages["en-US"] = `${SITE_URL}/en${route.path}`;
        if (l === "es") languages["es-MX"] = `${SITE_URL}/es${route.path}`;
      }
      entries.push({
        url,
        lastModified: route.updated,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: { languages },
      });
    }
  }

  // Blog posts — each language has its own slug; hreflang links the pair.
  for (const post of POSTS) {
    const paths = postPaths(post);
    const languages: Record<string, string> = {
      "x-default": `${SITE_URL}/en${paths.en}`,
      en: `${SITE_URL}/en${paths.en}`,
      "en-US": `${SITE_URL}/en${paths.en}`,
      es: `${SITE_URL}/es${paths.es}`,
      "es-MX": `${SITE_URL}/es${paths.es}`,
    };
    for (const locale of LOCALES) {
      entries.push({
        url: `${SITE_URL}/${locale}${paths[locale]}`,
        lastModified: post.updated ?? post.published,
        changeFrequency: "yearly",
        priority: 0.7,
        alternates: { languages },
      });
    }
  }

  return entries;
}
