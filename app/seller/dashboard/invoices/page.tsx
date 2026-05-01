"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/components/LanguageProvider";
import { translateDashboard } from "@/lib/dashboard-i18n";
import { formatAED } from "@/lib/utils";

export default function InvoicesPage() {
  const { dir, locale } = useI18n();
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  return (
    <div className="max-w-6xl mx-auto p-6" dir={dir}>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{td("common.invoices")}</h1>
          <p className="mt-1 text-sm text-slate-600">{td("sellerInvoices.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/seller/dashboard/invoices/new" className="px-4 py-2 bg-green-600 text-white rounded-md">{td("common.newInvoice")}</Link>
          <Link href="/seller/dashboard/invoices" className="px-4 py-2 border rounded-md">{td("common.refresh")}</Link>
        </div>
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
              <th className="py-2">{td("common.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-2">INV-2026-001</td>
              <td className="py-2">#1007</td>
              <td className="py-2">2026-01-20</td>
              <td className="py-2">{formatAED(320)}</td>
              <td className="py-2"><span className="text-green-600">{td("common.paid")}</span></td>
              <td className="py-2"><Link href="#" className="text-blue-600 underline">{td("common.download")}</Link></td>
            </tr>
            <tr>
              <td className="py-2">INV-2026-002</td>
              <td className="py-2">#1006</td>
              <td className="py-2">2026-01-18</td>
              <td className="py-2">{formatAED(75)}</td>
              <td className="py-2"><span className="text-yellow-600">{td("common.pending")}</span></td>
              <td className="py-2"><Link href="#" className="text-blue-600 underline">{td("common.download")}</Link></td>
            </tr>
            <tr>
              <td className="py-2">INV-2025-099</td>
              <td className="py-2">#1005</td>
              <td className="py-2">2025-12-30</td>
              <td className="py-2">{formatAED(1120)}</td>
              <td className="py-2"><span className="text-red-600">{td("common.overdue")}</span></td>
              <td className="py-2"><Link href="#" className="text-blue-600 underline">{td("common.download")}</Link></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
