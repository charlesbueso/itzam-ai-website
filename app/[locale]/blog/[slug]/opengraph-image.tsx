import { getPostBySlug } from "@/lib/blog";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { OG_CONTENT_TYPE, OG_SIZE, ogImageFor, renderOgImage } from "@/lib/og";

// Edge: @vercel/og's Node build can't resolve its bundled font on Windows
// (Next 14.2); the edge build works everywhere.
export const runtime = "edge";
export const alt = "Itzam.ai blog";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image({ params }: { params: { locale: string; slug: string } }) {
  const locale = isLocale(params.locale) ? params.locale : "en";
  const post = getPostBySlug(locale, params.slug);
  if (!post) return ogImageFor("blog", locale);
  const tr = post.translations[locale];
  const excerpt = tr.excerpt.length > 150 ? `${tr.excerpt.slice(0, 147).trimEnd()}…` : tr.excerpt;
  return renderOgImage({
    eyebrow: `Blog · ${getDictionary(locale).blog.categories[post.category]}`,
    title: tr.title,
    subtitle: excerpt,
  });
}
