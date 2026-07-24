import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/dictionaries";

const SITE_URL = "https://itzam.ai";

const ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/services", changeFrequency: "weekly", priority: 0.9 },
  { path: "/assessment", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
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
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: { languages },
      });
    }
  }

  return entries;
}
