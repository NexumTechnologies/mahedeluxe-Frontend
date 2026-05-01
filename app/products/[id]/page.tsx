"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { addGuestCartItem, hasStoredAuth } from "@/lib/cartStorage";
import CartDrawer from "@/components/cart/CartDrawer";
import { useI18n } from "@/components/LanguageProvider";

export default function ProductDetailPage() {
  const { dir, t } = useI18n();
  const { id } = useParams();
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [toast, setToast] = useState<{ show: boolean; message: string } | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [isSavingGuest, setIsSavingGuest] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["product-detail", id],
    queryFn: async () => {
      const res = await api.get(`/product/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({
      product_id,
      quantity,
    }: {
      product_id: number;
      quantity: number;
    }) => {
      const res = await api.post("/addToCart", { product_id, quantity });
      return res.data;
    },
    onSuccess: (res) => {
      setToast({
        show: true,
        message: res?.message || t("product.addedToCart"),
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("open-cart-drawer"));
      }
      setTimeout(() => setToast(null), 1000);
    },
    onError: (err: any) => {
      // If backend reports unauthorized, redirect to login.
      if (err?.response?.status === 401) {
        router.push("/auth/signin");
        return;
      }
      setToast({
        show: true,
        message: err?.response?.data?.message || t("product.failedToAddToCart"),
      });
      setTimeout(() => setToast(null), 1000);
    },
  });

  const product = data?.data || data?.product || data || null;

  const userRole = (() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { role?: string };
      return parsed?.role ?? null;
    } catch {
      return null;
    }
  })();

  const moq =
    product && product.min_order_quantity != null
      ? Math.max(1, Math.floor(Number(product.min_order_quantity) || 1))
      : 1;
  const minAllowedQty = userRole === "buyer" ? moq : 1;
  const effectiveQuantity = Math.max(
    minAllowedQty,
    Math.floor(Number(quantity) || minAllowedQty),
  );

  const basePrice = product ? Number(product.price) || 0 : 0;
  const customerPriceRaw =
    product && product.customer_price != null
      ? Number(product.customer_price)
      : null;
  const listingPrice =
    (customerPriceRaw != null && !Number.isNaN(customerPriceRaw)
      ? customerPriceRaw
      : null) ??
    (product && product.listing && product.listing.display_price != null
      ? Number(product.listing.display_price)
      : basePrice);

  const images: string[] = product
    ? Array.isArray(product.image_url)
      ? product.image_url
      : product.image_url
        ? [product.image_url]
        : []
    : [];

  const selectedImage = images[selectedImageIndex] || images[0] || null;

  const saveGuestCartItem = () => {
    if (!product) return;

    // Store the selected quantity in the product snapshot we save to guest cart
    // so the UI shows the chosen amount (not the stock level).
    const productSnapshot = {
      id: Number(product.id),
      name: product.name,
      price: listingPrice,
      quantity: effectiveQuantity,
      min_order_quantity: product.min_order_quantity,
      image_url: product.image_url,
      listing: product.listing
        ? {
            display_price: product.listing.display_price,
            is_listed: product.listing.is_listed,
          }
        : undefined,
    };

    addGuestCartItem(productSnapshot, effectiveQuantity);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-cart-drawer"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" dir={dir}>
      <CartDrawer />
      {toast?.show && (
        <div className="fixed top-6 right-6 z-50">
          <div className="flex items-center gap-3 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 text-xs sm:text-sm text-slate-500 hover:text-slate-800"
        >
          ← {t("product.backToProducts")}
        </button>

        {isLoading ? (
          <div className="py-16 text-center text-slate-500">
            {t("product.loadingProduct")}
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500">
            {t("product.failedToLoadProduct")}
          </div>
        ) : !product ? (
          <div className="py-16 text-center text-slate-500">
            {t("product.productNotFound")}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* Left: Images */}
            <div className="space-y-4">
              <div className="relative w-full aspect-4/3 rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                {selectedImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 bg-linear-to-br from-slate-50 to-slate-100"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                    {t("product.noImageAvailable")}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.map((img, index) => (
                    <button
                      key={img + index}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border transition-all ${
                        index === selectedImageIndex
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-slate-200 hover:border-blue-200"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 flex flex-col gap-4">
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                  {product.name}
                </h1>
                {product.Category?.name && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {product.Category.name}
                  </span>
                )}
                {product.User?.name && (
                  <p className="text-xs text-slate-500">
                    {t("product.soldBy")}{" "}
                    <span className="font-medium">{product.User.name}</span>
                  </p>
                )}
              </div>

              {product.description && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="flex items-center gap-8 text-sm">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    {t("product.price")}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-emerald-700">
                      {listingPrice} AED
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    {t("product.inStock")}
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    {product.quantity}
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-1.5">
                  {t("product.quantity")}
                </div>
                {userRole === "buyer" && (
                  <div className="text-[11px] text-slate-500 mb-2">
                    {t("product.minimumOrder")} <span className="font-medium">{moq}</span>
                  </div>
                )}
                <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) =>
                        Math.max(
                          minAllowedQty,
                          (Number(q) || minAllowedQty) - 1,
                        ),
                      )
                    }
                    disabled={
                      effectiveQuantity <= minAllowedQty ||
                      product.quantity === 0
                    }
                    className="w-9 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-lg"
                  >
                    −
                  </button>
                  <div className="w-10 text-center text-sm font-medium text-slate-900">
                    {effectiveQuantity}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(
                          product.quantity || 1,
                          Math.max(
                            minAllowedQty,
                            Math.floor(Number(q) || minAllowedQty),
                          ) + 1,
                        ),
                      )
                    }
                    disabled={
                      effectiveQuantity >= (product.quantity || 0) ||
                      product.quantity === 0
                    }
                    className="w-9 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!hasStoredAuth()) {
                      if (isSavingGuest) return;
                      setIsSavingGuest(true);
                      saveGuestCartItem();
                      setToast({
                        show: true,
                        message: t("product.savedToCartReady"),
                      });
                      setTimeout(() => setToast(null), 1000);
                      // Prevent double-adds from rapid clicks
                      setTimeout(() => setIsSavingGuest(false), 800);
                      return;
                    }
                    addToCartMutation.mutate({
                      product_id: product.id,
                      quantity: effectiveQuantity,
                    });
                  }}
                  disabled={
                    addToCartMutation.isPending ||
                    product.quantity === 0 ||
                    isSavingGuest
                  }
                  className="flex-1 inline-flex items-center justify-center rounded-full border border-blue-600 text-blue-600 text-sm py-2.5 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {t("product.addToCart")}
                </button>
                <button
                  type="button"
                  disabled={product.quantity === 0}
                  onClick={() => {
                    if (!hasStoredAuth()) {
                      saveGuestCartItem();
                      router.push("/checkout");
                      return;
                    }
                    // For "Buy now", add this item to the cart with the selected quantity,
                    // then navigate to checkout so it appears there.
                    addToCartMutation.mutate(
                      {
                        product_id: product.id,
                        quantity: effectiveQuantity,
                      },
                      {
                        onSuccess: () => {
                          router.push("/checkout");
                        },
                        onError: (err: any) => {
                          if (err?.response?.status === 401) {
                            router.push("/auth/signin");
                            return;
                          }
                          setToast({
                            show: true,
                            message:
                              err?.response?.data?.message ||
                              t("product.failedToPrepareCheckout"),
                          });
                          setTimeout(() => setToast(null), 1000);
                        },
                      },
                    );
                  }}
                  className="flex-1 inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-sm py-2.5 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {t("product.buyNow")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
