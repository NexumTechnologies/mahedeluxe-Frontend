"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { formatAED } from "@/lib/utils";

export default function BuyerCartPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["buyer-cart"],
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

  const cart = data?.data || data || {};
  const items = cart.items || [];

  const handleChangeQuantity = (item: any, delta: number) => {
    const currentQty = item.quantity || 1;
    const stock = item.Product?.quantity ?? null;
    const moq = item.Product?.min_order_quantity != null
      ? Math.max(1, Math.floor(Number(item.Product.min_order_quantity) || 1))
      : 1;
    const nextQty = currentQty + delta;

    if (nextQty < moq) return;
    if (stock !== null && nextQty > stock) return;

    updateQuantityMutation.mutate({ id: item.id, quantity: nextQty });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Cart</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review items you have added to your cart.
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => clearCartMutation.mutate()}
            className="text-xs sm:text-sm px-3 py-1.5 rounded border text-red-600 border-red-200 hover:bg-red-50"
            disabled={clearCartMutation.isPending}
          >
            {clearCartMutation.isPending ? "Clearing..." : "Clear cart"}
          </button>
        )}
      </header>

      {isLoading ? (
        <div className="py-10 text-center text-gray-500">Loading cart...</div>
      ) : error ? (
        <div className="py-10 text-center text-red-500">Failed to load cart.</div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-gray-500">Your cart is empty.</div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                  {item.Product?.image_url?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.Product.image_url[0]}
                      alt={item.Product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>No image</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {item.Product?.name || "Product"}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wide text-slate-400">
                      Qty
                    </span>
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
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                      >
                        −
                      </button>
                      <div className="w-9 text-center text-xs font-medium text-slate-900">
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
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  <div className="text-sm font-semibold text-emerald-700">
                    {formatAED(item.total_price)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItemMutation.mutate(item.id)}
                    disabled={removeItemMutation.isPending}
                    className="text-[11px] text-red-600 hover:text-red-700 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4 text-sm">
            <div className="w-full sm:w-auto text-slate-600">
              <div>{cart.totalItems || items.length} item(s) in cart</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Shipping & taxes calculated at checkout
              </div>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Total
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  {formatAED(cart.totalPrice || 0)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium px-5 py-2.5 hover:bg-blue-700 shadow-sm"
              >
                Proceed to checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
