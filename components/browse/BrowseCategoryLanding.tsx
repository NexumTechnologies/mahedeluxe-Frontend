"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";
import api from "@/lib/axios";
import ProductCard from "@/components/ui/ProductCard";
import { getSafeImageFromValue, getSafeImageSrc } from "@/lib/utils";
import { useI18n } from "@/components/LanguageProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 12;

type BrowseCategoryLandingProps = {
  categoryId: string;
};

type CategoryRecord = {
  id?: number | string;
  name?: string;
};

type SubCategoryRecord = {
  id?: number | string;
  name?: string;
  description?: string | null;
  image_url?: string | null;
  Category?: CategoryRecord;
};

type ProductRecord = Record<string, any>;

async function fetchCategoryPageData(categoryId: string) {
  const [subcategoriesRes, categoriesRes, productsRes] = await Promise.all([
    api.get("/subcategory", {
      params: { category_id: categoryId, is_active: true },
    }),
    api.get("/category"),
    api.get(`/product/category/${categoryId}`),
  ]);

  const subcategories =
    subcategoriesRes.data?.data?.items ||
    subcategoriesRes.data?.subcategories ||
    (Array.isArray(subcategoriesRes.data) ? subcategoriesRes.data : []);

  const categories =
    categoriesRes.data?.data?.items ||
    categoriesRes.data?.categories ||
    (Array.isArray(categoriesRes.data) ? categoriesRes.data : []);

  const rawProducts =
    productsRes.data?.data?.items ||
    productsRes.data?.products ||
    productsRes.data?.data ||
    productsRes.data?.items ||
    productsRes.data ||
    [];

  const category = categories.find(
    (item: Record<string, unknown>) => String(item.id ?? item._id ?? "") === categoryId,
  );

  const products = (Array.isArray(rawProducts) ? rawProducts : []).map((product: ProductRecord) => {
    const image = getSafeImageFromValue(product.image_url, "/dummy-product.png");
    const basePrice = Number(product.price) || 0;
    const customerPriceRaw =
      product && product.customer_price != null ? Number(product.customer_price) : null;
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
      discountPriceAmount: listingPrice || basePrice,
      cutPrice: undefined,
      _numericPrice: listingPrice || basePrice,
    };
  });

  return {
    categoryName: String(category?.name ?? "Category"),
    subcategories: Array.isArray(subcategories) ? subcategories : [],
    products,
  };
}

export default function BrowseCategoryLanding({
  categoryId,
}: BrowseCategoryLandingProps) {
  const { dir, locale, t } = useI18n();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState(t("browse.recommended"));
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["browse-category-landing", categoryId],
    queryFn: () => fetchCategoryPageData(categoryId),
  });

  const categoryName = data?.categoryName || "Category";
  const subcategories = (data?.subcategories || []) as SubCategoryRecord[];
  const products = (data?.products || []) as ProductRecord[];

  const sortOptions = [
    t("browse.recommended"),
    t("browse.latest"),
    t("browse.priceLowToHigh"),
    t("browse.priceHighToLow"),
    t("browse.rating"),
  ];

  const sortedProducts = [...products].sort((left: any, right: any) => {
    const leftPrice = Number(left?._numericPrice) || 0;
    const rightPrice = Number(right?._numericPrice) || 0;

    if (sortBy === t("browse.priceLowToHigh")) return leftPrice - rightPrice;
    if (sortBy === t("browse.priceHighToLow")) return rightPrice - leftPrice;

    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setSortBy(t("browse.recommended"));
  }, [locale, t]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId, sortBy]);

  return (
    <div className="space-y-6" dir={dir}>
      <section className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange">
              Subcategories
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {categoryName}
            </h2>
          </div>
        </div>

        {isLoading && (
          <div className="text-sm text-slate-500">Loading subcategories...</div>
        )}

        {!isLoading && !error && !subcategories.length && (
          <div className="text-sm text-slate-500">No subcategories found.</div>
        )}

        {!isLoading && !error && subcategories.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {subcategories.map((subCategory) => (
              <Link
                key={String(subCategory.id ?? "")}
                href={`/browse/subcategory/${subCategory.id}?category=${categoryId}`}
                className="group min-w-[148px] max-w-[148px] shrink-0"
              >
                <div className="overflow-hidden rounded-[1.6rem] border border-gray-100 bg-[#f8fafc] p-3 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                  <div className="mb-3 aspect-square overflow-hidden rounded-[1.2rem] bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getSafeImageSrc(subCategory.image_url, "/dummy-product.png")}
                      alt={String(subCategory.name ?? "Subcategory")}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="line-clamp-2 text-center text-sm font-semibold leading-5 text-slate-800">
                    {subCategory.name || "Subcategory"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          {isLoading ? (
            t("browse.loadingProducts")
          ) : error ? (
            t("browse.failedToLoadProducts")
          ) : sortedProducts.length ? (
            <span>
              {t("browse.showingRange", {
                start: startIndex + 1,
                end: Math.min(startIndex + ITEMS_PER_PAGE, sortedProducts.length),
                count: sortedProducts.length,
              })}
            </span>
          ) : (
            t("browse.noProductsFound")
          )}
        </p>

        <div className="flex items-center gap-6">
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

      {sortedProducts.length > 0 && totalPages > 1 && (
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
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
