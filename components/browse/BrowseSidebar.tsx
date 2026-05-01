"use client";

import {
  Shirt,
  Monitor,
  Shield,
  Sparkles,
  Gem,
  Home,
  Footprints,
  Filter,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useI18n } from "@/components/LanguageProvider";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const CATEGORY_ICONS = [Shirt, Monitor, Shield, Sparkles, Gem, Home, Footprints];

async function fetchBrowseCategories(): Promise<Category[]> {
  const res = await api.get("/category");
  const data = res.data;

  const raw =
    data?.data?.items || data?.categories || (Array.isArray(data) ? data : []);

  return raw.map((cat: any, index: number) => {
    const IconComp = CATEGORY_ICONS[index % CATEGORY_ICONS.length];
    return {
      id: String(cat.id ?? cat._id ?? index),
      name: cat.name ?? "Category",
      icon: <IconComp className="h-5 w-5" />,
    };
  });
}

export default function BrowseSidebar() {
  const { dir, t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [minPrice, setMinPrice] = useState<string>(minPriceParam || "");
  const [maxPrice, setMaxPrice] = useState<string>(maxPriceParam || "");

  const { data: categories = [], isLoading } = useQuery({
    // Reuse the same key as home categories to share cache
    queryKey: ["home-categories"],
    queryFn: fetchBrowseCategories,
  });

  useEffect(() => {
    setSelectedCategory(categoryParam);
    setMinPrice(minPriceParam || "");
    setMaxPrice(maxPriceParam || "");
  }, [categoryParam, minPriceParam, maxPriceParam]);

  const handleCategoryClick = (id: string) => {
    const newId = selectedCategory === id ? null : id;
    setSelectedCategory(newId);
    
    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    if (newId) {
      params.set("category", newId);
    } else {
      params.delete("category");
    }
    router.push(`/browse?${params.toString()}`);
  };

  const handleApplyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    // Reset page when filters change
    params.delete("page");

    router.push(`/browse?${params.toString()}`);
  };

  return (
    <aside className="w-full lg:w-72 space-y-8" dir={dir}>
      {/* Categories */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="h-5 w-5 text-orange" />
          <h2 className="font-bold text-gray-900">{t("browse.categories")}</h2>
        </div>

        <nav className="space-y-1">
          {isLoading && !categories.length && (
            <div className="text-sm text-gray-500">{t("browse.loadingCategories")}</div>
          )}

          {!isLoading && !categories.length && (
            <div className="text-sm text-gray-500">{t("browse.noCategoriesFound")}</div>
          )}

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                selectedCategory === category.id 
                  ? "bg-blue text-white shadow-lg shadow-blue/20" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={selectedCategory === category.id ? "text-white" : "text-gray-400 group-hover:text-blue"}>
                  {category.icon}
                </span>
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${selectedCategory === category.id ? "rotate-90" : "group-hover:translate-x-1"}`} />
            </button>
          ))}
        </nav>
      </div>


      {/* Price Range */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-6">{t("browse.priceRange")}</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              placeholder={t("browse.min")} 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full h-10 px-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition-all"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="number" 
              placeholder={t("browse.max")} 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full h-10 px-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyPriceFilter}
            className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-orange transition-colors"
          >
            {t("browse.applyFilter")}
          </button>
        </div>
      </div>

      {/* Ratings removed as requested */}
    </aside>
  );
}
