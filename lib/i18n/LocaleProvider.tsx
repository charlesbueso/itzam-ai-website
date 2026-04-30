"use client";

import { createContext, ReactNode, useContext } from "react";
import {
  DEFAULT_LOCALE,
  Dictionary,
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
