import { NextResponse } from "next/server";

import {
  DEFAULT_CURRENCY_RATES,
  SUPPORTED_CURRENCIES,
} from "@/lib/currency";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.frankfurter.app/latest?from=AED&to=USD,EUR",
      {
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      throw new Error(`Exchange rate request failed with ${response.status}`);
    }

    const payload = await response.json();

    return NextResponse.json({
      success: true,
      base: "AED",
      rates: {
        AED: 1,
        USD: Number(payload?.rates?.USD) || DEFAULT_CURRENCY_RATES.USD,
        EUR: Number(payload?.rates?.EUR) || DEFAULT_CURRENCY_RATES.EUR,
      },
      supported: SUPPORTED_CURRENCIES,
      fetchedAt: payload?.date || new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      success: true,
      base: "AED",
      rates: DEFAULT_CURRENCY_RATES,
      supported: SUPPORTED_CURRENCIES,
      fallback: true,
      fetchedAt: new Date().toISOString(),
    });
  }
}
