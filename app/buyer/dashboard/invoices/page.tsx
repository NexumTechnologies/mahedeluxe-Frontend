"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/components/LanguageProvider";
import { translateDashboard } from "@/lib/dashboard-i18n";
import { formatAED } from "@/lib/utils";

export default function BuyerInvoicesPage() {
  const { dir, locale } = useI18n();
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  return (
    <div className="max-w-6xl mx-auto p-6" dir={dir}>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{td("common.invoices")}</h1>
        <Link href="/buyer/dashboard/invoices" className="px-4 py-2 border rounded-md">{td("common.refresh")}</Link>
      </header>

      <section className="mt-6 bg-white border rounded-lg p-4">
        <table className="w-full text-sm">
          <thead className={`${dir === "rtl" ? "text-right" : "text-left"} text-slate-500`}>
            <tr>
              <th className="py-2">{td("common.invoice")}</th>
              <th className="py-2">{td("common.order")}</th>
              <th className="py-2">{td("common.date")}</th>
              <th className="py-2">{td("common.amount")}</th>
              <th className="py-2">{td("common.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-2">INV-2026-101</td>
              <td className="py-2">#2001</td>
              <td className="py-2">2026-01-22</td>
              <td className="py-2">{formatAED(50)}</td>
              <td className="py-2"><span className="text-green-600">{td("common.paid")}</span></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
