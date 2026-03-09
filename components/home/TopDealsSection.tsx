"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { getSafeImageFromValue } from "@/lib/utils";
import {
  ChevronRight,
  ChevronLeft,
  Zap,
  Clock,
  ArrowRight,
} from "lucide-react";

interface Product {
  id: string;
  image: string;
  salePrice: string;
  cutPrice: string;
  moq: string;
  discount?: number;
}
async function fetchTopDeals(): Promise<Product[]> {
  const res = await api.get("/product/public/listed", { params: { limit: 10 } });
  const data = res.data;
  const items: any[] =
    data?.data?.items || data?.data || data?.products || data?.items || data || [];

  return items.map((product: any) => {
    const image = getSafeImageFromValue(product.image_url, "/top-deals-1.png");

    const basePrice = Number(product.price) || 0;
    const customerPriceRaw =
      product && product.customer_price != null
        ? Number(product.customer_price)
        : null;
    const saleNumeric =
      customerPriceRaw != null && !Number.isNaN(customerPriceRaw)
        ? customerPriceRaw
        : basePrice;

    const salePrice = `${saleNumeric} AED`;
    const cutPrice = salePrice; // avoid showing a fake discount for now

    return {
      id: String(product.id),
      image,
      salePrice,
      cutPrice,
      moq: "MOQ: 1",
    } as Product;
  });
}

export default function TopDealsSection() {
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: ["home-listed-products", "top-deals"],
    queryFn: fetchTopDeals,
  });

  const visibleCards = 5; // Number of cards visible at a time

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : products.length - visibleCards,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < products.length - visibleCards ? prevIndex + 1 : 0,
    );
  };

  return (
    <section className="w-full bg-gradient-to-b from-gray-50 via-purple-50/30 to-white py-12 sm:py-16 lg:py-20">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange to-orange-300 flex items-center justify-center shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                    Flash Sales
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-600">
                      Limited Time Only
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-lg text-gray-600 ml-16">
                Exclusive deals from verified vendors - Don't miss out!
              </p>
            </div>

            <Link
              href="/flash-sales"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange to-orange-300 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 whitespace-nowrap"
            >
              View All Sales
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Products Container */}
        <div className="relative">
          {/* Background Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-orange-100/50">
            {/* Product Grid/Carousel */}
            <div
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isLoading && (
                <div className="py-8 text-center text-sm text-gray-500">
                  Loading top deals...
                </div>
              )}
              {!isLoading && error && (
                <div className="py-8 text-center text-sm text-red-500">
                  Failed to load top deals.
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
                    .map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group shrink-0 w-[200px] sm:w-[220px] lg:w-[240px]"
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      <div className="relative h-full bg-gradient-to-br from-white to-blue-50 rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-blue transition-all duration-300 shadow-md hover:shadow-2xl group-hover:scale-105">
                        {/* Discount Badge */}
                        {product.discount && (
                          <div className="absolute top-3 left-3 z-20">
                            <div className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                              <span>🔥</span>
                              <span>{product.discount}% OFF</span>
                            </div>
                          </div>
                        )}

                        {/* Flash Badge */}
                        <div className="absolute top-3 right-3 z-20">
                          <div className="px-2.5 py-1 bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white text-[10px] font-bold rounded-full shadow-md">
                            FLASH
                          </div>
                        </div>

                        {/* Product Image Container */}
                        <div className="relative w-full h-[200px] sm:h-[220px] lg:h-[240px] bg-gradient-to-br from-gray-50 to-blue-50/50 overflow-hidden">
                          <div className="absolute inset-0  transition-colors duration-300 z-10" />
                          <Image
                            src={product.image}
                            alt={`Product ${product.id}`}
                            fill
                            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="p-4 sm:p-5 space-y-3">
                          {/* Pricing */}
                          <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl sm:text-2xl font-bold text-blue">
                                {product.salePrice}
                              </span>
                              {product.cutPrice !== product.salePrice && (
                                <span className="text-sm text-gray-400 line-through">
                                  {product.cutPrice}
                                </span>
                              )}
                            </div>
                            {product.discount && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-medium text-orange bg-green-50 px-2 py-0.5 rounded">
                                  Save {product.discount}%
                                </span>
                              </div>
                            )}
                          </div>

                          {/* MOQ */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="text-xs sm:text-sm font-medium text-gray-600">
                              {product.moq}
                            </span>
                            <div className="flex items-center gap-1 text-blue opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs font-semibold">
                                View
                              </span>
                              <ChevronRight className="h-4 w-4" />
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
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-blue-50 rounded-full p-3 shadow-xl border-2 border-blue-100 hover:border-blue transition-all duration-300 cursor-pointer z-20 group/btn"
                    onClick={handlePrev}
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-700 group-hover/btn:text-blue transition-colors" />
                  </button>
                  <button
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-blue-50 rounded-full p-3 shadow-xl border-2 border-blue-100 hover:border-blue transition-all duration-300 cursor-pointer z-20 group/btn"
                    onClick={handleNext}
                    aria-label="Next"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-700 group-hover/btn:text-blue transition-colors" />
                  </button>
                </>
              )}
            </div>

            {/* Progress Indicator */}
            {products.length > visibleCards && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {Array.from({
                  length: Math.ceil(products.length / visibleCards),
                }).map((_, index) => (
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
