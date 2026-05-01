"use client";

import React from "react";
import { useI18n } from "@/components/LanguageProvider";
import { translateDashboard } from "@/lib/dashboard-i18n";

export default function BuyerMessagesPage() {
  const { dir, locale } = useI18n();
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  return (
    <div className="max-w-6xl mx-auto p-6" dir={dir}>
      <h1 className="text-2xl font-bold text-slate-900">{td("common.messages")}</h1>
      <p className="mt-2 text-sm text-slate-600">{td("buyerMessages.subtitle")}</p>
    </div>
  );
}
