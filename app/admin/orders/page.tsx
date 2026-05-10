"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { formatAED } from "@/lib/utils";
import type { AdminOrder } from "./types";

type AdminOrderStatus = "pending" | "delivered" | "cancelled" | "all";

const STATUS_BADGE: Record<Exclude<AdminOrderStatus, "all">, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-100",
};

function useAdminOrders(status: AdminOrderStatus, page: number, size: number, period: string) {
  return useQuery({
    queryKey: ["admin-orders", status, page, size, period],
    queryFn: async () => {
      const params: { page: number; size: number; status?: Exclude<AdminOrderStatus, "all">; period?: string } = {
        page,
        size,
      };
      if (status !== "all") params.status = status;
      if (period && period !== "all") params.period = period;
      const res = await api.get("/order/admin", { params });
      return res.data as {
        data: {
          items: AdminOrder[];
          pagination: {
            totalItems: number;
            totalPages: number;
            currentPage: number;
            pageSize: number;
          };
          totals?: {
            totalOrders: number;
            totalRevenue: number;
            adminEarnings: number;
          };
        };
      };
    },
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

function formatAmount(amount: number) {
  return formatAED(amount);
}

function OrderDetailModal({ order, onClose }: { order: AdminOrder | null; onClose: () => void }) {
  if (!order) return null;
  const buyer = order.User;
  const seller = order.Seller;
  const product = order.Product;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="max-w-2xl w-full rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
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
        <div className="p-5 space-y-4">
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
                Amount: <span className="font-semibold text-gray-900">{formatAmount(order.total_amount)}</span>
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

export default function AdminAllOrdersPage() {
  const [page, setPage] = useState(1);
  const size = 10;
  const [statusFilter] = useState<AdminOrderStatus>("all");
  const [periodFilter, setPeriodFilter] = useState<"all" | "week" | "month">("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const { data, isLoading, error } = useAdminOrders(statusFilter, page, size, periodFilter);

  const orders = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;
  const totals = data?.data?.totals;
  const total = pagination?.totalItems ?? 0;
  const start = total === 0 ? 0 : (page - 1) * size + 1;
  const end = Math.min(page * size, total || 0);

  return (
    <div className="space-y-6 relative">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">All Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of every order placed from buyers to sellers across the platform.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="hidden sm:block text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 ring-1 ring-gray-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {total} total orders
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">Total Orders</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {totals?.totalOrders ?? total}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">Total Revenue</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
              {formatAmount(totals?.totalRevenue ?? 0)}
            </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">Admin Earnings</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
              {formatAmount(totals?.adminEarnings ?? 0)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-600">Show:</div>
        <button
          onClick={() => { setPeriodFilter("all"); setPage(1); }}
          className={`px-3 py-1 rounded ${periodFilter === "all" ? "bg-slate-900 text-white" : "bg-white text-gray-700 border"}`}
        >All time</button>
        <button
          onClick={() => { setPeriodFilter("week"); setPage(1); }}
          className={`px-3 py-1 rounded ${periodFilter === "week" ? "bg-slate-900 text-white" : "bg-white text-gray-700 border"}`}
        >This week</button>
        <button
          onClick={() => { setPeriodFilter("month"); setPage(1); }}
          className={`px-3 py-1 rounded ${periodFilter === "month" ? "bg-slate-900 text-white" : "bg-white text-gray-700 border"}`}
        >This month</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-gray-500">Loading orders...</div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-600">Failed to load orders</div>
        ) : (
          <>
            <div className="p-4 border-b flex items-center justify-between bg-gray-50/60">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{start}</span>-
                <span className="font-medium">{end}</span> of
                <span className="font-medium"> {total}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="hidden sm:inline">Status legend:</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 ring-1 ring-amber-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Pending
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 ring-1 ring-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Delivered
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 ring-1 ring-rose-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Cancelled
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50/60">
              {orders.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">No orders found.</div>
              ) : (
                <ul className="space-y-3">
                  {orders.map((order) => {
                    const buyer = order.User;
                    const seller = order.Seller;
                    const product = order.Product;
                    const statusKey = (order.status as AdminOrderStatus) ?? "pending";
                    const badgeClass =
                      statusKey === "all"
                        ? "bg-gray-100 text-gray-700 ring-gray-200"
                        : STATUS_BADGE[(statusKey === "delivered" || statusKey === "cancelled" || statusKey === "pending") ? statusKey : "pending"];

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
                              <span className="text-sm font-semibold text-gray-900">
                                Order #{order.id}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${badgeClass}`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
                                Amount: <span className="font-semibold text-gray-900">{formatAmount(order.total_amount)}</span>
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                              <span>
                                Buyer: <span className="font-medium text-gray-700">{buyer?.name ?? "Unknown"}</span>
                                {buyer?.email && (
                                  <span className="text-gray-400">  b7 {buyer.email}</span>
                                )}
                              </span>
                              <span className="inline-block h-1 w-1 rounded-full bg-gray-300" />
                              <span>
                                Seller: <span className="font-medium text-gray-700">{seller?.name ?? "Unknown"}</span>
                                {seller?.email && (
                                  <span className="text-gray-400">  b7 {seller.email}</span>
                                )}
                              </span>
                            </div>
                            {order.address && (
                              <div className="mt-1 text-xs text-gray-400 line-clamp-1">
                                Ship to: {order.address}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center justify-end sm:justify-start sm:ml-4 gap-4">
                          <div className="text-right text-xs text-gray-600">
                            <div>Total: <span className="font-semibold text-gray-900">{formatAmount(order.total_amount)}</span></div>
                            <div>Admin: <span className="font-semibold text-gray-900">{formatAmount(order.admin_earning_amount ?? order.admin_earning ?? 0)}</span></div>
                            <div>Seller: <span className="font-semibold text-gray-900">{formatAmount((order.total_amount || 0) - (order.admin_earning_amount ?? order.admin_earning ?? 0))}</span></div>
                          </div>
                          <div>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              View
                            </button>
                          </div>
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
                <span className="px-3 py-1 border rounded bg-gray-50 text-sm">
                  Page {page}
                </span>
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
