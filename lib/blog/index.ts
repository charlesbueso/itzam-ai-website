import { getDictionary, LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import type { AuthorId, Block, Post } from "./types";
import { voiceNotesCaseStudy } from "./posts/voice-notes-case-study";
import { artValuationCaseStudy } from "./posts/art-valuation-case-study";
import { aiAssessmentGuide } from "./posts/ai-assessment-guide";
import { newalkAlliance } from "./posts/newalk-alliance";

/** Newest first. Add new posts here (and bump nothing else — sitemap/OG pick them up). */
export const POSTS: Post[] = [newalkAlliance, aiAssessmentGuide, voiceNotesCaseStudy, artValuationCaseStudy].sort((a, b) =>
  b.published.localeCompare(a.published)
);

export function getPostBySlug(locale: Locale, slug: string): Post | undefined {
  return POSTS.find((p) => p.translations[locale].slug === slug);
}

/** Path after the locale for a post, e.g. "/blog/caso-…". */
export function postPath(post: Post, locale: Locale): string {
  return `/blog/${post.translations[locale].slug}`;
}

export function postPaths(post: Post): Record<Locale, string> {
  return Object.fromEntries(LOCALES.map((l) => [l, postPath(post, l)])) as Record<Locale, string>;
}

/** Authors are the founders listed on the About page (same names, localized roles). */
export function getAuthor(id: AuthorId, locale: Locale): { name: string; role: string } {
  const members = getDictionary(locale).about.team.members;
  const m = id === "ceo" ? members[0] : members[1];
  return { name: m.name, role: m.role };
}

function blockText(b: Block): string {
  switch (b.type) {
    case "p":
    case "h2":
      return b.text;
    case "ul":
    case "ol":
      return b.items.join(" ");
    case "facts":
      return b.items.map((i) => `${i.label} ${i.value}`).join(" ");
    case "stats":
      return b.items.map((i) => `${i.value} ${i.label}`).join(" ");
    case "table":
      return [...b.head, ...b.rows.flat()].join(" ");
    default:
      return "";
  }
}

export function readingMinutes(post: Post, locale: Locale): number {
  const t = post.translations[locale];
  const words = [t.excerpt, ...t.body.map(blockText)].join(" ").split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatPostDate(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
