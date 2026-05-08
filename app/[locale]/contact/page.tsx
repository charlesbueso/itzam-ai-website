import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import ContactPageClient from "./ContactPageClient";

const SITE_URL = "https://itzam.ai";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return {
    title: dict.contact.meta.title,
    description: dict.contact.meta.description,
    alternates: {
      canonical: `/${params.locale}/contact`,
      languages: {
        en: "/en/contact",
        "en-US": "/en/contact",
        es: "/es/contact",
        "es-MX": "/es/contact",
        "x-default": "/en/contact",
      },
    },
    openGraph: {
      title: dict.contact.meta.title,
      description: dict.contact.meta.description,
      locale: params.locale === "es" ? "es_MX" : "en_US",
      url: `${SITE_URL}/${params.locale}/contact`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.contact.meta.title,
      description: dict.contact.meta.description,
    },
  };
}

export default function ContactPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return <ContactPageClient />;
  const dict = getDictionary(params.locale);
  const url = `${SITE_URL}/${params.locale}/contact`;

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
        name: dict.nav.links.contact,
        item: url,
      },
    ],
  };

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${url}#contactpage`,
    url,
    inLanguage: params.locale === "es" ? "es-MX" : "en-US",
    name: dict.contact.meta.title,
    description: dict.contact.meta.description,
    about: { "@id": `${SITE_URL}#organization` },
    mainEntity: {
      "@id": `${SITE_URL}#organization`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <ContactPageClient />
    </>
  );
}
