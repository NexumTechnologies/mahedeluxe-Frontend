"use client";

import Link from "next/link";
import { Search, TrendingUp, Users, Package } from "lucide-react";
import { useI18n } from "@/components/LanguageProvider";

export default function HeroSearchSection() {
  const { dir, t } = useI18n();

  return (
    <section className="relative w-full min-h-125 lg:min-h-150 bg-linear-to-tr from-blue via-blue-light to-blue" dir={dir}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative w-full max-w-350 mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Content */}
          <div className={`text-center ${dir === "rtl" ? "lg:text-right" : "lg:text-left"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4" />
              <span>{t("home.heroBadge")}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t("home.heroTitleLine1")} <span className="text-orange">{t("home.heroTitleHighlight")}</span>
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-yellow-200 to-pink-200">
                <span className="text-orange">{t("home.heroTitleLine2")}</span> {t("home.heroTitleLine2Suffix")}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl mx-auto lg:mx-0">
              {t("home.heroDescription")}
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-8">
              <div className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5" />
                <span className="font-semibold">10K+</span>
                <span className="text-orange">{t("home.vendors")}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Package className="h-5 w-5" />
                <span className="font-semibold">500K+</span>
                <span className="text-white/80">{t("home.products")}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/browse"
                className="px-8 py-4 bg-white text-orange rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
              >
                {t("home.browseProducts")}
              </Link>
              <Link
                href="/auth/seller/signin"
                className="px-8 py-4 bg-transparent border-2 border-orange text-white rounded-lg font-semibold hover:bg-white/10 transition-colors text-center"
              >
                {t("home.startSelling")}
              </Link>
            </div>
          </div>

          {/* Right: Search Section */}
          <div className="space-y-6">
            {/* Main Search Bar */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    readOnly
                    placeholder={t("home.heroSearchPlaceholder")}
                    onFocus={() => {
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new Event("open-global-search"));
                      }
                    }}
                    className="w-full h-14 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange text-gray-900 cursor-pointer"
                  />
                </div>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new Event("open-global-search"));
                    }
                  }}
                  className="h-14 px-8 bg-orange hover:bg-blue text-white rounded-xl font-semibold transition-colors whitespace-nowrap"
                >
                  {t("home.search")}
                </button>
              </div>

              {/* Quick Filters */}
              {/* <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Popular:</span>
                {["Electronics", "Apparel", "Home & Garden", "Industrial"].map(
                  (tag) => (
                    <button
                      key={tag}
                      className="px-4 py-1.5 bg-gray-100 hover:bg-orange hover:text-white rounded-full text-sm font-medium transition-colors"
                    >
                      {tag}
                    </button>
                  ),
                )}
              </div> */}
            </div>

            {/* Search Options */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white hover:bg-white/20 transition-colors"
              >
                <div className="font-semibold mb-1">{t("home.customOrders")}</div>
                <div className="text-sm text-white/80">
                  {t("home.bulkRequests")}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white hover:bg-white/20 transition-colors">
                <div className="font-semibold mb-1">{t("home.onDemand")}</div>
                <div className="text-sm text-white/80">
                  {t("home.customManufacturing")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
