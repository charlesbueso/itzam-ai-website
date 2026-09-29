import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import Footer from "@/components/Footer";
import ArticleBody from "@/components/blog/ArticleBody";
import {
  POSTS,
  formatPostDate,
  getAuthor,
  getPostBySlug,
  postPath,
  postPaths,
  readingMinutes,
} from "@/lib/blog";
import { LOCALES, getDictionary, isLocale, type Locale } from "@/lib/i18n/dictionaries";
import { SITE_URL, pageMetadata } from "@/lib/seo";

export function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  return POSTS.map((p) => ({ slug: p.translations[locale].slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const post = getPostBySlug(params.locale, params.slug);
  if (!post) return {};
  const tr = post.translations[params.locale];
  return pageMetadata({
    locale: params.locale,
    path: postPath(post, params.locale),
    paths: postPaths(post),
    title: tr.title,
    description: tr.description,
    ogType: "article",
    publishedTime: post.published,
    modifiedTime: post.updated ?? post.published,
  });
}

export default function BlogPostPage({ params }: { params: { locale: string; slug: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const post = getPostBySlug(locale, params.slug);

  if (!post) {
    // The EN|ES toggle keeps the slug; send it to this post's localized slug.
    const other = LOCALES.map((l) => getPostBySlug(l, params.slug)).find(Boolean);
    if (other) permanentRedirect(`/${locale}${postPath(other, locale)}`);
    notFound();
  }

  const t = getDictionary(locale);
  const tr = post.translations[locale];
  const author = getAuthor(post.author, locale);
  const url = `${SITE_URL}/${locale}${postPath(post, locale)}`;
  const related = POSTS.filter((p) => p.id !== post.id).slice(0, 2);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      mainEntityOfPage: url,
      url,
      headline: tr.title,
      description: tr.description,
      image: `${url}/opengraph-image`,
      inLanguage: locale === "es" ? "es-MX" : "en-US",
      datePublished: post.published,
      dateModified: post.updated ?? post.published,
      articleSection: t.blog.categories[post.category],
      author: {
        "@type": "Person",
        name: author.name,
        jobTitle: author.role,
        worksFor: { "@id": `${SITE_URL}#organization` },
        url: `${SITE_URL}/${locale}/about`,
      },
      publisher: { "@id": `${SITE_URL}#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t.nav.links.home, item: `${SITE_URL}/${locale}` },
        { "@type": "ListItem", position: 2, name: t.nav.links.blog, item: `${SITE_URL}/${locale}/blog` },
        { "@type": "ListItem", position: 3, name: tr.title, item: url },
      ],
    },
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="relative w-full bg-black px-6 pb-20 pt-40 md:px-10 md:pt-48">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-[#c9a040]"
          >
            <span aria-hidden="true">←</span> {t.blog.backToBlog}
          </Link>

          <p className="mt-10 font-mono text-xs uppercase tracking-[0.2em] text-[#c9a040]">
            {t.blog.categories[post.category]}
          </p>
          <h1 className="mt-4 text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.05] tracking-tight text-white">
            {tr.title}
          </h1>
          <p className="mt-6 text-sm text-white/50">
            {t.blog.by} <Link href={`/${locale}/about`} className="text-white/80 hover:text-[#c9a040]">{author.name}</Link>
            {" · "}
            {author.role}
            {" · "}
            <time dateTime={post.published}>{formatPostDate(post.published, locale)}</time>
            {" · "}
            {t.blog.minRead.replace("{n}", String(readingMinutes(post, locale)))}
          </p>
          <p className="mb-12 mt-10 border-l-2 border-[#c9a040] pl-5 text-xl leading-relaxed text-white/85 md:text-2xl">
            {tr.excerpt}
          </p>

          <ArticleBody blocks={tr.body} locale={locale} t={t} />
        </div>
      </article>

      {related.length > 0 && (
        <section className="w-full bg-black px-6 pb-28 md:px-10">
          <div className="mx-auto w-full max-w-3xl border-t border-white/10 pt-12">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/45">{t.blog.related}</p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/${locale}${postPath(p, locale)}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-[#c9a040]/40"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#c9a040]">
                    {t.blog.categories[p.category]}
                  </p>
                  <p className="mt-3 text-lg font-semibold leading-snug text-white transition-colors group-hover:text-[#c9a040]">
                    {p.translations[locale].title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
