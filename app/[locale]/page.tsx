import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import HomePageClient from "./HomePageClient";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  // The home title already carries the brand — skip the "| Itzam.ai" suffix.
  return pageMetadata({
    locale: params.locale,
    path: "",
    title: dict.meta.title,
    description: dict.meta.description,
    absoluteTitle: true,
  });
}

export default function HomePage() {
  return <HomePageClient />;
}
