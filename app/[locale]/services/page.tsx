import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import ServicesPageClient from "./ServicesPageClient";

const SITE_URL = "https://itzam.ai";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return {
    title: dict.services.meta.title,
    description: dict.services.meta.description,
    alternates: {
      canonical: `/${params.locale}/services`,
      languages: {
        en: "/en/services",
        "en-US": "/en/services",
        es: "/es/services",
        "es-MX": "/es/services",
        "x-default": "/en/services",
      },
    },
    openGraph: {
      title: dict.services.meta.title,
      description: dict.services.meta.description,
      locale: params.locale === "es" ? "es_MX" : "en_US",
      url: `${SITE_URL}/${params.locale}/services`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.services.meta.title,
      description: dict.services.meta.description,
    },
  };
}

export default function ServicesPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return <ServicesPageClient />;
  const dict = getDictionary(params.locale);
  const url = `${SITE_URL}/${params.locale}/services`;

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
        name: dict.nav.links.services,
        item: url,
      },
    ],
  };

  const serviceCatalogJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: dict.services.meta.title,
    description: dict.services.meta.description,
    inLanguage: params.locale === "es" ? "es-MX" : "en-US",
    itemListElement: dict.services.items.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        "@id": `${url}#${s.slug}`,
        name: s.title,
        description: s.tagline,
        url: `${url}#${s.slug}`,
        provider: { "@id": `${SITE_URL}#organization` },
        serviceType: s.title,
        areaServed: [
          { "@type": "Place", name: "Latin America" },
          { "@type": "Country", name: "Mexico" },
        ],
        availableLanguage: ["en", "es"],
      },
    })),
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
          __html: JSON.stringify(serviceCatalogJsonLd),
        }}
      />
      <ServicesPageClient />
    </>
  );
}
