import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import AboutPageClient from "./AboutPageClient";

const SITE_URL = "https://itzam.ai";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return {
    title: dict.about.meta.title,
    description: dict.about.meta.description,
    alternates: {
      canonical: `/${params.locale}/about`,
      languages: {
        en: "/en/about",
        "en-US": "/en/about",
        es: "/es/about",
        "es-MX": "/es/about",
        "x-default": "/en/about",
      },
    },
    openGraph: {
      title: dict.about.meta.title,
      description: dict.about.meta.description,
      locale: params.locale === "es" ? "es_MX" : "en_US",
      url: `${SITE_URL}/${params.locale}/about`,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.about.meta.title,
      description: dict.about.meta.description,
    },
  };
}

export default function AboutPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return <AboutPageClient />;
  const dict = getDictionary(params.locale);
  const url = `${SITE_URL}/${params.locale}/about`;

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
        name: dict.nav.links.about,
        item: url,
      },
    ],
  };

  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${url}#aboutpage`,
    url,
    inLanguage: params.locale === "es" ? "es-MX" : "en-US",
    name: dict.about.meta.title,
    description: dict.about.meta.description,
    about: { "@id": `${SITE_URL}#organization` },
    mainEntity: {
      "@id": `${SITE_URL}#organization`,
      "@type": "ProfessionalService",
      employee: dict.about.team.members.map((m) => ({
        "@type": "Person",
        name: m.name,
        jobTitle: m.role,
        description: m.bio,
        worksFor: { "@id": `${SITE_URL}#organization` },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <AboutPageClient />
    </>
  );
}
