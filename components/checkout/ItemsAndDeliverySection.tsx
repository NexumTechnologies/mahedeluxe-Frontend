"use client";

import { Package, X, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatAED } from "@/lib/utils";

interface ItemsAndDeliverySectionProps {
  isActive: boolean;
  onActivate: () => void;
  items: any[];
  isLoading?: boolean;
  onRemoveItem?: (item: any) => void;
  isRemoving?: boolean;
  mode?: "guest" | "account";
}

export default function ItemsAndDeliverySection({
  isActive,
  onActivate,
  items,
  isLoading,
  onRemoveItem,
  isRemoving,
  mode = "account",
}: ItemsAndDeliverySectionProps) {
  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isActive ? "bg-orange text-white" : "bg-gray-200 text-gray-500"
          }`}
        >
          <Package className="w-4 h-4" />
        </div>
          <h2 className="text-lg sm:text-xl font-semibold text-[#000000]">
          Items and delivery options
        </h2>
      </div>

      <div className="space-y-6">
        {/* Items list / states */}
        {isLoading ? (
          <p className="text-sm text-[#6B6B6B]">Loading items...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[#6B6B6B]">
            Your cart is empty. Add items to your cart to proceed with
            checkout.
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const product = item.Product || {};
              const rawImage = product.image_url as any;
              const imageSrc = Array.isArray(rawImage)
                ? rawImage[0]
                : rawImage || "/detail-product.jpg";
              const listing = (product as any).listing;
              const listingPrice =
                listing && listing.is_listed && listing.display_price != null
                  ? Number(listing.display_price)
                  : undefined;

              const safeQuantity = Number(item.quantity ?? 1) || 1;
              const baseUnit =
                typeof item.unit_price === "number" && !Number.isNaN(item.unit_price)
                  ? item.unit_price
                  : undefined;
              const fallbackUnit = (Number(item.total_price ?? 0) / safeQuantity) || 0;
              const unitPrice =
                typeof listingPrice === "number" && !Number.isNaN(listingPrice)
                  ? listingPrice
                  : typeof baseUnit === "number"
                    ? baseUnit
                    : fallbackUnit;

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-3 pb-3 border-b border-[#E0E0E0] last:border-0"
                >
                  <div className="relative shrink-0 self-start">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-[#F5F5F5]">
                      <Image
                        src={imageSrc}
                        alt={product.name || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute -top-1 -right-1 w-7 h-7 sm:w-9 sm:h-9 bg-orange rounded-full flex items-center justify-center shadow-md">
                      <span className="text-xs sm:text-sm text-white font-semibold">{safeQuantity}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#000000] mb-1 line-clamp-2">
                      {product.name || "Product"}
                    </p>
                    <div className="flex items-center gap-3 mb-2 text-sm">
                      <p className="font-medium">Qty ×{safeQuantity}</p>
                      <p className="text-[#6B6B6B]">Unit: {formatAED(Number(unitPrice) || 0)}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#000000]">
                          Line total: {formatAED(Number(item.total_price) || 0)}
                        </p>
                        <p className="mt-1 text-xs sm:text-[11px] text-slate-500">
                          {mode === "guest"
                            ? "Saved in this browser until you order or log in"
                            : "Saved to your account cart"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onActivate}
                          className="text-orange text-sm px-2"
                        >
                          Change
                        </Button>
                        <button
                          type="button"
                          onClick={() => !isRemoving && onRemoveItem?.(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E0E0E0] text-red-600 hover:bg-red-50"
                          aria-label="Remove product from cart"
                          disabled={isRemoving}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add note to supplier */}
        <div>
          <label className="block text-sm font-medium text-[#000000] mb-2">
            Add note to supplier
          </label>
          <textarea
            className="w-full h-24 px-4 py-3 border-2 border-[#E0E0E0] rounded-lg focus:outline-none focus:border-orange resize-none"
            placeholder="Enter your message..."
          />
        </div>
      </div>
    </div>
  );
}
