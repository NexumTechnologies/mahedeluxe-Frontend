"use client";

import React from "react";
import { useI18n } from "@/components/LanguageProvider";
import { translateDashboard } from "@/lib/dashboard-i18n";

export default function PaymentsPage() {
  const { dir, locale } = useI18n();
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  return (
    <div className="max-w-6xl mx-auto p-6" dir={dir}>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{td("common.payments")}</h1>
      </header>

      <section className="mt-6 bg-white border rounded-lg p-4">
        <p className="text-sm text-slate-600">{td("buyerPayments.subtitle")}</p>
      </section>
    </div>
  );
}
