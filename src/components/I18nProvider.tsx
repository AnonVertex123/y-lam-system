"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import vi from "@/locales/vi.json";
import en from "@/locales/en.json";

export type Locale = "vi" | "en";

type Dict = Record<string, unknown>;

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getFromPath(dict: Dict, key: string) {
  const parts = key.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

function setLocaleCookie(locale: Locale) {
  try {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `yl_locale=${locale}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  } catch {}
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("yl.locale");
      if ((stored === "vi" || stored === "en") && stored !== locale) {
        setLocaleState(stored);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocaleCookie(locale);
    try {
      localStorage.setItem("yl.locale", locale);
    } catch {}
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const dict = useMemo(() => {
    return locale === "vi" ? (vi as unknown as Dict) : (en as unknown as Dict);
  }, [locale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value = getFromPath(dict, key);
      if (typeof value === "string") return interpolate(value, vars);
      return key;
    },
    [dict]
  );

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
