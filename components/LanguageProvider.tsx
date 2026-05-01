"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  DEFAULT_LOCALE,
  getDirection,
  LOCALE_COOKIE_NAME,
  Locale,
  normalizeLocale,
  translate,
} from "@/lib/i18n";

type LanguageContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

type LanguageProviderProps = {
  initialLocale: Locale;
  children: React.ReactNode;
};

function persistLocale(locale: Locale) {
  if (typeof window === "undefined") return;

  localStorage.setItem(LOCALE_COOKIE_NAME, locale);
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = locale;
  document.documentElement.dir = getDirection(locale);
}

export default function LanguageProvider({
  initialLocale,
  children,
}: LanguageProviderProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const savedLocale =
      typeof window !== "undefined"
        ? normalizeLocale(localStorage.getItem(LOCALE_COOKIE_NAME))
        : DEFAULT_LOCALE;

    const nextLocale = savedLocale || initialLocale;
    setLocaleState(nextLocale);
    persistLocale(nextLocale);
  }, [initialLocale]);

  const setLocale = (nextLocale: Locale) => {
    const normalizedLocale = normalizeLocale(nextLocale);
    setLocaleState(normalizedLocale);
    persistLocale(normalizedLocale);
    startTransition(() => {
      router.refresh();
    });
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      dir: getDirection(locale),
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return context;
}