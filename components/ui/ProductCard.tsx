"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";
import { getSafeImageSrc } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  discountPrice: string;
  cutPrice?: string;
  rating?: number;
  reviews?: number;
  discount?: number;
  moq?: string;
  showFavorite?: boolean;
  showAddToCart?: boolean;
  className?: string;
}

export default function ProductCard({
  id,
  name,
  image,
  discountPrice,
  cutPrice,
  rating,
  reviews,
  discount,
  moq,
  showFavorite = true,
  showAddToCart = true,
  className = "",
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const safeImage = getSafeImageSrc(image);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Link
      href={`/products/${id}`}
      className={`group relative ${className}`}
    >
      <div className="relative h-full bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-blue transition-all duration-300 shadow-md hover:shadow-2xl group-hover:scale-[1.02]">
        {/* Discount Badge */}
        {discount && (
          <div className="absolute top-3 left-3 z-20">
            <div className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
              -{discount}%
            </div>
          </div>
        )}

        {/* Favorite Button */}
        {showFavorite && (
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all duration-300 hover:scale-110"
            aria-label="Add to favorites"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400 hover:text-red-500"
              }`}
            />
          </button>
        )}

        {/* Product Image Container */}
        <div className="relative w-full h-[180px] sm:h-[200px] lg:h-[240px] bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-hidden">
          <div className="absolute inset-0   transition-colors duration-300 z-10" />
          <Image
            src={safeImage}
            alt={name}
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Product Info */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Product Name and Rating */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-blue transition-colors line-clamp-2 min-h-[2.5rem]">
              {name}
            </h3>
            {rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-xs text-gray-900">
                    {rating}
                  </span>
                </div>
                {reviews && (
                  <span className="text-xs text-gray-500">
                    ({reviews.toLocaleString()})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-1 pt-2 border-t border-gray-100">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg sm:text-xl text-blue">
                {discountPrice}
              </span>
              {cutPrice && cutPrice !== discountPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {cutPrice}
                </span>
              )}
            </div>
            {moq && (
              <p className="text-xs text-gray-500 font-medium">
                {moq}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {showAddToCart && (
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
          )}
        </div>

        {/* Hover Overlay Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-300 pointer-events-none" />
      </div>
    </Link>
  );
}
