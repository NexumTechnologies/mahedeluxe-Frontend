"use client";

import React from "react";
import { useI18n } from "@/components/LanguageProvider";
import { translateDashboard } from "@/lib/dashboard-i18n";

export default function MessagesPage() {
  const { dir, locale } = useI18n();
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold">{td("sellerMessages.title")}</h1>
      <p className="mt-2 text-gray-600">{td("sellerMessages.subtitle")}</p>

      {/* TODO: messages inbox */}
    </div>
  );
}
