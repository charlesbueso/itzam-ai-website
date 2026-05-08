import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import AboutPageClient from "./AboutPageClient";

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
        es: "/es/about",
        "x-default": "/en/about",
      },
    },
    openGraph: {
      title: dict.about.meta.title,
      description: dict.about.meta.description,
      locale: params.locale === "es" ? "es_MX" : "en_US",
    },
  };
}

export default function AboutPage() {
  return <AboutPageClient />;
}
