import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { HtmlLang } from "@/components/HtmlLang";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import {
  Locale,
  LOCALES,
  getDictionary,
  isLocale,
} from "@/lib/i18n/dictionaries";
import { SITE_NAME, pageMetadata } from "@/lib/seo";

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
    ...pageMetadata({
      locale: params.locale,
      path: "",
      title: dict.meta.title,
      description: dict.meta.description,
      absoluteTitle: true,
    }),
    // Re-declare the template here: a plain string title in this layout
    // would otherwise cancel the root template for every child page
    // (which is how /services ended up titled just "Services").
    title: { default: dict.meta.title, template: `%s | ${SITE_NAME}` },
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
      <HtmlLang locale={locale} />
      <Navbar />
      {children}
    </LocaleProvider>
  );
}
