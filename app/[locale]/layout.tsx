import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import {
  Locale,
  LOCALES,
  getDictionary,
  isLocale,
} from "@/lib/i18n/dictionaries";

const SITE_URL = "https://itzam.ai";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${params.locale}`,
      languages: {
        en: "/en",
        "en-US": "/en",
        es: "/es",
        "es-MX": "/es",
        "x-default": "/en",
      },
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      locale: params.locale === "es" ? "es_MX" : "en_US",
      url: `${SITE_URL}/${params.locale}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };
}

export default function LocaleLayout({
  params,
  children,
}: {
  params: { locale: string };
  children: React.ReactNode;
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;

  return (
    <LocaleProvider locale={locale}>
      <Navbar />
      {children}
    </LocaleProvider>
  );
}
