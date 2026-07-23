import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import AssessmentPageClient from "./AssessmentPageClient";

const SITE_URL = "https://itzam.ai";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return {
    title: dict.assessment.meta.title,
    description: dict.assessment.meta.description,
    alternates: {
      canonical: `/${params.locale}/assessment`,
      languages: {
        en: "/en/assessment",
        "en-US": "/en/assessment",
        es: "/es/assessment",
        "es-MX": "/es/assessment",
        "x-default": "/en/assessment",
      },
    },
    openGraph: {
      title: dict.assessment.meta.title,
      description: dict.assessment.meta.description,
      locale: params.locale === "es" ? "es_MX" : "en_US",
      url: `${SITE_URL}/${params.locale}/assessment`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.assessment.meta.title,
      description: dict.assessment.meta.description,
    },
  };
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
      <AssessmentPageClient />
    </>
  );
}
