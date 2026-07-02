/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Mail, MessageCircle, Share2 } from "lucide-react";
import api from "@/lib/axios";
import { addGuestCartItem, hasStoredAuth } from "@/lib/cartStorage";
import CartDrawer from "@/components/cart/CartDrawer";
import { useI18n } from "@/components/LanguageProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import { formatPriceFromAED } from "@/lib/currency";

type ApiErrorResponse = {
  message?: string;
};

export default function ProductDetailPage() {
  const { dir, locale, t } = useI18n();
  const { currency, rates } = useCurrency();
  const { id } = useParams();
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string } | null>(
    null,
  );
  const [linkCopied, setLinkCopied] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isSavingGuest, setIsSavingGuest] = useState(false);

  const getErrorMessage = (error: unknown) =>
    (error as AxiosError<ApiErrorResponse>)?.response?.data?.message;

  const getErrorStatus = (error: unknown) =>
    (error as AxiosError<ApiErrorResponse>)?.response?.status;

  //========================= API CALLS ==========================//
  //==============================================================//
  const fetchProductDetail = async () => {
    const res = await api.get(`/product/${id}`);
    return res.data;
  };

  const addToCartRequest = async ({
    product_id,
    quantity,
    selected_size,
  }: {
    product_id: number;
    quantity: number;
    selected_size?: string | null;
  }) => {
    const res = await api.post("/addToCart", {
      product_id,
      quantity,
      selected_size,
    });
    return res.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["product-detail", id],
    queryFn: fetchProductDetail,
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: addToCartRequest,
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
    onError: (err: unknown) => {
      if (getErrorStatus(err) === 401) {
        router.push("/auth/signin");
        return;
      }
      setToast({
        show: true,
        message: getErrorMessage(err) || t("product.failedToAddToCart"),
      });
      setTimeout(() => setToast(null), 1000);
    },
  });

  const product = data?.data || data?.product || data || null;
  const sizeVariants = Array.isArray(product?.size_variants)
    ? product.size_variants
    : [];
  const availableSizes =
    sizeVariants.length > 0
      ? sizeVariants
          .map((variant: any) => String(variant?.size || "").trim())
          .filter(Boolean)
      : Array.isArray(product?.sizes)
        ? product.sizes
        : [];
  const effectiveSelectedSize =
    selectedSize && availableSizes.includes(selectedSize)
      ? selectedSize
      : availableSizes[0] || null;
  const activeVariant =
    effectiveSelectedSize && sizeVariants.length > 0
      ? sizeVariants.find(
          (variant: any) =>
            String(variant?.size || "")
              .trim()
              .toLowerCase() === effectiveSelectedSize.toLowerCase(),
        ) || null
      : null;

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
  const isPurchaseFlowUser = userRole === "buyer" || userRole == null;
  const minAllowedQty = isPurchaseFlowUser ? moq : 1;
  const effectiveQuantity = Math.max(
    minAllowedQty,
    Math.floor(Number(quantity) || minAllowedQty),
  );

  const basePrice =
    activeVariant?.price != null
      ? Number(activeVariant.price) || 0
      : product
        ? Number(product.price) || 0
        : 0;
  const basePriceRaw =
    activeVariant?.base_price != null
      ? Number(activeVariant.base_price) || 0
      : product && (product.base_price != null || product.base_price === 0)
        ? Number(product.base_price)
        : basePrice;
  const customerPriceRaw =
    activeVariant?.customer_price != null
      ? Number(activeVariant.customer_price) || 0
      : product && product.customer_price != null
        ? Number(product.customer_price)
        : null;
  const listingPrice =
    (customerPriceRaw != null && !Number.isNaN(customerPriceRaw)
      ? customerPriceRaw
      : null) ??
    (product && product.listing && product.listing.display_price != null
      ? Number(product.listing.display_price)
      : basePrice);

  const allVariantImages: string[] = Array.from(
    new Set(
      sizeVariants.flatMap((variant: any): string[] =>
        Array.isArray(variant?.image_url)
          ? variant.image_url
              .filter((image: unknown): image is string => Boolean(image))
              .map((image: string) => String(image))
          : variant?.image_url
            ? [String(variant.image_url)]
            : [],
      ),
    ),
  );
  const imageToVariantSize = new Map<string, string>();
  sizeVariants.forEach((variant: any) => {
    const variantSize = String(variant?.size || "").trim();
    if (!variantSize) return;

    const variantImageList = Array.isArray(variant?.image_url)
      ? variant.image_url
          .filter((image: unknown): image is string => Boolean(image))
          .map((image: string) => String(image))
      : variant?.image_url
        ? [String(variant.image_url)]
        : [];

    variantImageList.forEach((image: string) => {
      if (!imageToVariantSize.has(image)) {
        imageToVariantSize.set(image, variantSize);
      }
    });
  });
  const productImages: string[] = product
    ? Array.isArray(product.image_url)
      ? product.image_url
      : product.image_url
        ? [product.image_url]
        : []
    : [];
  const images: string[] =
    allVariantImages.length > 0 ? allVariantImages : productImages;

  const selectedImage = images[selectedImageIndex] || images[0] || null;
  const sizeRequired = sizeVariants.length > 0;

  const saveGuestCartItem = () => {
    if (!product) return;

    const productSnapshot = {
      id: Number(product.id),
      name: product.name,
      price: basePriceRaw,
      base_price: basePriceRaw,
      customer_price:
        customerPriceRaw != null && !Number.isNaN(customerPriceRaw)
          ? customerPriceRaw
          : listingPrice,
      admin_margin_amount:
        product.admin_margin_amount != null
          ? Number(product.admin_margin_amount)
          : undefined,
      admin_margin_percentage:
        product.admin_margin_percentage != null
          ? Number(product.admin_margin_percentage)
          : undefined,
      quantity: product.quantity,
      min_order_quantity: product.min_order_quantity,
      image_url: images,
      selected_size: effectiveSelectedSize,
      size_variants: sizeVariants,
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

  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "info@mahedeluxe.ae";
  const whatsappNumberRaw =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+971 50 329 8799";
  const whatsappNumber = whatsappNumberRaw.replace(/[^\d]/g, "");
  const canWhatsapp = Boolean(whatsappNumber);
  const canEmail = Boolean(supportEmail);

  const productName = product?.name ? String(product.name) : "";
  const productUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"}/products/${id}`;
  const whatsappText = [
    "Hello, I have a question about this product:",
    productName,
    effectiveSelectedSize ? `Size: ${effectiveSelectedSize}` : "",
    productUrl,
  ]
    .filter(Boolean)
    .join("\n");

  const whatsappHref = canWhatsapp
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`
    : "";
  const emailHref = canEmail
    ? `mailto:${supportEmail}?subject=${encodeURIComponent(
        productName ? `Product inquiry: ${productName}` : "Product inquiry",
      )}&body=${encodeURIComponent(
        `Hi,\n\nI have a question about this product${
          effectiveSelectedSize ? ` (size: ${effectiveSelectedSize})` : ""
        }:\n${productUrl}`,
      )}`
    : "";

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;

    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1800);
    } catch (copyError) {
      console.error("Failed to copy product link", copyError);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" dir={dir}>
      <CartDrawer />
      {toast?.show && (
        <div className="fixed right-6 top-6 z-50">
          <div className="flex items-center gap-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 text-xs text-slate-500 hover:text-slate-800 sm:text-sm"
        >
          {"<-"} {t("product.backToProducts")}
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-4">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                {selectedImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="h-full w-full bg-linear-to-br from-slate-50 to-slate-100 p-4 object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    {t("product.noImageAvailable")}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.map((img, index) => (
                    <button
                      key={`${img}-${index}`}
                      type="button"
                      onClick={() => {
                        setSelectedImageIndex(index);
                        const matchingVariantSize = imageToVariantSize.get(img);
                        if (matchingVariantSize) {
                          setSelectedSize(matchingVariantSize);
                        }
                      }}
                      className={`relative h-20 w-20 overflow-hidden rounded-xl border transition-all ${
                        index === selectedImageIndex
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-slate-200 hover:border-blue-200"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
              <div className="space-y-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                      {product.name}
                    </h1>
                    {product.Category?.name && (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {product.Category.name}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`inline-flex items-center gap-2 self-start rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                      linkCopied
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    <Share2 className="h-4 w-4" />
                    {linkCopied ? "Link copied" : "Copy link"}
                  </button>
                </div>
              </div>

              {product.description && (
                <p className="text-sm leading-relaxed text-slate-600">
                  {product.description}
                </p>
              )}

              <div className="flex items-center gap-8 text-sm">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    {t("product.price")}
                  </div>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-2xl font-semibold text-emerald-700">
                      {formatPriceFromAED(
                        listingPrice,
                        currency,
                        rates,
                        locale,
                      )}
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

              {availableSizes.length > 0 && (
                <div className="pt-1">
                  <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">
                    Size
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size: string) => {
                      const isActive = effectiveSelectedSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setSelectedSize(size);
                            const matchingVariant = sizeVariants.find(
                              (variant: any) =>
                                String(variant?.size || "").trim().toLowerCase() ===
                                size.toLowerCase(),
                            );
                            const nextImage = Array.isArray(matchingVariant?.image_url)
                              ? matchingVariant.image_url.find(Boolean)
                              : matchingVariant?.image_url;
                            if (nextImage) {
                              const nextIndex = images.findIndex(
                                (image) => image === String(nextImage),
                              );
                              setSelectedImageIndex(nextIndex >= 0 ? nextIndex : 0);
                              return;
                            }
                            setSelectedImageIndex(0);
                          }}
                          className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                            isActive
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-1">
                <div className="mb-1.5 text-xs uppercase tracking-wide text-slate-500">
                  {t("product.quantity")}
                </div>
                {isPurchaseFlowUser && (
                  <div className="mb-2 text-[11px] text-slate-500">
                    {t("product.minimumOrder")}{" "}
                    <span className="font-medium">{moq}</span>
                  </div>
                )}
                <div className="inline-flex items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
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
                    className="flex h-8 w-9 items-center justify-center text-lg text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    -
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
                            Math.floor(Number(q) || minAllowedQty) + 1,
                          ),
                        ),
                      )
                    }
                    disabled={
                      effectiveQuantity >= (product.quantity || 0) ||
                      product.quantity === 0
                    }
                    className="flex h-8 w-9 items-center justify-center text-lg text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <a
                    href={canWhatsapp ? whatsappHref : undefined}
                    target={canWhatsapp ? "_blank" : undefined}
                    rel={canWhatsapp ? "noopener noreferrer" : undefined}
                    aria-disabled={!canWhatsapp}
                    onClick={(event) => {
                      if (!canWhatsapp) event.preventDefault();
                    }}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                      canWhatsapp
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "cursor-not-allowed bg-slate-200 text-slate-500"
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp Enquiry</span>
                  </a>

                  <a
                    href={canEmail ? emailHref : undefined}
                    aria-disabled={!canEmail}
                    onClick={(event) => {
                      if (!canEmail) event.preventDefault();
                    }}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                      canEmail
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "cursor-not-allowed bg-slate-200 text-slate-500"
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email Inquiry</span>
                  </a>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      if (sizeRequired && !effectiveSelectedSize) {
                        setToast({
                          show: true,
                          message: "Please choose a size first.",
                        });
                        setTimeout(() => setToast(null), 1000);
                        return;
                      }

                      if (!hasStoredAuth()) {
                        if (isSavingGuest) return;
                        setIsSavingGuest(true);
                        saveGuestCartItem();
                        setToast({
                          show: true,
                          message: t("product.savedToCartReady"),
                        });
                        setTimeout(() => setToast(null), 1000);
                        setTimeout(() => setIsSavingGuest(false), 800);
                        return;
                      }

                      addToCartMutation.mutate({
                        product_id: product.id,
                        quantity: effectiveQuantity,
                        selected_size: effectiveSelectedSize,
                      });
                    }}
                    disabled={
                      addToCartMutation.isPending ||
                      product.quantity === 0 ||
                      isSavingGuest
                    }
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-blue-600 py-2.5 text-sm text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t("product.addToCart")}
                  </button>
                  <button
                    type="button"
                    disabled={product.quantity === 0}
                    onClick={() => {
                      if (sizeRequired && !effectiveSelectedSize) {
                        setToast({
                          show: true,
                          message: "Please choose a size first.",
                        });
                        setTimeout(() => setToast(null), 1000);
                        return;
                      }

                      if (!hasStoredAuth()) {
                        saveGuestCartItem();
                        router.push("/checkout");
                        return;
                      }

                      addToCartMutation.mutate(
                        {
                          product_id: product.id,
                          quantity: effectiveQuantity,
                          selected_size: effectiveSelectedSize,
                        },
                        {
                          onSuccess: () => {
                            router.push("/checkout");
                          },
                          onError: (err: unknown) => {
                            if (getErrorStatus(err) === 401) {
                              router.push("/auth/signin");
                              return;
                            }
                            setToast({
                              show: true,
                              message:
                                getErrorMessage(err) ||
                                t("product.failedToPrepareCheckout"),
                            });
                            setTimeout(() => setToast(null), 1000);
                          },
                        },
                      );
                    }}
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-blue-600 py-2.5 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t("product.buyNow")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
