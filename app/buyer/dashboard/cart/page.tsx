"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { formatAED } from "@/lib/utils";
import {
  clearGuestCart,
  getGuestCart,
  hasStoredAuth,
  removeGuestCartItem,
  updateGuestCartItemQuantity,
} from "@/lib/cartStorage";
import { ChevronRight, Minus, Package, Plus, ShieldCheck, Trash2, Truck } from "lucide-react";

export default function BuyerCartPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [guestCart, setGuestCart] = useState(() => getGuestCart());
  const isAuthenticated = hasStoredAuth();

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
    enabled: isAuthenticated,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/addToCart", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const res = await api.delete("/addToCart", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-cart"] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const token = localStorage.getItem("token");
      const res = await api.put(
        `/addToCart/${id}`,
        { quantity },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-cart"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("token");
      const res = await api.delete(`/addToCart/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-cart"] });
    },
  });

  const accountCart = data?.data || data || {};
  const cart = isAuthenticated ? accountCart : guestCart;
  const items = cart.items || [];
  const totalItems = cart.totalItems || items.length || 0;
  const totalPrice = cart.totalPrice || 0;
  const summaryCards = useMemo(
    () => [
      {
        label: "Items ready",
        value: String(totalItems),
        icon: Package,
        tone: "bg-sky-50 text-sky-700",
      },
      {
        label: "Delivery",
        value: "Calculated later",
        icon: Truck,
        tone: "bg-amber-50 text-amber-700",
      },
      {
        label: "Checkout",
        value: isAuthenticated ? "Account order" : "Guest or login",
        icon: ShieldCheck,
        tone: "bg-emerald-50 text-emerald-700",
      },
    ],
    [isAuthenticated, totalItems],
  );

  const handleChangeQuantity = (item: any, delta: number) => {
    const currentQty = item.quantity || 1;
    const stock = item.Product?.quantity ?? null;
    const moq = item.Product?.min_order_quantity != null
      ? Math.max(1, Math.floor(Number(item.Product.min_order_quantity) || 1))
      : 1;
    const nextQty = currentQty + delta;

    if (nextQty < moq) return;
    if (stock !== null && nextQty > stock) return;

    if (isAuthenticated) {
      updateQuantityMutation.mutate({ id: item.id, quantity: nextQty });
      return;
    }

    updateGuestCartItemQuantity(Number(item.product_id), nextQty);
    setGuestCart(getGuestCart());
  };

  const handleRemoveItem = (item: any) => {
    if (isAuthenticated) {
      removeItemMutation.mutate(item.id);
      return;
    }

    removeGuestCartItem(Number(item.product_id));
    setGuestCart(getGuestCart());
  };

  const handleClearCart = () => {
    if (isAuthenticated) {
      clearCartMutation.mutate();
      return;
    }

    clearGuestCart();
    setGuestCart(getGuestCart());
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_35%),linear-gradient(135deg,_#ffffff,_#f8fafc_58%,_#eff6ff)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-sm">
              {isAuthenticated ? "Account cart" : "Guest cart"}
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Cart built to be easy to scan.
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Review products, adjust quantities, and move to checkout without losing your items.
                {!isAuthenticated
                  ? " Your products are saved in this browser until you log in or place the order directly."
                  : " Your account cart stays connected to your profile."}
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50"
              disabled={clearCartMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
              {clearCartMutation.isPending ? "Clearing..." : "Clear cart"}
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {card.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {card.value}
                    </p>
                  </div>
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {isLoading ? (
        <div className="py-10 text-center text-gray-500">Loading cart...</div>
      ) : error ? (
        <div className="py-10 text-center text-red-500">Failed to load cart.</div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-gray-500">Your cart is empty.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="h-24 w-24 overflow-hidden rounded-2xl bg-slate-100 text-xs text-slate-400">
                    {item.Product?.image_url?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.Product.image_url[0]}
                      alt={item.Product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">No image</div>
                  )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          {isAuthenticated ? "Saved to your account" : "Saved locally"}
                        </p>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {item.Product?.name || "Product"}
                        </h2>
                        <p className="text-sm text-slate-500">
                          Unit price: {formatAED(item.unit_price || item.total_price / Math.max(1, item.quantity || 1))}
                        </p>
                        <p className="text-sm text-slate-500">
                          Minimum order: {Math.max(1, Number(item.Product?.min_order_quantity) || 1)}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Line total
                        </p>
                        <p className="mt-1 text-xl font-semibold text-slate-950">
                          {formatAED(item.total_price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-dashed border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleChangeQuantity(item, -1)}
                        disabled={
                          updateQuantityMutation.isPending ||
                          item.quantity <=
                            (item.Product?.min_order_quantity != null
                              ? Math.max(
                                  1,
                                  Math.floor(
                                    Number(item.Product.min_order_quantity) || 1,
                                  ),
                                )
                              : 1)
                        }
                        className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="w-12 text-center text-sm font-medium text-slate-900">
                        {item.quantity}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleChangeQuantity(item, 1)}
                        disabled={
                          updateQuantityMutation.isPending ||
                          (item.Product?.quantity != null &&
                            item.quantity >= item.Product.quantity)
                        }
                        className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item)}
                        disabled={removeItemMutation.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Order overview
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              {formatAED(totalPrice)}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {totalItems} item{totalItems === 1 ? "" : "s"} ready. Shipping and final taxes are shown at checkout.
            </p>

            <div className="mt-5 space-y-3 border-y border-dashed border-slate-200 py-5 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Items subtotal</span>
                <span className="font-medium text-slate-900">{formatAED(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span className="font-medium text-slate-900">Calculated at checkout</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Checkout mode</span>
                <span className="font-medium text-slate-900">
                  {isAuthenticated ? "Account checkout" : "Guest or login"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Continue to checkout
              <ChevronRight className="h-4 w-4" />
            </button>

            {!isAuthenticated && (
              <p className="mt-3 text-xs leading-5 text-slate-500">
                You can keep shopping as a guest. At payment time, we will let you either log in or order directly.
              </p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
