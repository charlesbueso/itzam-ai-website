import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { getTerms } from "@/lib/i18n/legal";
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
    title: dict.legal.terms.meta.title,
    description: dict.legal.terms.meta.description,
    alternates: {
      canonical: `/${params.locale}/terms`,
      languages: {
        en: "/en/terms",
        "en-US": "/en/terms",
        es: "/es/terms",
        "es-MX": "/es/terms",
        "x-default": "/en/terms",
      },
    },
    openGraph: {
      title: dict.legal.terms.meta.title,
      description: dict.legal.terms.meta.description,
      locale: params.locale === "es" ? "es_MX" : "en_US",
      url: `${SITE_URL}/${params.locale}/terms`,
      type: "article",
    },
  };
}

export default function TermsPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    const fallback = getDictionary("en");
    return (
      <LegalPage
        title={fallback.legal.terms.title}
        lastUpdated={fallback.legal.terms.lastUpdated}
        doc={getTerms("en")}
      />
    );
  }
  const dict = getDictionary(params.locale);
  return (
    <LegalPage
      title={dict.legal.terms.title}
      lastUpdated={dict.legal.terms.lastUpdated}
      doc={getTerms(params.locale)}
    />
  );
}
