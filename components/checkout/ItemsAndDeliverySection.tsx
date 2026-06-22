/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Package, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/LanguageProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import { formatPriceFromAED } from "@/lib/currency";

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
  const { dir, locale, t } = useI18n();
  const { currency, rates } = useCurrency();

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm sm:p-6" dir={dir}>
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            isActive ? "bg-orange text-white" : "bg-gray-200 text-gray-500"
          }`}
        >
          <Package className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-semibold text-[#000000] sm:text-xl">
          {t("checkout.itemsAndDelivery")}
        </h2>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <p className="text-sm text-[#6B6B6B]">{t("browse.loadingProducts")}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[#6B6B6B]">{t("checkout.yourCartEmpty")}</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const product = item.Product || {};
              const rawImage = product.image_url as any;
              const imageSrc = Array.isArray(rawImage)
                ? rawImage[0]
                : rawImage || "/detail-product.jpg";
              const listing = product.listing as any;
              const listingPrice =
                listing && listing.is_listed && listing.display_price != null
                  ? Number(listing.display_price)
                  : undefined;
              const safeQuantity = Number(item.quantity ?? 1) || 1;
              const selectedSize = item.selected_size || product.selected_size || null;
              const baseUnit =
                typeof item.unit_price === "number" && !Number.isNaN(item.unit_price)
                  ? item.unit_price
                  : undefined;
              const fallbackUnit = Number(item.total_price ?? 0) / safeQuantity || 0;
              const unitPrice =
                typeof baseUnit === "number"
                  ? baseUnit
                  : typeof listingPrice === "number" && !Number.isNaN(listingPrice)
                    ? listingPrice
                    : fallbackUnit;

              return (
                <div
                  key={`${item.id || item.product_id}-${selectedSize || "default"}`}
                  className="flex flex-col gap-3 border-b border-[#E0E0E0] pb-3 last:border-0 sm:flex-row"
                >
                  <div className="relative shrink-0 self-start">
                    <div className="h-20 w-20 overflow-hidden rounded-lg bg-[#F5F5F5] sm:h-24 sm:w-24">
                      <Image
                        src={imageSrc}
                        alt={product.name || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-orange shadow-md sm:h-9 sm:w-9">
                      <span className="text-xs font-semibold text-white sm:text-sm">
                        {safeQuantity}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 line-clamp-2 text-sm font-medium text-[#000000]">
                      {product.name || t("checkout.productFallback")}
                    </p>
                    <div className="mb-2 flex flex-wrap items-center gap-3 text-sm">
                      <p className="font-medium">{`Qty x${safeQuantity}`}</p>
                      {selectedSize && (
                        <p className="text-[#6B6B6B]">{`Size: ${selectedSize}`}</p>
                      )}
                      <p className="text-[#6B6B6B]">
                        {t("checkout.unit")}: {formatPriceFromAED(Number(unitPrice) || 0, currency, rates, locale)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#000000]">
                          {t("checkout.lineTotal")}: {formatPriceFromAED(Number(item.total_price) || 0, currency, rates, locale)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 sm:text-[11px]">
                          {mode === "guest"
                            ? t("checkout.savedInBrowser")
                            : t("checkout.savedToAccount")}
                        </p>
                      </div>

                      <div className="mt-2 flex items-center gap-2 sm:ml-4 sm:mt-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onActivate}
                          className="px-2 text-sm text-orange"
                        >
                          {t("checkout.change")}
                        </Button>
                        <button
                          type="button"
                          onClick={() => !isRemoving && onRemoveItem?.(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E0E0E0] text-red-600 hover:bg-red-50"
                          aria-label={t("checkout.removeFromCart")}
                          disabled={isRemoving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-[#000000]">
            {t("checkout.addNoteToSupplier")}
          </label>
          <textarea
            className="h-24 w-full resize-none rounded-lg border-2 border-[#E0E0E0] px-4 py-3 focus:border-orange focus:outline-none"
            placeholder={t("checkout.enterYourMessage")}
          />
        </div>
      </div>
    </div>
  );
}
