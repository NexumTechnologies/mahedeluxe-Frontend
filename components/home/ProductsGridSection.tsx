"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { getSafeImageFromValue } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  rating: number;
  discountPrice: string;
  cutPrice: string;
  image: string;
  reviews?: number;
  discount?: number;
}

async function fetchFeaturedProducts(): Promise<Product[]> {
  const res = await api.get("/product/public/listed", { params: { limit: 12 } });
  const data = res.data;
  const items: any[] =
    data?.data?.items || data?.data || data?.products || data?.items || data || [];

  return items.map((product: any) => {
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

    const discountPrice = `${listingPrice} AED`;
    const cutPrice = discountPrice;

    return {
      id: String(product.id),
      name,
      rating: 0,
      discountPrice,
      cutPrice,
      image,
    } as Product;
  });
}

export default function ProductsGridSection() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: ["home-listed-products", "featured"],
    queryFn: fetchFeaturedProducts,
  });

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
    <section className="w-full bg-gradient-to-b from-gray-50 via-blue-50/20 to-white py-12 sm:py-16 lg:py-20">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange to-orange-300 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                    Featured Products
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-600">
                      Handpicked for You
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-lg text-gray-600 ml-16">
                Discover our curated selection of premium products
              </p>
            </div>

            <Link
              href="/browse"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange to-orange-300 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 whitespace-nowrap"
            >
              View All Products
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading && (
          <div className="py-8 text-center text-sm text-gray-500">
            Loading featured products...
          </div>
        )}
        {!isLoading && error && (
          <div className="py-8 text-center text-sm text-red-500">
            Failed to load featured products.
          </div>
        )}
        {!isLoading && !error && products.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            No listed products available yet.
          </div>
        )}

        {products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group relative"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div className="relative h-full bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-blue transition-all duration-300 shadow-md hover:shadow-2xl group-hover:scale-[1.02]">
                {/* Discount Badge */}
                {product.discount && (
                  <div className="absolute top-3 left-3 z-20">
                    <div className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                      -{product.discount}%
                    </div>
                  </div>
                )}

                {/* Favorite Button */}
                <button
                  onClick={(e) => toggleFavorite(product.id, e)}
                  className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all duration-300 hover:scale-110"
                  aria-label="Add to favorites"
                >
                  <Heart
                    className={`h-4 w-4 transition-colors ${
                      favorites.has(product.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  />
                </button>

                {/* Product Image Container */}
                <div className="relative w-full h-[180px] sm:h-[200px] lg:h-[240px] bg-gradient-to-br from-gray-50 to-purple-50/30 overflow-hidden">
                  <div className="absolute inset-0  transition-colors duration-300 z-10" />
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Product Info */}
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Product Name and Rating */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-blue transition-colors line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-xs text-gray-900">
                          {product.rating}
                        </span>
                      </div>
                      {product.reviews && (
                        <span className="text-xs text-gray-500">
                          ({product.reviews.toLocaleString()})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-1 pt-2 border-t border-gray-100">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-lg sm:text-xl text-blue">
                        {product.discountPrice}
                      </span>
                      {product.cutPrice !== product.discountPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {product.cutPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue to-blue-300 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>

                {/* Hover Overlay Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-300 pointer-events-none" />
              </div>
            </Link>
            ))}
          </div>
        )}

        {/* View More Link (Mobile) */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href="/browse"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue to-blue-300 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            View All Products
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
