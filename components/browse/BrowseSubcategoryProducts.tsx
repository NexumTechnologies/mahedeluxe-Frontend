"use client";

import ProductCard from "@/components/ui/ProductCard";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";
import Link from "next/link";
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

type BrowseSubcategoryProductsProps = {
  subcategoryId: string;
};

type ProductRecord = Record<string, any>;
type SubSubCategoryRecord = Record<string, any>;

async function fetchSubcategoryPageData(subcategoryId: string) {
  const [subCategoryRes, subSubCategoriesRes, productsRes] = await Promise.all([
    api.get(`/subcategory/${subcategoryId}`),
    api.get("/sub-subcategory", {
      params: { sub_category_id: subcategoryId, is_active: true },
    }),
    api.get(`/product/subcategory/${subcategoryId}`),
  ]);

  const subCategory =
    subCategoryRes.data?.data ||
    subCategoryRes.data?.subcategory ||
    subCategoryRes.data ||
    null;

  const subSubCategories =
    subSubCategoriesRes.data?.data?.items ||
    subSubCategoriesRes.data?.subSubCategories ||
    (Array.isArray(subSubCategoriesRes.data) ? subSubCategoriesRes.data : []);

  const rawProducts =
    productsRes.data?.data?.items ||
    productsRes.data?.products ||
    productsRes.data?.data ||
    productsRes.data?.items ||
    productsRes.data ||
    [];

  const products = (Array.isArray(rawProducts) ? rawProducts : []).map((product: ProductRecord) => {
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
      discountPriceAmount: listingPrice || basePrice,
      cutPrice: undefined,
      _numericPrice: listingPrice || basePrice,
      _subSubCategoryId: String(product.sub_sub_category_id ?? product.SubSubCategory?.id ?? ""),
    };
  });

  return {
    subCategory,
    subSubCategories: Array.isArray(subSubCategories) ? subSubCategories : [],
    products,
  };
}

export default function BrowseSubcategoryProducts({
  subcategoryId,
}: BrowseSubcategoryProductsProps) {
  const { dir, locale, t } = useI18n();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const selectedSubSubCategoryId = searchParams.get("subsubcategory");

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState(t("browse.recommended"));
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["browse-subcategory-page", subcategoryId],
    queryFn: () => fetchSubcategoryPageData(subcategoryId),
  });

  const subCategoryName = String(data?.subCategory?.name ?? "Subcategory");
  const parentCategoryName = String(
    data?.subCategory?.Category?.name ?? data?.subCategory?.category?.name ?? "Category",
  );
  const subSubCategories = (data?.subSubCategories || []) as SubSubCategoryRecord[];
  const products = (data?.products || []) as ProductRecord[];

  const filteredProducts = products.filter((product) => {
    if (!selectedSubSubCategoryId) return true;
    return String(product._subSubCategoryId || "") === String(selectedSubSubCategoryId);
  });

  const sortOptions = [
    t("browse.recommended"),
    t("browse.latest"),
    t("browse.priceLowToHigh"),
    t("browse.priceHighToLow"),
    t("browse.rating"),
  ];

  const sortedProducts = [...filteredProducts].sort((left: any, right: any) => {
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
  }, [selectedSubSubCategoryId, sortBy]);

  return (
    <div className="space-y-8" dir={dir}>
      <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Link href="/browse" className="hover:text-blue">
                Browse
              </Link>
              <span>/</span>
              {categoryId ? (
                <Link href={`/browse?category=${categoryId}`} className="hover:text-blue">
                  {parentCategoryName}
                </Link>
              ) : (
                <span>{parentCategoryName}</span>
              )}
              <span>/</span>
              <span className="font-semibold text-slate-900">{subCategoryName}</span>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange">
                Browse by Sub-subcategory
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {subCategoryName}
              </h1>
              <p className="mt-2 text-base text-slate-600 sm:text-lg">
                Select a sub-subcategory to narrow products, or keep all products from this subcategory.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">Sub-subcategories</h2>
        </div>

        {isLoading && (
          <div className="text-sm text-slate-500">Loading sub-subcategories...</div>
        )}

        {!isLoading && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            <Link
              href={
                categoryId
                  ? `/browse/subcategory/${subcategoryId}?category=${categoryId}`
                  : `/browse/subcategory/${subcategoryId}`
              }
              className={`min-w-[148px] max-w-[148px] shrink-0 rounded-[1.6rem] border p-3 text-sm font-medium transition ${
                !selectedSubSubCategoryId
                  ? "border-blue bg-blue text-white"
                  : "border-gray-100 bg-[#f8fafc] text-slate-700 hover:border-blue hover:text-blue"
              }`}
            >
              <div className={`mb-3 aspect-square rounded-[1.2rem] ${!selectedSubSubCategoryId ? "bg-white/15" : "bg-white"} flex items-center justify-center text-center px-3`}>
                <span className={`text-base font-bold ${!selectedSubSubCategoryId ? "text-white" : "text-slate-800"}`}>
                  All
                </span>
              </div>
              <div className="text-center text-sm font-semibold leading-5">
                All products
              </div>
            </Link>

            {subSubCategories.map((item) => {
              const href = categoryId
                ? `/browse/subcategory/${subcategoryId}?category=${categoryId}&subsubcategory=${item.id}`
                : `/browse/subcategory/${subcategoryId}?subsubcategory=${item.id}`;

              return (
                <Link
                  key={String(item.id ?? "")}
                  href={href}
                  className={`min-w-[148px] max-w-[148px] shrink-0 rounded-[1.6rem] border p-3 text-sm font-medium transition ${
                    String(selectedSubSubCategoryId || "") === String(item.id ?? "")
                      ? "border-blue bg-blue text-white"
                      : "border-gray-100 bg-[#f8fafc] text-slate-700 hover:border-blue hover:text-blue"
                  }`}
                >
                  <div className={`mb-3 aspect-square rounded-[1.2rem] ${
                    String(selectedSubSubCategoryId || "") === String(item.id ?? "")
                      ? "bg-white/15"
                      : "bg-white"
                  } flex items-center justify-center text-center px-3`}>
                    <span
                      className={`line-clamp-3 text-base font-bold ${
                        String(selectedSubSubCategoryId || "") === String(item.id ?? "")
                          ? "text-white"
                          : "text-slate-800"
                      }`}
                    >
                      {String(item.name ?? "Sub-subcategory").slice(0, 28)}
                    </span>
                  </div>
                  <div className="line-clamp-2 text-center text-sm font-semibold leading-5">
                    {String(item.name ?? "Sub-subcategory")}
                  </div>
                </Link>
              );
            })}
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
