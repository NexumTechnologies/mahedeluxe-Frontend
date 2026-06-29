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

const ITEMS_PER_PAGE = 12;

async function fetchBrowseProducts(
  categoryId: string | null,
  subCategoryId: string | null,
  subSubCategoryId: string | null,
  minPriceParam: string | null,
  maxPriceParam: string | null,
  page: number,
) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const endpoint = subCategoryId
    ? `/product/subcategory/${subCategoryId}`
    : categoryId
      ? `/product/category/${categoryId}`
      : "/product";

  const res = await api.get(endpoint, {
    params:
      !categoryId && !subCategoryId
        ? {
            page,
            size: ITEMS_PER_PAGE,
          }
        : undefined,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const data = res.data;
  const pagination = data?.data?.pagination;
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

    return {
      id: String(product.id),
      name: product.name || "Product",
      image,
      discountPriceAmount: listingPrice > 0 ? listingPrice : basePrice,
      cutPrice: undefined,
      _subCategoryId: String(product.sub_category_id ?? product.SubCategory?.id ?? ""),
      _subSubCategoryId: String(product.sub_sub_category_id ?? product.SubSubCategory?.id ?? ""),
      // Keep numeric values for client-side filtering/sorting
      _numericPrice: listingPrice || basePrice,
      // Optional fields (rating, reviews, discount, moq) can be wired later
    };
  });

  const filteredProducts = normalized.filter((p: any) => {
    if (
      subSubCategoryId &&
      String(p._subSubCategoryId || "").trim() !== String(subSubCategoryId).trim()
    ) {
      return false;
    }

    const price = typeof p._numericPrice === "number" ? p._numericPrice : null;
    if (price == null) return true;
    if (minPrice != null && price < minPrice) return false;
    if (maxPrice != null && price > maxPrice) return false;
    return true;
  });

  if (!categoryId && !subCategoryId) {
    return {
      items: filteredProducts,
      totalItems: pagination?.totalItems ?? filteredProducts.length,
      totalPages:
        pagination?.totalPages ??
        Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)),
      currentPage: pagination?.currentPage ?? page,
    };
  }

  return {
    items: filteredProducts,
    totalItems: filteredProducts.length,
    totalPages: Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)),
    currentPage: page,
  };
}

export default function BrowseContent() {
  const { dir, locale, t } = useI18n();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const subCategoryId = searchParams.get("subcategory");
  const subSubCategoryId = searchParams.get("subsubcategory");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState(t("browse.recommended"));
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "browse-products",
      {
        categoryId,
        subCategoryId,
        subSubCategoryId,
        minPriceParam,
        maxPriceParam,
        currentPage,
      },
    ],
    queryFn: () =>
      fetchBrowseProducts(
        categoryId,
        subCategoryId,
        subSubCategoryId,
        minPriceParam,
        maxPriceParam,
        currentPage,
      ),
  });

  const products = data?.items ?? [];

  const sortedProducts = [...products].sort((left: any, right: any) => {
    const leftPrice = Number(left?._numericPrice) || 0;
    const rightPrice = Number(right?._numericPrice) || 0;

    if (sortBy === t("browse.priceLowToHigh")) {
      return leftPrice - rightPrice;
    }

    if (sortBy === t("browse.priceHighToLow")) {
      return rightPrice - leftPrice;
    }

    return 0;
  });

  const isAllProductsMode = !categoryId && !subCategoryId;
  const totalPages = isAllProductsMode
    ? Math.max(1, data?.totalPages ?? 1)
    : Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const activePage = isAllProductsMode ? data?.currentPage ?? currentPage : currentPage;
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const currentProducts = isAllProductsMode
    ? sortedProducts
    : sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalItems = isAllProductsMode ? data?.totalItems ?? products.length : sortedProducts.length;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId, subCategoryId, subSubCategoryId, minPriceParam, maxPriceParam, sortBy]);

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
            ) : sortedProducts.length ? (
              <span>
                {t("browse.showingRange", {
                  start: startIndex + 1,
                  end: Math.min(startIndex + currentProducts.length, totalItems),
                  count: totalItems,
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
      {sortedProducts.length > 0 && totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={activePage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-600 hover:border-blue hover:text-blue transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all font-bold ${
                  activePage === i + 1
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
              disabled={activePage === totalPages}
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
