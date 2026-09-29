import { HTML_LANG, type Locale } from "@/lib/i18n/dictionaries";

/**
 * The root layout owns <html> and can't see the [locale] param, so it always
 * renders lang="en". This inline script (first thing in <body>) corrects it
 * before paint for screen readers, Bing and translation prompts; the
 * LocaleProvider keeps it in sync on client-side locale switches.
 */
export function HtmlLang({ locale }: { locale: Locale }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.lang=${JSON.stringify(HTML_LANG[locale])};`,
      }}
    />
  );
}
