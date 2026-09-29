import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { SITE_URL, faqJsonLd, pageMetadata } from "@/lib/seo";
import AssessmentPageClient from "./AssessmentPageClient";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return pageMetadata({
    locale: params.locale,
    path: "/assessment",
    title: dict.assessment.meta.title,
    description: dict.assessment.meta.description,
  });
}

export default function AssessmentPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return <AssessmentPageClient />;
  const dict = getDictionary(params.locale);
  const url = `${SITE_URL}/${params.locale}/assessment`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: dict.nav.links.home,
        item: `${SITE_URL}/${params.locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: dict.nav.links.assessment,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd({ url, locale: params.locale, items: dict.assessment.faq.items })),
        }}
      />
      <AssessmentPageClient />
    </>
  );
}
