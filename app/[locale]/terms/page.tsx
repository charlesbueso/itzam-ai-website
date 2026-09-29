import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { getTerms } from "@/lib/i18n/legal";
import LegalPage from "@/components/LegalPage";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return pageMetadata({
    locale: params.locale,
    path: "/terms",
    title: dict.legal.terms.meta.title,
    description: dict.legal.terms.meta.description,
    ogType: "article",
  });
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
