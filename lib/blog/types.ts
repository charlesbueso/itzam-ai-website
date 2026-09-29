import type { Locale } from "@/lib/i18n/dictionaries";

/**
 * Blog content model. Posts are typed data (not MDX) so they render as
 * server HTML with no extra dependencies, and every post exists in both
 * languages with its own slug.
 *
 * Inline text supports **bold** and [links](/es/assessment) — nothing else.
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "facts"; items: { label: string; value: string }[] }
  | { type: "stats"; items: { value: string; label: string }[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "cta"; variant: "assessment" | "contact" };

export type PostTranslation = {
  slug: string;
  title: string;
  /** Meta description (~150–160 chars). */
  description: string;
  /** Card + lead paragraph. */
  excerpt: string;
  body: Block[];
};

export type Post = {
  id: string;
  category: "case_study" | "guide";
  /** YYYY-MM-DD */
  published: string;
  updated?: string;
  author: AuthorId;
  translations: Record<Locale, PostTranslation>;
};

export type AuthorId = "ceo" | "cto";
