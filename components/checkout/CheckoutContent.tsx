/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import ShippingAddressForm, {
  type ShippingAddressData,
} from "./ShippingAddressForm";
import ItemsAndDeliverySection from "./ItemsAndDeliverySection";
import OrderSummary from "./OrderSummary";
import {
  clearGuestCart,
  getGuestCart,
  hasStoredAuth,
  removeGuestCartItem,
  setGuestCart as setStoredGuestCart,
  type GuestCart,
  type GuestCartItem,
} from "@/lib/cartStorage";
import { getStoredUser } from "@/lib/authStorage";
import { useI18n } from "@/components/LanguageProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import { formatPriceFromAED } from "@/lib/currency";

const ORDER_SUCCESS_STORAGE_KEY = "checkout:last-order";
const NGENIUS_PENDING_CHECKOUT_KEY = "checkout:pending-ngenius";

type CheckoutListing = {
  display_price?: number;
  is_listed?: boolean;
};

type CheckoutProduct = {
  name?: string;
  listing?: CheckoutListing;
  image_url?: string | string[] | null;
  selected_size?: string | null;
};

type CheckoutItem = {
  id?: number | string;
  product_id: number;
  selected_size?: string | null;
  quantity: number;
  total_price?: number;
  unit_price?: number;
  Product?: CheckoutProduct;
};

type CheckoutCart = {
  items: CheckoutItem[];
  totalItems: number;
  totalPrice: number;
};

type CheckoutCartState = CheckoutCart | GuestCart;

type PlaceOrderResponse = {
  message?: string;
  data?: unknown[];
};

type HostedOrderResponse = {
  success?: boolean;
  data?: {
    paymentUrl?: string;
    orderReference?: string;
    orderId?: string;
    redirectUrl?: string;
  };
  message?: string;
};

const isLocalOrigin = (origin: string) => {
  try {
    const parsed = new URL(origin);
    const host = parsed.hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
};

export default function CheckoutContent() {
  const { dir, locale, t } = useI18n();
  const { currency, rates } = useCurrency();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [toast, setToast] = useState<{ show: boolean; message: string } | null>(
    null,
  );
  const [shippingComplete, setShippingComplete] = useState(false);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddressData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isGuestChoiceModalOpen, setIsGuestChoiceModalOpen] = useState(false);
  const [guestCart, setGuestCart] = useState(() => getGuestCart());

  const isAuthenticated = typeof window !== "undefined" && hasStoredAuth();

  useEffect(() => {
    const syncGuestCart = () => setGuestCart(getGuestCart());

    if (typeof window !== "undefined") {
      window.addEventListener("guest-cart-change", syncGuestCart);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("guest-cart-change", syncGuestCart);
      }
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) return;
    if (!guestCart.items || guestCart.items.length === 0) return;

    const needsPricingHydration = guestCart.items.some((item) => {
      const p = (item as any)?.Product;
      return p?.base_price == null || p?.customer_price == null;
    });

    if (!needsPricingHydration) return;

    let cancelled = false;

    (async () => {
      try {
        const uniqueIds = Array.from(
          new Set(
            guestCart.items
              .map((it) => Number(it.product_id))
              .filter((id) => Number.isFinite(id) && id > 0),
          ),
        );

        if (uniqueIds.length === 0) return;

        const results = await Promise.all(
          uniqueIds.map(async (id) => {
            const res = await api.get(`/product/${id}`);
            const product = (res as any)?.data?.data || (res as any)?.data?.product || (res as any)?.data;
            return { id, product };
          }),
        );

        if (cancelled) return;

        const byId = new Map<number, any>(results.map((r) => [Number(r.id), r.product]));

        const nextItems = guestCart.items.map((item) => {
          const productId = Number(item.product_id);
          const fresh = byId.get(productId);
          if (!fresh) return item;

          const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
          const selectedSize = item.selected_size || (item as any)?.Product?.selected_size || null;
          const variant = Array.isArray(fresh.size_variants)
            ? fresh.size_variants.find(
                (entry: any) =>
                  String(entry?.size || "").trim().toLowerCase() ===
                  String(selectedSize || "").trim().toLowerCase(),
              )
            : null;
          const basePrice = Number(variant?.price ?? fresh.base_price ?? fresh.price ?? 0) || 0;
          const customerPrice = Number(item.unit_price ?? fresh.customer_price ?? 0) || 0;
          const unitPrice = customerPrice > 0 ? customerPrice : basePrice;
          const variantImages = Array.isArray(variant?.image_url)
            ? variant.image_url
            : variant?.image_url
              ? [variant.image_url]
              : null;

          return {
            ...item,
            selected_size: selectedSize,
            unit_price: unitPrice,
            total_price: unitPrice * quantity,
            Product: {
              ...(item as any).Product,
              id: Number(fresh.id ?? productId),
              name: fresh.name ?? (item as any).Product?.name,
              price: basePrice,
              base_price: basePrice,
              customer_price: unitPrice > 0 ? unitPrice : undefined,
              admin_margin_amount:
                fresh.admin_margin_amount != null ? Number(fresh.admin_margin_amount) : undefined,
              admin_margin_percentage:
                fresh.admin_margin_percentage != null ? Number(fresh.admin_margin_percentage) : undefined,
              min_order_quantity:
                fresh.min_order_quantity ?? (item as any).Product?.min_order_quantity,
              image_url:
                variantImages ??
                fresh.image_url ??
                (item as any).Product?.image_url,
              selected_size: selectedSize,
              listing: fresh.listing ?? (item as any).Product?.listing,
            },
          };
        });

        const nextCart = setStoredGuestCart(nextItems as any);
        setGuestCart(nextCart);
      } catch {
        // ignore hydration failures
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [guestCart.items, isAuthenticated]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["buyer-cart"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await api.get("/addToCart");
      return res.data;
    },
  });

  const serverCart =
    ((data as { data?: CheckoutCart } | undefined)?.data ??
      (data as CheckoutCart | undefined)) ||
    ({ items: [], totalItems: 0, totalPrice: 0 } as CheckoutCart);

  const syncGuestCartMutation = useMutation({
    mutationFn: async (itemsToSync: GuestCartItem[]) => {
      for (const item of itemsToSync) {
        await api.post("/addToCart", {
          product_id: item.product_id,
          quantity: item.quantity,
          selected_size: item.selected_size || item.Product?.selected_size || null,
        });
      }
    },
    onSuccess: async () => {
      clearGuestCart();
      setGuestCart(getGuestCart());
      await queryClient.invalidateQueries({ queryKey: ["buyer-cart"] });
    },
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    if (guestCart.items.length === 0) return;
    if (syncGuestCartMutation.isPending) return;

    syncGuestCartMutation.mutate(guestCart.items);
  }, [guestCart.items, isAuthenticated, syncGuestCartMutation]);

  const cart: CheckoutCartState = isAuthenticated
    ? (serverCart.items?.length || 0) > 0
      ? serverCart
      : guestCart
    : guestCart;
  const items = cart.items || [];
  const totalItems = cart.totalItems || items.length || 0;
  const itemSubtotal = cart.totalPrice || 0;

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      if (!shippingAddress) {
        throw new Error("Shipping address is required");
      }

      const res = await api.post(
        "/order",
        {
          email: shippingAddress.email,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          phone: shippingAddress.phone,
          apartment: shippingAddress.apartment,
          state: shippingAddress.state,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      return res.data;
    },
    onSuccess: (res: PlaceOrderResponse) => {
      queryClient.invalidateQueries({ queryKey: ["buyer-cart"] });
      setIsConfirmModalOpen(false);

      setToast({
        show: true,
        message: res?.message || t("checkout.orderPlacedSuccess"),
      });
      setTimeout(() => setToast(null), 1500);

      try {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            ORDER_SUCCESS_STORAGE_KEY,
            JSON.stringify({
              customerEmail:
                shippingAddress?.email || getStoredUser()?.email || "",
              customerName:
                `${shippingAddress?.firstName || ""} ${shippingAddress?.lastName || ""}`.trim(),
              orders: res?.data || [],
              shippingAddress: shippingAddress?.summary || "",
              totalAmount: itemSubtotal,
              placedAt: new Date().toISOString(),
            }),
          );
        }
      } catch {
        // ignore session storage issues
      }

      setTimeout(() => {
        router.push("/checkout/success");
      }, 700);
    },
  });

  const placeGuestOrderMutation = useMutation({
    mutationFn: async () => {
      if (!shippingAddress) {
        throw new Error("Shipping address is required");
      }

      const res = await api.post("/order/guest", {
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          selected_size: item.selected_size || item.Product?.selected_size || null,
        })),
        email: shippingAddress.email,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        phone: shippingAddress.phone,
        apartment: shippingAddress.apartment,
        state: shippingAddress.state,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      });
      return res.data;
    },
    onSuccess: (res: PlaceOrderResponse) => {
      clearGuestCart();
      setGuestCart(getGuestCart());
      setIsGuestChoiceModalOpen(false);

      setToast({
        show: true,
        message: res?.message || t("checkout.guestOrderPlacedSuccess"),
      });
      setTimeout(() => setToast(null), 1500);

      try {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            ORDER_SUCCESS_STORAGE_KEY,
            JSON.stringify({
              customerEmail: shippingAddress?.email || "",
              customerName:
                `${shippingAddress?.firstName || ""} ${shippingAddress?.lastName || ""}`.trim(),
              orders: res?.data || [],
              shippingAddress: shippingAddress?.summary || "",
              totalAmount: itemSubtotal,
              placedAt: new Date().toISOString(),
            }),
          );
        }
      } catch {
        // ignore session storage issues
      }

      setTimeout(() => {
        router.push("/checkout/success");
      }, 700);
    },
  });

  const createHostedPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!shippingAddress) {
        throw new Error("Shipping address is required");
      }

      const configuredRedirectUrl = String(
        process.env.NEXT_PUBLIC_NGENIUS_REDIRECT_URL || "",
      ).trim();
      const fallbackRedirectUrl = isLocalOrigin(window.location.origin)
        ? ""
        : `${window.location.origin}/checkout/payment-return`;
      const redirectUrl = configuredRedirectUrl || fallbackRedirectUrl;

      const res = await api.post<HostedOrderResponse>(
        "/payment/ngenius/hosted-order",
        {
          amount: itemSubtotal,
          currency: "AED",
          email: shippingAddress.email,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          shippingAddress: shippingAddress.summary,
          ...(redirectUrl ? { redirectUrl } : {}),
        },
      );

      return res.data;
    },
    onSuccess: (res) => {
      const paymentUrl = res?.data?.paymentUrl;
      if (!paymentUrl) {
        setToast({
          show: true,
          message: t("checkout.paymentInitFailed"),
        });
        setTimeout(() => setToast(null), 2000);
        return;
      }

      try {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            NGENIUS_PENDING_CHECKOUT_KEY,
            JSON.stringify({
              provider: "ngenius",
              orderReference: res?.data?.orderReference || null,
              orderId: res?.data?.orderId || null,
              totalAmount: itemSubtotal,
              customerEmail: shippingAddress?.email || getStoredUser()?.email || "",
              customerName:
                `${shippingAddress?.firstName || ""} ${shippingAddress?.lastName || ""}`.trim(),
              shippingAddress: shippingAddress?.summary || "",
              shipping: shippingAddress
                ? {
                    email: shippingAddress.email,
                    firstName: shippingAddress.firstName,
                    lastName: shippingAddress.lastName,
                    phone: shippingAddress.phone,
                    apartment: shippingAddress.apartment,
                    state: shippingAddress.state,
                    city: shippingAddress.city,
                    postalCode: shippingAddress.postalCode,
                    country: shippingAddress.country,
                  }
                : null,
              createdAt: new Date().toISOString(),
            }),
          );
        }
      } catch {
        // ignore session storage issues
      }

      window.location.href = paymentUrl;
    },
    onError: () => {
      setToast({
        show: true,
        message: t("checkout.paymentInitFailed"),
      });
      setTimeout(() => setToast(null), 2000);
    },
  });

  const removeCheckoutItem = async (item: CheckoutItem) => {
    if (isAuthenticated) {
      await api.delete(`/addToCart/${item.id}`);
      await queryClient.invalidateQueries({ queryKey: ["buyer-cart"] });
      return;
    }

    removeGuestCartItem(
      Number(item.product_id),
      item.selected_size || item.Product?.selected_size || null,
    );
    setGuestCart(getGuestCart());
  };

  const isBusy =
    placeOrderMutation.isPending ||
    placeGuestOrderMutation.isPending ||
    syncGuestCartMutation.isPending ||
    createHostedPaymentMutation.isPending;

  const checkoutError =
    syncGuestCartMutation.error ||
    placeOrderMutation.error ||
    placeGuestOrderMutation.error ||
    createHostedPaymentMutation.error ||
    error;

  return (
    <div
      className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 lg:py-8"
      dir={dir}
    >
      {toast?.show && (
        <div className="fixed top-6 right-6 z-50">
          <div className="flex items-center gap-3 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
            <span>{toast.message}</span>
          </div>
        </div>
      )}
      {syncGuestCartMutation.isPending && (
        <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          {t("checkout.movingGuestCart")}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-950">
            {t("checkout.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t("checkout.subtitle")}
          </p>
        </div>
        <div className="text-sm text-slate-600 sm:text-right">
          <div className="text-sm">
            {totalItems}{" "}
            {totalItems === 1
              ? t("checkout.itemSingle")
              : t("checkout.itemPlural")}
          </div>
          <div className="mt-1 text-base sm:text-lg font-semibold text-slate-950">
            {formatPriceFromAED(itemSubtotal, currency, rates, locale)}
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="flex-1 space-y-6">
          <ShippingAddressForm
            isComplete={shippingComplete}
            onComplete={setShippingComplete}
            isActive={!shippingComplete}
            onActivate={() => setShippingComplete(false)}
            onAddressChange={setShippingAddress}
          />
          <ItemsAndDeliverySection
            items={items}
            isLoading={isLoading || syncGuestCartMutation.isPending}
            isActive={true}
            onActivate={() => {}}
            onRemoveItem={removeCheckoutItem}
            isRemoving={isBusy}
            mode={isAuthenticated ? "account" : "guest"}
          />
        </div>

        <div className="w-full lg:shrink-0 lg:sticky lg:top-6">
          <OrderSummary
            items={items}
            totalItems={totalItems}
            itemSubtotal={itemSubtotal}
            isLoading={isLoading || syncGuestCartMutation.isPending}
            hasError={!!checkoutError}
            canPay={
              shippingComplete &&
              !!shippingAddress &&
              !syncGuestCartMutation.isPending
            }
            onPayNow={() => {
              if (isAuthenticated) {
                createHostedPaymentMutation.mutate();
                return;
              }

              setIsGuestChoiceModalOpen(true);
            }}
          />
        </div>
      </div>

      {createHostedPaymentMutation.isPending && (
        <div className="app-modal-overlay z-50">
          <div className="app-modal-panel max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="mt-1 h-10 w-10 animate-pulse rounded-full bg-amber-100" />
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Redirecting to secure payment
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Please wait while we prepare your payment with N-Genius.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isGuestChoiceModalOpen && (
        <div className="app-modal-overlay">
          <div className="app-modal-panel max-w-md overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-0 shadow-2xl">
            <div className="bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_40%),linear-gradient(135deg,#ffffff,#f8fafc_65%,#fff7ed)] px-6 py-6">
              <span className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
                {t("checkout.finalStep")}
              </span>
              <h2 className="mt-4 text-2xl font-semibold text-slate-950">
                {t("checkout.loginFirstOrOrderDirectly")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t("checkout.guestChoiceDescription")}
              </p>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>{t("checkout.items")}</span>
                  <span className="font-medium text-slate-900">
                    {totalItems}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>{t("checkout.total")}</span>
                  <span className="font-medium text-slate-900">
                    {formatPriceFromAED(itemSubtotal, currency, rates, locale)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {t("checkout.shippingTo")}{" "}
                  {shippingAddress?.summary ||
                    t("checkout.completeShippingFirst")}
                </div>
              </div>

              {placeGuestOrderMutation.isError && (
                <p className="text-xs text-red-600">
                  {t("checkout.guestOrderFailed")}
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => router.push("/auth/signin?returnTo=/checkout")}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  disabled={isBusy}
                >
                  {t("checkout.loginAndContinue")}
                </button>
                <button
                  type="button"
                  onClick={() => createHostedPaymentMutation.mutate()}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isBusy}
                >
                  {createHostedPaymentMutation.isPending
                    ? t("checkout.placingOrder")
                    : t("checkout.orderDirectly")}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsGuestChoiceModalOpen(false)}
                className="w-full text-sm text-slate-500 transition hover:text-slate-700"
                disabled={isBusy}
              >
                {t("checkout.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {isConfirmModalOpen && (
        <div className="app-modal-overlay">
          <div className="app-modal-panel max-w-md overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-0 shadow-2xl">
            <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] px-6 py-5">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {t("checkout.reviewOrder")}
              </span>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                {t("checkout.confirmAndPlace")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t("checkout.confirmDescription")}
              </p>
            </div>
            <div className="space-y-4 px-6 py-5 text-sm text-slate-700 max-h-[60vh] overflow-y-auto">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  {t("checkout.shippingAddress")}
                </h3>
                <p>{shippingAddress?.summary || ""}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  {t("checkout.items")}
                </h3>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item.id} className="flex justify-between text-xs">
                      {(() => {
                        const quantity = Number(item.quantity ?? 1) || 1;
                        const product = item.Product || {};
                        const listing = product.listing;
                        const listingPrice =
                          listing &&
                          listing.is_listed &&
                          listing.display_price != null
                            ? Number(listing.display_price)
                            : undefined;
                        const baseUnit =
                          typeof item.unit_price === "number" &&
                          !Number.isNaN(item.unit_price)
                            ? item.unit_price
                            : undefined;
                        const fallbackUnit =
                          Number(item.total_price ?? 0) / quantity || 0;
                        const unitPrice =
                          typeof listingPrice === "number" &&
                          !Number.isNaN(listingPrice)
                            ? listingPrice
                            : typeof baseUnit === "number"
                              ? baseUnit
                              : fallbackUnit;
                        const lineTotal = unitPrice * quantity;

                        return (
                          <>
                            <span className="truncate mr-2">
                              {item.Product?.name ||
                                t("checkout.productFallback")}
                              {(item.selected_size || item.Product?.selected_size) &&
                                ` (${item.selected_size || item.Product?.selected_size})`}{" "}
                              x{quantity}
                            </span>
                            <span className="font-medium">
                              {formatPriceFromAED(lineTotal, currency, rates, locale)}
                            </span>
                          </>
                        );
                      })()}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900">
                  {t("checkout.total")}
                </span>
                <span className="font-semibold text-slate-900">
                  {formatPriceFromAED(itemSubtotal, currency, rates, locale)}
                </span>
              </div>
            </div>
            {placeOrderMutation.isError && (
              <p className="text-xs text-red-600">
                {t("checkout.placeOrderFailed")}
              </p>
            )}
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 text-xs sm:text-sm rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                disabled={isBusy}
              >
                {t("checkout.cancel")}
              </button>
              <button
                type="button"
                onClick={() => placeOrderMutation.mutate()}
                disabled={isBusy}
                className="px-4 py-2 text-xs sm:text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {placeOrderMutation.isPending
                  ? t("checkout.placingOrder")
                  : t("checkout.confirmOrder")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
