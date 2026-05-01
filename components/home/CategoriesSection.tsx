"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useI18n } from "@/components/LanguageProvider";
import {
  Shirt,
  Monitor,
  Shield,
  Sparkles,
  Gem,
  Home,
  Footprints,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count?: string;
}

interface TrendingSearch {
  id: string;
  term: string;
  image: string;
  badge?: string;
}
// Icons pool used to decorate categories coming from the API
const CATEGORY_ICONS = [Shirt, Monitor, Shield, Sparkles, Gem, Home, Footprints];

const trendingSearches: TrendingSearch[] = [
  {
    id: "1",
    term: "Electric Vehicles",
    image: "/category-image-1.png",
    badge: "Hot",
  },
  {
    id: "2",
    term: "Smart Home Devices",
    image: "/category-image-2.png",
    badge: "New",
  },
  {
    id: "3",
    term: "Fitness Equipment",
    image: "/category-image-3.png",
  },
];

async function fetchHomeCategories(): Promise<Category[]> {
  const res = await api.get(`/category`);
  const data = res.data;

  const raw = data && data.data && Array.isArray(data.data.items)
    ? data.data.items
    : data && Array.isArray(data.categories)
    ? data.categories
    : Array.isArray(data)
    ? data
    : [];

  const mapped: Category[] = raw.map((cat: any, index: number) => {
    const IconComp = CATEGORY_ICONS[index % CATEGORY_ICONS.length];
    return {
      id: String(cat._id ?? cat.id ?? index),
      name: cat.name ?? "Category",
      icon: <IconComp className="h-6 w-6" />,
    };
  });

  return mapped;
}

export default function CategoriesSection() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { dir, t } = useI18n();
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["home-categories"],
    queryFn: fetchHomeCategories,
  });

  return (
    <section className="w-full bg-linear-to-b from-white to-gray-50 py-12 sm:py-16 lg:py-20" dir={dir}>
      <div className="w-full max-w-350 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 lg:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
            <TrendingUp className="h-4 w-4 text-blue" />
            <span className="text-sm font-semibold text-blue">
              {t("home.categoriesBadge")}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("home.categoriesTitlePrefix")} <span className="text-orange">{t("home.categoriesTitleHighlight")}</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("home.categoriesDescription")}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 lg:mb-16">
          {isLoading && categories.length === 0 && (
            <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center text-gray-500">
              {t("home.loadingCategories")}
            </div>
          )}

          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/browse?category=${category.id}`}
              className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue overflow-hidden"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Background Gradient on Hover */}
              <div
                className={`absolute inset-0 bg-linear-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    hoveredCategory === category.id
                      ? "bg-linear-to-br from-blue to-blue-200 text-white scale-110"
                      : "bg-blue-100 text-blue"
                  }`}
                >
                  {category.icon}
                </div>

                {/* Category Name */}
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue transition-colors text-base lg:text-lg">
                  {category.name}
                </h3>

                {/* Product Count */}
                {category.count && (
                  <p className="text-sm text-gray-500 mb-3">
                    {category.count} {t("home.productsLabel")}
                  </p>
                )}

                {/* Arrow Icon */}
                <div className="flex items-center gap-2 text-blue opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">{t("home.explore")}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Trending Searches Section */}
        <div className="relative">
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-purple-50 rounded-3xl opacity-50" />
          
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 sm:p-10 lg:p-12 shadow-xl">
            {/* Header */}
            {/* <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 lg:mb-10 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-orange to-orange-200 rounded-full" />
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    <span className="text-orange">Trending</span> Searches
                  </h3>
                </div>
                <p className="text-gray-600 text-base sm:text-lg ml-4">
                  Discover what buyers are searching for right now
                </p>
              </div>
              <Link
                href="/browse"
                className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange to-orange-300 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                View All
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div> */}

            {/* Trending Cards Grid */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {trendingSearches.map((search, index) => (
                <Link
                  key={search.id}
                  href={`/products/${search.id}`}
                  className="group relative"
                >
                
                  <div className="relative h-full bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:border-blue">
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-purple-100/0 group-hover:from-white group-hover:to-blue-50 transition-all duration-500 z-0" />
                    
                   
                    {search.badge && (
                      <div className="absolute top-4 right-4 z-20">
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
                            search.badge === "Hot"
                              ? "bg-gradient-to-r from-orange-300 to-orange text-white animate-pulse"
                              : "bg-gradient-to-r from-blue-300 to-blue text-white"
                          }`}
                        >
                          {search.badge}
                        </span>
                      </div>
                    )}

                   
                    <div className="relative z-10 p-6 lg:p-8">
                     
                      <div className="relative w-full h-56 lg:h-64 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 group-hover:from-purple-50 group-hover:to-blue-100 transition-all duration-500 shadow-inner">
                        <div className="absolute inset-0  transition-colors duration-500 z-10" />
                        <Image
                          src={search.image}
                          alt={search.term}
                          fill
                          className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                     
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xl lg:text-2xl text-gray-900 group-hover:text-blue transition-colors duration-300">
                          {search.term}
                        </h4>
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-blue-200 transition-all duration-300 group-hover:scale-110">
                          <ArrowRight className="h-5 w-5 text-blue group-hover:text-blue group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    </div>

                   
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </div>
                </Link> 
              ))}
            </div> */}

            {/* Mobile View All Link */}
            <Link
              href="/browse"
              className="sm:hidden flex items-center justify-center gap-2 mt-8 px-6 py-3 bg-linear-to-r from-blue to-blue-200 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              {t("home.viewAllCategories")}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
