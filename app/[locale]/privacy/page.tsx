import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { getPrivacy } from "@/lib/i18n/legal";
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
    path: "/privacy",
    title: dict.legal.privacy.meta.title,
    description: dict.legal.privacy.meta.description,
    ogType: "article",
  });
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
