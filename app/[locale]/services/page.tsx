import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import ServicesPageClient from "./ServicesPageClient";

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
        es: "/es/services",
        "x-default": "/en/services",
      },
    },
    openGraph: {
      title: dict.services.meta.title,
      description: dict.services.meta.description,
      locale: params.locale === "es" ? "es_MX" : "en_US",
    },
  };
}

export default function ServicesPage() {
  return <ServicesPageClient />;
}
