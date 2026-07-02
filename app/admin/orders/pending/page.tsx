"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

import type { AdminOrder } from "../types";

const STATUS_BADGE = {
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
} as const;

function useAdminOrders(page: number, size: number) {
  return useQuery({
    queryKey: ["admin-orders", "pending", page, size],
    queryFn: async () => {
      //========================= API CALLS ==========================//
      //==============================================================//
      const res = await api.get("/order/admin", { params: { page, size, status: "pending" } });
      return res.data as {
        data: {
          items: AdminOrder[];
          pagination: { totalItems: number; totalPages: number; currentPage: number; pageSize: number };
        };
      };
    },
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

function OrderDetailModal({ order, onClose }: { order: AdminOrder | null; onClose: () => void }) {
  if (!order) return null;
  const buyer = order.User;
  const seller = order.Seller;
  const product = order.Product;

  return (
    <div className="app-modal-overlay z-40">
      <div className="app-modal-panel max-w-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50/60">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Order #{order.id}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Full order details</p>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
        <div className="app-modal-scroll p-5 space-y-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl bg-linear-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-xs font-semibold text-indigo-700 overflow-hidden shrink-0">
              {product?.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="px-2 text-center line-clamp-3 text-[11px]">
                  {product?.name ?? "Product"}
                </span>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-sm font-semibold text-gray-900">
                {product?.name ?? "Product details not available"}
              </div>
              <div className="text-xs text-gray-500">
                Status: <span className="font-medium text-gray-800">{order.status}</span>
              </div>
              <div className="text-xs text-gray-500">
                Placed: <span className="font-medium text-gray-800">{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
              <div className="text-[11px] font-semibold text-gray-500 mb-1">Buyer</div>
              <div className="text-sm font-medium text-gray-900">{buyer?.name ?? "Unknown"}</div>
              {buyer?.email && <div className="text-xs text-gray-500 mt-0.5">{buyer.email}</div>}
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
              <div className="text-[11px] font-semibold text-gray-500 mb-1">Seller</div>
              <div className="text-sm font-medium text-gray-900">{seller?.name ?? "Unknown"}</div>
              {seller?.email && <div className="text-xs text-gray-500 mt-0.5">{seller.email}</div>}
            </div>
          </div>

          {order.address && (
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 text-xs text-gray-600">
              <div className="text-[11px] font-semibold text-gray-500 mb-1">Shipping address</div>
              <div className="text-sm text-gray-800">{order.address}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPendingOrdersPage() {
  const [page, setPage] = useState(1);
  const size = 10;
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const { data, isLoading, error } = useAdminOrders(page, size);

  const orders = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;
  const total = pagination?.totalItems ?? 0;
  const start = total === 0 ? 0 : (page - 1) * size + 1;
  const end = Math.min(page * size, total || 0);

  return (
    <div className="space-y-6 relative">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Pending Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Orders awaiting confirmation or fulfilment from sellers.
          </p>
        </div>
        <div className="hidden sm:block text-xs text-gray-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 ring-1 ring-gray-100">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {total} pending orders
          </span>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-gray-500">Loading pending orders...</div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-600">Failed to load pending orders</div>
        ) : (
          <>
            <div className="p-4 border-b flex items-center justify-between bg-gray-50/60">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{start}</span>-
                <span className="font-medium">{end}</span> of
                <span className="font-medium"> {total}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50/60">
              {orders.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">No pending orders.</div>
              ) : (
                <ul className="space-y-3">
                  {orders.map((order) => {
                    const buyer = order.User;
                    const seller = order.Seller;
                    const product = order.Product;

                    return (
                      <li
                        key={order.id}
                        className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-px hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-xs font-semibold text-indigo-700 overflow-hidden">
                            {product?.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <span className="px-1 text-center line-clamp-2">{product?.name ?? "Product"}</span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">Order #{order.id}</span>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${STATUS_BADGE.pending}`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" /> Pending
                              </span>
                            </div>
                            <div className="text-sm text-gray-700 line-clamp-1">
                              {product?.name ?? "Product details not available"}
                            </div>
                            <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                              <span>
                                Placed: <span className="font-medium text-gray-700">{formatDate(order.createdAt)}</span>
                              </span>
                              <span className="inline-block h-1 w-1 rounded-full bg-gray-300" />
                              <span>
                                Buyer: <span className="font-medium text-gray-700">{buyer?.name ?? "Unknown"}</span>
                              </span>
                              <span className="inline-block h-1 w-1 rounded-full bg-gray-300" />
                              <span>
                                Seller: <span className="font-medium text-gray-700">{seller?.name ?? "Unknown"}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center justify-end sm:justify-start sm:ml-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="p-4 flex items-center justify-between bg-white border-t border-gray-100">
              <div className="text-sm text-gray-600">Total: {total}</div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
                >
                  Prev
                </button>
                <span className="px-3 py-1 border rounded bg-gray-50 text-sm">Page {page}</span>
                <button
                  disabled={page >= Math.ceil((total || 0) / size)}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
