export const CURRENCY_COOKIE_NAME = "site-currency";

export const SUPPORTED_CURRENCIES = ["AED", "USD", "EUR"] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export type CurrencyRates = Record<CurrencyCode, number>;

export const DEFAULT_CURRENCY: CurrencyCode = "AED";

export const DEFAULT_CURRENCY_RATES: CurrencyRates = {
  AED: 1,
  USD: 0.2723,
  EUR: 0.2353,
};

export function normalizeCurrency(value: string | null | undefined): CurrencyCode {
  const normalized = String(value || "").trim().toUpperCase();

  if (SUPPORTED_CURRENCIES.includes(normalized as CurrencyCode)) {
    return normalized as CurrencyCode;
  }

  return DEFAULT_CURRENCY;
}

export function convertFromAED(
  amount: number | string | null | undefined,
  currency: CurrencyCode,
  rates: CurrencyRates = DEFAULT_CURRENCY_RATES,
) {
  const numeric = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  const safeAmount = Number.isFinite(numeric) ? numeric : 0;
  const rate = Number.isFinite(rates[currency]) ? rates[currency] : 1;
  return safeAmount * rate;
}

export function formatPriceFromAED(
  amount: number | string | null | undefined,
  currency: CurrencyCode,
  rates: CurrencyRates = DEFAULT_CURRENCY_RATES,
  locale?: string,
) {
  const converted = convertFromAED(amount, currency, rates);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(converted);
}
