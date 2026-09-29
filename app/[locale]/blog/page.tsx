import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { POSTS, formatPostDate, postPath, readingMinutes } from "@/lib/blog";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { SITE_URL, pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = getDictionary(params.locale);
  return pageMetadata({
    locale: params.locale,
    path: "/blog",
    title: t.blog.meta.title,
    description: t.blog.meta.description,
  });
}

export default function BlogIndexPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const t = getDictionary(locale);
  const url = `${SITE_URL}/${locale}/blog`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": `${url}#blog`,
      url,
      name: t.blog.meta.title,
      description: t.blog.meta.description,
      inLanguage: locale === "es" ? "es-MX" : "en-US",
      publisher: { "@id": `${SITE_URL}#organization` },
      blogPost: POSTS.map((p) => ({
        "@type": "BlogPosting",
        headline: p.translations[locale].title,
        url: `${SITE_URL}/${locale}${postPath(p, locale)}`,
        datePublished: p.published,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t.nav.links.home, item: `${SITE_URL}/${locale}` },
        { "@type": "ListItem", position: 2, name: t.nav.links.blog, item: url },
      ],
    },
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative w-full bg-black px-6 pb-16 pt-44 md:px-10 md:pb-24 md:pt-52">
        <div className="mx-auto w-full max-w-[90rem]">
          <Reveal as="span">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/80">
              {t.blog.eyebrow}
            </span>
          </Reveal>
          <h1 className="mt-6 max-w-5xl text-[clamp(2.75rem,6vw,6rem)] font-semibold leading-[0.98] tracking-tight text-white">
            <RevealText as="span">{t.blog.heading1}</RevealText>{" "}
            <RevealText as="span" className="text-[#c9a040]">
              {t.blog.heading2}
            </RevealText>
          </h1>
          <Reveal as="p" className="mt-8 max-w-2xl text-lg font-medium text-white/75 md:text-xl">
            {t.blog.sub}
          </Reveal>
        </div>
      </section>

      <section className="relative w-full bg-black px-6 pb-28 md:px-10 md:pb-36">
        <Reveal className="mx-auto w-full max-w-[90rem] border-t border-white/10" stagger={0.08}>
          {POSTS.map((post) => {
            const tr = post.translations[locale];
            return (
              <Link
                key={post.id}
                href={`/${locale}${postPath(post, locale)}`}
                className="group grid grid-cols-1 gap-4 border-b border-white/10 py-10 transition-colors md:grid-cols-12 md:gap-10 md:py-14"
              >
                <div className="md:col-span-3">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#c9a040]">
                    {t.blog.categories[post.category]}
                  </p>
                  <p className="mt-2 text-sm text-white/45">
                    <time dateTime={post.published}>{formatPostDate(post.published, locale)}</time>
                    {" · "}
                    {t.blog.minRead.replace("{n}", String(readingMinutes(post, locale)))}
                  </p>
                </div>
                <div className="md:col-span-9">
                  <h2 className="text-2xl font-semibold leading-tight tracking-tight text-white transition-colors group-hover:text-[#c9a040] md:text-4xl">
                    {tr.title}
                  </h2>
                  <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/65 md:text-lg">{tr.excerpt}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/85">
                    {t.blog.readArticle}
                    <span aria-hidden="true" className="text-[#c9a040] transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
