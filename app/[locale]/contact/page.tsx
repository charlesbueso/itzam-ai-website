import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { SITE_URL, pageMetadata } from "@/lib/seo";
import ContactPageClient from "./ContactPageClient";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return pageMetadata({
    locale: params.locale,
    path: "/contact",
    title: dict.contact.meta.title,
    description: dict.contact.meta.description,
  });
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
