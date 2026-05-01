"use client";

import { Sparkles } from "lucide-react";
import { useI18n } from "@/components/LanguageProvider";

interface BrowseBannerProps {
  categoryName?: string;
  totalProducts?: number;
}

export default function BrowseBanner({ categoryName = "All Products", totalProducts = 12500 }: BrowseBannerProps) {
  const { dir, t } = useI18n();

  return (
    <section className="w-full bg-linear-to-r from-blue-light to-blue py-12 lg:py-16 text-white overflow-hidden relative" dir={dir}>
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-orange/20 rounded-full blur-3xl" />
      
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className={`space-y-4 text-center ${dir === "rtl" ? "md:text-right" : "md:text-left"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-orange" />
              <span className="text-xs font-bold tracking-wider uppercase">{t("browse.discoveryHub")}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              {t("browse.browse")} <span className="text-orange">{categoryName}</span>
            </h1>
            <p className="text-lg text-blue-100 max-w-xl">
              {t("browse.browseDescription", { count: totalProducts.toLocaleString() })}
            </p>
          </div>
          
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-3xl font-bold text-orange">24/7</div>
                  <div className="text-xs text-blue-100 uppercase font-medium">{t("browse.support")}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-3xl font-bold text-orange">100%</div>
                  <div className="text-xs text-blue-100 uppercase font-medium">{t("browse.secure")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
