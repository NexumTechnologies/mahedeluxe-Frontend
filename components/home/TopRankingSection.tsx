"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { getSafeImageFromValue } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Star, Award, ArrowRight, TrendingUp } from "lucide-react";

interface Product {
  id: string;
  image: string;
  name: string;
  category: string;
  rating?: number;
  reviews?: number;
}

//========================= API CALLS ==========================//
//==============================================================//
async function fetchTopRanking(): Promise<Product[]> {
  const res = await api.get("/product/public/listed", { params: { limit: 10 } });
  const data = res.data;
  const items: any[] =
    data?.data?.items || data?.data || data?.products || data?.items || data || [];

  return items.map((product: any) => {
    const image = getSafeImageFromValue(product.image_url, "/top-ranking-1.png");
    const name = product.name || "Product";
    const categoryName = product.Category?.name || "Listed product";

    return {
      id: String(product.id),
      image,
      name,
      category: categoryName,
    } as Product;
  });
}

export default function TopRankingSection() {
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: ["home-listed-products", "top-ranking"],
    queryFn: fetchTopRanking,
  });

  const visibleCards = 5; // Number of cards visible at a time

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : products.length - visibleCards
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < products.length - visibleCards ? prevIndex + 1 : 0
    );
  };

  return (
    <section className="w-full bg-gradient-to-b from-white via-blue-50/20 to-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange to-orange-300 flex items-center justify-center shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                    Best Sellers
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className="h-4 w-4 text-orange" />
                    <span className="text-sm font-medium text-orange">
                      Top-Rated Products
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-lg text-gray-600 ml-16">
                Premium products from trusted vendors with exceptional ratings
              </p>
            </div>

            <Link
              href="/best-sellers"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange to-orange-300 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 whitespace-nowrap"
            >
              View More
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Products Container */}
        <div className="relative">
          {/* Background Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-blue-100/50">
            {/* Product Grid/Carousel */}
            <div
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isLoading && (
                <div className="py-8 text-center text-sm text-gray-500">
                  Loading top ranking products...
                </div>
              )}
              {!isLoading && error && (
                <div className="py-8 text-center text-sm text-red-500">
                  Failed to load top ranking products.
                </div>
              )}
              {!isLoading && !error && products.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-500">
                  No listed products available yet.
                </div>
              )}

              {products.length > 0 && (
                <div className="flex gap-4 sm:gap-6 overflow-x-auto lg:overflow-hidden scrollbar-hide pb-4">
                  {products
                    .slice(currentIndex, currentIndex + visibleCards)
                    .map((product, index) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group shrink-0 w-[200px] sm:w-[220px] lg:w-[240px]"
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      <div className="relative h-full bg-gradient-to-br from-white to-purple-50/30 rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-blue transition-all duration-300 shadow-md hover:shadow-2xl group-hover:scale-105">
                        {/* TOP Badge - Redesigned */}
                        <div className="absolute top-3 right-3 z-20">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue to-blue-300 rounded-lg rotate-12 opacity-75 blur-sm" />
                            <div className="relative px-3 py-1.5 bg-gradient-to-r from-blue to-blue-300 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              <span>TOP</span>
                            </div>
                          </div>
                        </div>

                        {/* Rank Badge */}
                        <div className="absolute top-3 left-3 z-20">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                            #{index + 1 + currentIndex}
                          </div>
                        </div>

                        {/* Product Image Container */}
                        <div className="relative w-full h-[200px] sm:h-[220px] lg:h-[240px] bg-gradient-to-br from-gray-50 to-blue-50/50 overflow-hidden mt-8">
                          <div className="absolute inset-0   transition-colors duration-300 z-10" />
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="p-4 sm:p-5 space-y-3">
                          {/* Product Name & Category */}
                          <div className="space-y-1">
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-sm font-medium text-gray-500">
                              {product.category}
                            </p>
                          </div>

                          {/* Rating */}
                          {product.rating && (
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold text-sm text-gray-900">
                                  {product.rating}
                                </span>
                              </div>
                              {product.reviews && (
                                <span className="text-xs text-gray-500">
                                  ({product.reviews.toLocaleString()} reviews)
                                </span>
                              )}
                            </div>
                          )}

                          {/* View Button */}
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1 text-blue opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs font-semibold">View Details</span>
                              <ChevronRight className="h-4 w-4" />
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.floor(product.rating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-gray-200 text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Hover Overlay Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-300 pointer-events-none" />
                      </div>
                    </Link>
                    ))}
                  </div>
                  )}

              {/* Navigation Arrows */}
              {isHovered && products.length > visibleCards && (
                <>
                  <button
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-purple-50 rounded-full p-3 shadow-xl border-2 border-purple-100 hover:border-[#7c3aed] transition-all duration-300 cursor-pointer z-20 group/btn"
                    onClick={handlePrev}
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-700 group-hover/btn:text-[#7c3aed] transition-colors" />
                  </button>
                  <button
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-purple-50 rounded-full p-3 shadow-xl border-2 border-purple-100 hover:border-[#7c3aed] transition-all duration-300 cursor-pointer z-20 group/btn"
                    onClick={handleNext}
                    aria-label="Next"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-700 group-hover/btn:text-[#7c3aed] transition-colors" />
                  </button>
                </>
              )}
            </div>

            {/* Progress Indicator */}
            {products.length > visibleCards && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {Array.from({ length: Math.ceil(products.length / visibleCards) }).map(
                  (_, index) => (
                    <button
                      key={index}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        Math.floor(currentIndex / visibleCards) === index
                          ? "w-8 bg-gradient-to-r from-[#7c3aed] to-[#a78bfa]"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                      onClick={() => setCurrentIndex(index * visibleCards)}
                      aria-label={`Go to page ${index + 1}`}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
