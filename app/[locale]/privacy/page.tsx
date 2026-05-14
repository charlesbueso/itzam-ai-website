import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { getPrivacy } from "@/lib/i18n/legal";
import LegalPage from "@/components/LegalPage";

const SITE_URL = "https://itzam.ai";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return {
    title: dict.legal.privacy.meta.title,
    description: dict.legal.privacy.meta.description,
    alternates: {
      canonical: `/${params.locale}/privacy`,
      languages: {
        en: "/en/privacy",
        "en-US": "/en/privacy",
        es: "/es/privacy",
        "es-MX": "/es/privacy",
        "x-default": "/en/privacy",
      },
    },
    openGraph: {
      title: dict.legal.privacy.meta.title,
      description: dict.legal.privacy.meta.description,
      locale: params.locale === "es" ? "es_MX" : "en_US",
      url: `${SITE_URL}/${params.locale}/privacy`,
      type: "article",
    },
  };
}

export default function PrivacyPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    const fallback = getDictionary("en");
    return (
      <LegalPage
        title={fallback.legal.privacy.title}
        lastUpdated={fallback.legal.privacy.lastUpdated}
        doc={getPrivacy("en")}
      />
    );
  }
  const dict = getDictionary(params.locale);
  return (
    <LegalPage
      title={dict.legal.privacy.title}
      lastUpdated={dict.legal.privacy.lastUpdated}
      doc={getPrivacy(params.locale)}
    />
  );
}
