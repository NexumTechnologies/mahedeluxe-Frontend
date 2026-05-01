"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import ShippingAddressForm, { type ShippingAddressData } from "./ShippingAddressForm";
import ItemsAndDeliverySection from "./ItemsAndDeliverySection";
import OrderSummary from "./OrderSummary";
import {
  clearGuestCart,
  getGuestCart,
  hasStoredAuth,
  removeGuestCartItem,
} from "@/lib/cartStorage";
import { getStoredUser } from "@/lib/authStorage";
import { useI18n } from "@/components/LanguageProvider";

export default function CheckoutContent() {
  const { dir, t } = useI18n();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [shippingComplete, setShippingComplete] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isGuestChoiceModalOpen, setIsGuestChoiceModalOpen] = useState(false);
  const [guestCart, setGuestCart] = useState(() => getGuestCart());

  const [isClient, setIsClient] = useState(false);
  const isAuthenticated = isClient && hasStoredAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const { data, isLoading, error } = useQuery({
    queryKey: ["buyer-cart"],
    enabled: isClient && isAuthenticated,
    queryFn: async () => {
      const res = await api.get("/addToCart");
      return res.data;
    },
  });

  const serverCart = (data as any)?.data || data || {};

  const syncGuestCartMutation = useMutation({
    mutationFn: async (itemsToSync: any[]) => {
      for (const item of itemsToSync) {
        await api.post("/addToCart", {
          product_id: item.product_id,
          quantity: item.quantity,
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
  }, [guestCart.items.length, isAuthenticated]);

  const cart = isAuthenticated
    ? ((serverCart.items?.length || 0) > 0 ? serverCart : guestCart)
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-cart"] });
      setIsConfirmModalOpen(false);
      let redirectTo = "/";

      try {
        const storedUser =
          typeof window !== "undefined" ? localStorage.getItem("user") : null;
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        const role = parsed?.role;

        if (role === "buyer") {
          redirectTo = "/buyer/dashboard";
        } else if (role === "user") {
          redirectTo = "/";
        }
      } catch {
        // Fallback to home if parsing fails
        redirectTo = "/";
      }

      router.push(redirectTo);
    },
  });

  const placeGuestOrderMutation = useMutation({
    mutationFn: async () => {
      if (!shippingAddress) {
        throw new Error("Shipping address is required");
      }

      const res = await api.post("/order/guest", {
        items: items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
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
    onSuccess: () => {
      clearGuestCart();
      setGuestCart(getGuestCart());
      setIsGuestChoiceModalOpen(false);
      router.push("/");
    },
  });

  const removeCheckoutItem = async (item: any) => {
    if (isAuthenticated) {
      await api.delete(`/addToCart/${item.id}`);
      await queryClient.invalidateQueries({ queryKey: ["buyer-cart"] });
      return;
    }

    removeGuestCartItem(Number(item.product_id));
    setGuestCart(getGuestCart());
  };

  const isBusy =
    placeOrderMutation.isPending ||
    placeGuestOrderMutation.isPending ||
    syncGuestCartMutation.isPending;

  const checkoutError =
    syncGuestCartMutation.error || placeOrderMutation.error || placeGuestOrderMutation.error || error;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 lg:py-8" dir={dir}>
      {syncGuestCartMutation.isPending && (
        <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          {t("checkout.movingGuestCart")}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-950">{t("checkout.title")}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {t("checkout.subtitle")}
          </p>
        </div>
        <div className="text-sm text-slate-600 sm:text-right">
          <div className="text-sm">{totalItems} {totalItems === 1 ? t("checkout.itemSingle") : t("checkout.itemPlural")}</div>
          <div className="mt-1 text-base sm:text-lg font-semibold text-slate-950">{itemSubtotal} AED</div>
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
            canPay={shippingComplete && !!shippingAddress && !syncGuestCartMutation.isPending}
            onPayNow={() => {
              if (isAuthenticated) {
                setIsConfirmModalOpen(true);
                return;
              }

              setIsGuestChoiceModalOpen(true);
            }}
          />
        </div>
      </div>

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
                  <span className="font-medium text-slate-900">{totalItems}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>{t("checkout.total")}</span>
                  <span className="font-medium text-slate-900">{itemSubtotal} AED</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {t("checkout.shippingTo")} {shippingAddress?.summary || t("checkout.completeShippingFirst")}
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
                  onClick={() => placeGuestOrderMutation.mutate()}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isBusy}
                >
                  {placeGuestOrderMutation.isPending ? t("checkout.placingOrder") : t("checkout.orderDirectly")}
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
                  {items.map((item: any) => (
                    <li key={item.id} className="flex justify-between text-xs">
                      {(() => {
                        const quantity = Number(item.quantity ?? 1) || 1;
                        const product = item.Product || {};
                        const listing = (product as any).listing;
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
                              {item.Product?.name || t("checkout.productFallback")} x{quantity}
                            </span>
                            <span className="font-medium">{lineTotal} AED</span>
                          </>
                        );
                      })()}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900">{t("checkout.total")}</span>
                <span className="font-semibold text-slate-900">
                  {itemSubtotal} AED
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
