"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/components/LanguageProvider";
import { translateDashboard } from "@/lib/dashboard-i18n";
import { formatAED } from "@/lib/utils";

export default function WishlistPage() {
  const { dir, locale } = useI18n();
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  return (
    <div className="max-w-6xl mx-auto p-6" dir={dir}>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{td("common.wishlist")}</h1>
        <Link href="/buyer/dashboard/browse-products" className="px-4 py-2 border rounded-md">{td("common.browse")}</Link>
      </header>

      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-semibold">Widget A</h3>
          <p className="text-sm text-slate-500 mt-1">{td("sellerProducts.priceLabel")}: {formatAED(10)} • MOQ: 10</p>
        </div>
      </section>
    </div>
  );
}
