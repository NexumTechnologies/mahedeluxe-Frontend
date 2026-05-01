"use client";

import ProductCard from "@/components/ui/ProductCard";
import {
  LayoutGrid,
  List,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { getSafeImageFromValue } from "@/lib/utils";
import { useI18n } from "@/components/LanguageProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 6;

async function fetchBrowseProducts(
  categoryId: string | null,
  minPriceParam: string | null,
  maxPriceParam: string | null,
) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // If a category is selected from the homepage, hit the category-specific endpoint
  const endpoint = categoryId ? `/product/category/${categoryId}` : "/product";

  const res = await api.get(endpoint, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const data = res.data;
  const items =
    data?.data?.items ||
    data?.products ||
    data?.data ||
    data?.items ||
    data ||
    [];

  const minPrice = minPriceParam ? Number(minPriceParam) : null;
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : null;

  // Normalize into shape expected by ProductCard
  const normalized = items.map((product: any) => {
    const image = getSafeImageFromValue(product.image_url, "/dummy-product.png");

    const basePrice = Number(product.price) || 0;
    const customerPriceRaw =
      product && product.customer_price != null
        ? Number(product.customer_price)
        : null;
    const listingPrice =
      customerPriceRaw != null && !Number.isNaN(customerPriceRaw)
        ? customerPriceRaw
        : product?.listing?.display_price != null &&
            !Number.isNaN(Number(product.listing.display_price))
          ? Number(product.listing.display_price)
          : basePrice;

    const discountPrice =
      listingPrice > 0 ? `${listingPrice} AED` : `${basePrice} AED`;

    const cutPrice = undefined;

    return {
      id: String(product.id),
      name: product.name || "Product",
      image,
      discountPrice,
      cutPrice,
      // Keep numeric values for client-side filtering/sorting
      _numericPrice: listingPrice || basePrice,
      // Optional fields (rating, reviews, discount, moq) can be wired later
    };
  });

  // Apply client-side price filtering based on shown (listing) price
  return normalized.filter((p: any) => {
    const price = typeof p._numericPrice === "number" ? p._numericPrice : null;
    if (price == null) return true;
    if (minPrice != null && price < minPrice) return false;
    if (maxPrice != null && price > maxPrice) return false;
    return true;
  });
}

export default function BrowseContent() {
  const { dir, locale, t } = useI18n();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState(t("browse.recommended"));
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["browse-products", { categoryId, minPriceParam, maxPriceParam }],
    queryFn: () =>
      fetchBrowseProducts(categoryId, minPriceParam, maxPriceParam),
  });

  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = products.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const sortOptions = [
    t("browse.recommended"),
    t("browse.latest"),
    t("browse.priceLowToHigh"),
    t("browse.priceHighToLow"),
    t("browse.rating"),
  ];

  useEffect(() => {
    setSortBy(t("browse.recommended"));
  }, [locale, t]);

  return (
    <div className="flex-1" dir={dir}>
      {/* Top Bar */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">
            {isLoading ? (
              t("browse.loadingProducts")
            ) : error ? (
              t("browse.failedToLoadProducts")
            ) : products.length ? (
              <span>
                {t("browse.showingRange", {
                  start: startIndex + 1,
                  end: Math.min(startIndex + ITEMS_PER_PAGE, products.length),
                  count: products.length,
                })}
              </span>
            ) : (
              t("browse.noProductsFound")
            )}
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{t("browse.sortBy")}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-sm font-semibold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue/20">
                  {sortBy}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-50 bg-white border border-gray-100 rounded-xl shadow-xl p-1 z-50"
              >
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      sortBy === option
                        ? "bg-blue/5 text-blue font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* View Toggle */}
          <div className="hidden sm:flex items-center bg-gray-50 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-blue shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white text-blue shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div
        className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
      >
        {isLoading && (
          <div className="col-span-full text-center text-gray-500">
            {t("browse.loadingProducts")}
          </div>
        )}
        {error && !isLoading && (
          <div className="col-span-full text-center text-red-500">
            {t("browse.failedToLoadProducts")}
          </div>
        )}
        {!isLoading && !error && !currentProducts.length && (
          <div className="col-span-full text-center text-gray-500">
            {t("browse.noProductsFound")}
          </div>
        )}
        {!isLoading &&
          !error &&
          currentProducts.map((product: any) => (
            <ProductCard
              key={product.id}
              {...product}
              className={viewMode === "list" ? "flex flex-row h-auto" : ""}
            />
          ))}
      </div>

      {/* Pagination */}
      {products.length > 0 && totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-600 hover:border-blue hover:text-blue transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all font-bold ${
                  currentPage === i + 1
                    ? "bg-blue text-white shadow-lg shadow-blue/20"
                    : "border border-gray-100 text-gray-600 hover:border-blue hover:text-blue"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-600 hover:border-blue hover:text-blue transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
