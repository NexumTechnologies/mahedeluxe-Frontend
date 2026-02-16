"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { formatAED } from "@/lib/utils";

export default function BuyerBrowseProducts() {
  const router = useRouter();
  const [toast, setToast] = useState<{ show: boolean; message: string } | null>(
    null,
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["buyer-all-products"],
    queryFn: async () => {
      // Request all active products (listed or not) for the buyer.
      const res = await api.get("/product", {
        params: { includeAll: true },
      });
      return res.data;
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ product_id, quantity }: { product_id: number; quantity: number }) => {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/addToCart",
        { product_id, quantity },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      return res.data;
    },
    onSuccess: (res) => {
      setToast({
        show: true,
        message: res?.message || "Added to cart",
      });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const products = data?.data?.items || data?.products || data || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {toast?.show && (
        <div className="fixed top-6 right-6 z-50">
          <div className="flex items-center gap-3 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Discover products from all approved sellers and add them to your
            cart.
          </p>
        </header>

        {isLoading ? (
          <div className="py-10 text-center text-gray-500">
            Loading products...
          </div>
        ) : error ? (
          <div className="py-10 text-center text-red-500">
            Failed to load products.
          </div>
        ) : products.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No products available.
          </div>
        ) : (
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product: any) => {
              const images: string[] = Array.isArray(product.image_url)
                ? product.image_url
                : product.image_url
                ? [product.image_url]
                : [];
              const primaryImage = images[0];
              const listingPrice = product.listing?.display_price ?? product.price;

              return (
                <div
                  key={product.id}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden flex flex-col border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    {primaryImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        No image
                      </div>
                    )}
                    {product.quantity === 0 && (
                      <span className="absolute top-2 left-2 rounded-full bg-red-500 text-white text-[10px] px-2 py-0.5 uppercase tracking-wide">
                        Out of stock
                      </span>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 group-hover:text-blue-700">
                        {product.name}
                      </h3>
                      {product.Category?.name && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 whitespace-nowrap">
                          {product.Category.name}
                        </span>
                      )}
                    </div>

                    {product.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between text-xs pt-2 border-t border-dashed border-slate-200 pt-3">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-slate-500">
                          Price
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                          <span>{formatAED(listingPrice)}</span>
                        </span>
                      </div>
                      <div className="flex flex-col items-end text-slate-500">
                        <span className="text-[11px]">In stock</span>
                        <span className="text-xs font-medium">
                          {product.quantity}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          addToCartMutation.mutate({
                            product_id: product.id,
                            quantity: 1,
                          })
                        }
                        disabled={addToCartMutation.isPending || product.quantity === 0}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-blue-600 text-blue-600 text-xs sm:text-sm py-1.5 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Add to cart
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/products/${product.id}`)}
                        className="flex-1 inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-xs sm:text-sm py-1.5 hover:bg-blue-700"
                      >
                        Buy now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
