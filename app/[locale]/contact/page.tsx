import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import ContactPageClient from "./ContactPageClient";

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
        es: "/es/contact",
        "x-default": "/en/contact",
      },
    },
    openGraph: {
      title: dict.contact.meta.title,
      description: dict.contact.meta.description,
      locale: params.locale === "es" ? "es_MX" : "en_US",
    },
  };
}

export default function ContactPage() {
  return <ContactPageClient />;
}
