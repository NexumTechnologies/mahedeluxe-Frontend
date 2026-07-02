"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { getSafeImageFromValue } from "@/lib/utils";
import { useI18n } from "@/components/LanguageProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import { formatPriceFromAED } from "@/lib/currency";

interface ProductApiItem {
  id?: string | number;
  name?: string;
  image_url?: string | null;
  price?: string | number | null;
  customer_price?: string | number | null;
  average_rating?: string | number | null;
  rating?: string | number | null;
  review_count?: string | number | null;
  reviews?: string | number | null;
}

interface Product {
  id: string;
  name: string;
  rating: number;
  discountPrice: number;
  cutPrice: number;
  image: string;
  reviews?: number;
  discount?: number;
}

//========================= API CALLS ==========================//
//==============================================================//
async function fetchFeaturedProducts(): Promise<Product[]> {
  const res = await api.get("/product/public/listed", { params: { limit: 12 } });
  const data = res.data;
  const items =
    data?.data?.items || data?.data || data?.products || data?.items || data || [];

  return (Array.isArray(items) ? items : []).slice(0, 12).map((product: ProductApiItem) => {
    const image = getSafeImageFromValue(product.image_url, "/dummy-product.png");
    const name = product.name || "Product";

    const basePrice = Number(product.price) || 0;
    const customerPriceRaw =
      product && product.customer_price != null
        ? Number(product.customer_price)
        : null;
    const listingPrice =
      customerPriceRaw != null && !Number.isNaN(customerPriceRaw)
        ? customerPriceRaw
        : basePrice;

    const discountPrice = listingPrice;
    const cutPrice = listingPrice;

    return {
      id: String(product.id),
      name,
      rating: Number(product.average_rating ?? product.rating) || 0,
      discountPrice,
      cutPrice,
      image,
      reviews: Number(product.review_count ?? product.reviews) || 0,
    } as Product;
  });
}

export default function ProductsGridSection() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { dir, locale, t } = useI18n();
  const { currency, rates } = useCurrency();

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: ["home-listed-products", "featured"],
    queryFn: fetchFeaturedProducts,
  });

  console.log("Fetched products:", products);

  const toggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  return (
    <section className="w-full py-14 sm:py-18 lg:py-24" dir={dir}>
      <div className="mx-auto w-full max-w-350 px-4 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-4xl border border-stone-200/80 bg-white/90 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8 lg:mb-14 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f0d7ca] bg-[#fff5ee] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#9a5b3c]">
                <Sparkles className="h-3.5 w-3.5" />
                {t("home.featuredCollection")}
              </div>
              <div className="space-y-3">
                <h2 className="max-w-xl text-4xl leading-none text-slate-900 sm:text-5xl lg:text-6xl">
                  {t("home.featuredTitle")}
                </h2>
                <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                  {t("home.featuredDescription")}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Star className="h-4 w-4 fill-[#f4b544] text-[#f4b544]" />
                {t("home.featuredSummary")}
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white/80 py-10 text-center text-sm text-slate-500 shadow-sm">
            {t("home.loadingFeaturedProducts")}
          </div>
        )}
        {!isLoading && error && (
          <div className="rounded-[1.75rem] border border-red-100 bg-red-50 py-10 text-center text-sm text-red-600 shadow-sm">
            {t("home.failedFeaturedProducts")}
          </div>
        )}
        {!isLoading && !error && products.length === 0 && (
          <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white/80 py-10 text-center text-sm text-slate-500 shadow-sm">
            {t("home.emptyFeaturedProducts")}
          </div>
        )}

        {products.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-stone-200/80 bg-white p-3 shadow-[0_18px_55px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.1)] sm:rounded-[1.75rem] sm:p-5"
              >
                <div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-[#d6b6a5] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4 sm:gap-3">
                  <div className="min-w-0 space-y-1.5 sm:space-y-2">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:px-3 sm:text-[0.68rem] sm:tracking-[0.2em]">
                      {t("home.featuredPick")}
                    </span>
                    <div className="flex items-center gap-1.5 text-[0.82rem] text-slate-500 sm:gap-2 sm:text-sm">
                      <Star className="h-3.5 w-3.5 fill-[#f4b544] text-[#f4b544] sm:h-4 sm:w-4" />
                      <span className="font-semibold text-slate-700">{product.rating.toFixed(1)}</span>
                      <span className="truncate">{product.reviews ? `${product.reviews} ${t("home.reviews")}` : t("home.newListing")}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleFavorite(product.id, e)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-400 transition-colors duration-300 hover:border-[#efc9b4] hover:text-[#c96d3f] sm:h-10 sm:w-10"
                    aria-label={t("home.addToFavorites")}
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        favorites.has(product.id)
                          ? "fill-[#d4663a] text-[#d4663a]"
                          : "text-current"
                      }`}
                    />
                  </button>
                </div>

                <div className="relative mb-3 overflow-hidden rounded-[1.1rem] bg-[linear-gradient(145deg,#fff7f1_0%,#f7f7f5_52%,#eef3f8_100%)] sm:mb-4 sm:rounded-3xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_55%)]" />
                  <div className="relative aspect-square w-full sm:aspect-[4/3.5]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 sm:p-5"
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col px-0.5 sm:px-1">
                  <h3 className="min-h-[2.8rem] line-clamp-2 text-[0.98rem] leading-5 text-slate-900 transition-colors duration-300 group-hover:text-[#8d4d2b] sm:min-h-12 sm:text-[1.2rem] sm:leading-6">
                    {product.name}
                  </h3>

                  <div className="mt-auto flex items-end justify-between gap-2 border-t border-stone-200 pt-3 sm:gap-4 sm:pt-4">
                    <div className="min-w-0 space-y-1">
                      <span className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:text-[0.68rem] sm:tracking-[0.22em]">
                        {t("home.startingAt")}
                      </span>
                      <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                        <span className="text-[1.05rem] font-extrabold tracking-[-0.04em] text-slate-900 sm:text-2xl">
                          {formatPriceFromAED(
                            product.discountPrice,
                            currency,
                            rates,
                            locale,
                          )}
                        </span>
                        {product.cutPrice !== product.discountPrice && (
                          <span className="text-xs text-slate-400 line-through sm:text-sm">
                            {formatPriceFromAED(
                              product.cutPrice,
                              currency,
                              rates,
                              locale,
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="inline-flex shrink-0 items-center rounded-full bg-[#0f172a] px-3 py-2 text-[0.74rem] font-semibold text-white transition-colors duration-300 group-hover:bg-[#8d4d2b] sm:px-4 sm:text-sm">
                      {t("home.viewDetails")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
            >
              {t("home.viewAllProducts")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
