"use client";

import { ChevronDown, Globe } from "lucide-react";

import { useI18n } from "@/components/LanguageProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DashboardLanguageSwitcherProps = {
  className?: string;
};

export default function DashboardLanguageSwitcher({
  className = "",
}: DashboardLanguageSwitcherProps) {
  const { dir, locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 ${className}`.trim()}
          aria-label="Change language"
        >
          <Globe className="h-4 w-4 text-orange" />
          <span>{locale === "ar" ? t("header.arabic") : t("header.english")}</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={dir === "rtl" ? "start" : "end"}
        className="min-w-36"
      >
        <DropdownMenuItem onClick={() => setLocale("en")}>
          {t("header.english")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("ar")}>
          {t("header.arabic")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}