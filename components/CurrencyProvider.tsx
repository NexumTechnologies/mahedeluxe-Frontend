"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CURRENCY_COOKIE_NAME,
  CurrencyCode,
  CurrencyRates,
  DEFAULT_CURRENCY,
  DEFAULT_CURRENCY_RATES,
  normalizeCurrency,
} from "@/lib/currency";

type CurrencyContextValue = {
  currency: CurrencyCode;
  rates: CurrencyRates;
  isLoadingRates: boolean;
  setCurrency: (currency: CurrencyCode) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

type CurrencyProviderProps = {
  children: React.ReactNode;
};

function persistCurrency(currency: CurrencyCode) {
  if (typeof window === "undefined") return;

  localStorage.setItem(CURRENCY_COOKIE_NAME, currency);
  document.cookie = `${CURRENCY_COOKIE_NAME}=${currency}; path=/; max-age=31536000; samesite=lax`;
}

export default function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<CurrencyRates>(DEFAULT_CURRENCY_RATES);
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  useEffect(() => {
    const savedCurrency =
      typeof window !== "undefined"
        ? normalizeCurrency(localStorage.getItem(CURRENCY_COOKIE_NAME))
        : DEFAULT_CURRENCY;

    setCurrencyState(savedCurrency);
    persistCurrency(savedCurrency);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadRates = async () => {
      setIsLoadingRates(true);

      try {
        const response = await fetch("/api/exchange-rates", {
          cache: "no-store",
        });
        const payload = await response.json();

        if (cancelled || !response.ok) {
          throw new Error(payload?.message || "Failed to load exchange rates");
        }

        setRates({
          AED: 1,
          USD: Number(payload?.rates?.USD) || DEFAULT_CURRENCY_RATES.USD,
          EUR: Number(payload?.rates?.EUR) || DEFAULT_CURRENCY_RATES.EUR,
        });
      } catch {
        if (!cancelled) {
          setRates(DEFAULT_CURRENCY_RATES);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRates(false);
        }
      }
    };

    loadRates();

    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = (nextCurrency: CurrencyCode) => {
    const normalized = normalizeCurrency(nextCurrency);
    setCurrencyState(normalized);
    persistCurrency(normalized);
  };

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      rates,
      isLoadingRates,
      setCurrency,
    }),
    [currency, isLoadingRates, rates],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }

  return context;
}
