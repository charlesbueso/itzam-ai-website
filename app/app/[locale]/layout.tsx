import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { AppHeader } from "@/components/AppHeader";
import {
  Locale,
  LOCALES,
  isLocale,
  getDictionary,
} from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

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
    title: { absolute: `${dict.app.admin.title} | Itzam.ai` },
    robots: { index: false, follow: false },
  };
}

export default function AppLocaleLayout({
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
      <div className="flex min-h-screen flex-col bg-black text-white">
        <AppHeader href={`/${locale}`} />
        <div className="flex-1">{children}</div>
        <div
          aria-hidden
          className="h-px bg-gradient-to-r from-transparent via-[#c9a040]/60 to-transparent"
        />
        <footer className="px-6 py-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Itzam.ai
        </footer>
      </div>
    </LocaleProvider>
  );
}

