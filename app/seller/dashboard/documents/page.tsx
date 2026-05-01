"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/components/LanguageProvider";
import { translateDashboard } from "@/lib/dashboard-i18n";

export default function DocumentsPage() {
  const { dir, locale } = useI18n();
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  return (
    <div className="max-w-6xl mx-auto p-6" dir={dir}>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{td("common.documents")}</h1>
          <p className="mt-1 text-sm text-slate-600">{td("sellerDocuments.subtitle")}</p>
        </div>
        <Link href="/seller/dashboard/documents/upload" className="px-4 py-2 bg-green-600 text-white rounded-md">{td("common.uploadDocument")}</Link>
      </header>

      <section className="mt-6 bg-white border rounded-lg p-4">
        <table className="w-full text-sm">
          <thead className={`${dir === "rtl" ? "text-right" : "text-left"} text-slate-500`}>
            <tr>
              <th className="py-2">{td("sellerDocuments.document")}</th>
              <th className="py-2">{td("common.type")}</th>
              <th className="py-2">{td("common.uploaded")}</th>
              <th className="py-2">{td("common.status")}</th>
              <th className="py-2">{td("common.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-2">Business Registration.pdf</td>
              <td className="py-2">{td("common.registration")}</td>
              <td className="py-2">2026-01-15</td>
              <td className="py-2"><span className="text-green-600">{td("common.verified")}</span></td>
              <td className="py-2"><Link href="#" className="text-blue-600 underline">{td("common.view")}</Link></td>
            </tr>
            <tr>
              <td className="py-2">ID-Card.jpg</td>
              <td className="py-2">{td("common.identity")}</td>
              <td className="py-2">2026-01-20</td>
              <td className="py-2"><span className="text-yellow-600">{td("common.pending")}</span></td>
              <td className="py-2"><Link href="#" className="text-blue-600 underline">{td("common.view")}</Link></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
