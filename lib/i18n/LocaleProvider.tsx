"use client";

import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  DEFAULT_LOCALE,
  Dictionary,
  HTML_LANG,
  Locale,
  getDictionary,
} from "./dictionaries";

type LocaleContextValue = {
  locale: Locale;
  t: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  t: getDictionary(DEFAULT_LOCALE),
});

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  // The root layout renders <html lang="en"> for every route; keep it in sync
  // on client-side navigation (e.g. the EN|ES toggle). The initial value is
  // set before paint by <HtmlLang> in the locale layouts.
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  const value: LocaleContextValue = {
    locale,
    t: getDictionary(locale),
  };
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

export function useT(): Dictionary {
  return useContext(LocaleContext).t;
}
