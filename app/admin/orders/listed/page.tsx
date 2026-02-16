"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { AdminOrder } from "../types";
import { formatAED } from "@/lib/utils";

type AdminOrderStatus = "pending" | "delivered" | "cancelled" | "all";

const STATUS_BADGE: Record<Exclude<AdminOrderStatus, "all">, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-100",
};

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

function getImageSrc(url: unknown) {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function useAdminListedOrders(
  status: AdminOrderStatus,
  page: number,
  size: number,
) {
  return useQuery({
    queryKey: ["admin-listed-orders", status, page, size],
    queryFn: async () => {
      const params: any = { page, size };
      if (status !== "all") params.status = status;
      const res = await api.get("/order/admin/listed", { params });
      return res.data as {
        data: {
          items: (AdminOrder & { admin_earning?: number; quantity?: number })[];
          pagination: {
            totalItems: number;
            totalPages: number;
            currentPage: number;
            pageSize: number;
          };
          totals: {
            totalOrders: number;
            totalRevenue: number;
            adminEarnings: number;
          };
        };
      };
    },
  });
}

export default function AdminListedOrdersPage() {
  const [page, setPage] = useState(1);
  const size = 10;
  // Only show completed orders here
  const [statusFilter] = useState<AdminOrderStatus>("delivered");

  const { data, isLoading, error } = useAdminListedOrders(
    statusFilter,
    page,
    size,
  );

  const orders = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;
  const totals = data?.data?.totals;

  const total = pagination?.totalItems ?? 0;
  const start = total === 0 ? 0 : (page - 1) * size + 1;
  const end = Math.min(page * size, total || 0);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Listed Product Orders (Users)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Orders placed by users on listed products.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">Total Orders</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {totals?.totalOrders ?? 0}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">Total Revenue</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {formatAED(totals?.totalRevenue ?? 0)}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">Admin Earnings</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {formatAED(totals?.adminEarnings ?? 0)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Loading orders...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-600">
            Failed to load orders
          </div>
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
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{" "}
                  Pending
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 ring-1 ring-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
                  Delivered
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 ring-1 ring-rose-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />{" "}
                  Cancelled
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50/60">
              {orders.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  No orders found.
                </div>
              ) : (
                <ul className="space-y-3">
                  {orders.map((order) => {
                    const buyer = order.User;
                    const seller = order.Seller;
                    const product = order.Product;
                    const statusKey =
                      (order.status as AdminOrderStatus) ?? "pending";
                    const badgeClass =
                      statusKey === "all"
                        ? "bg-gray-100 text-gray-700 ring-gray-200"
                        : STATUS_BADGE[
                            statusKey === "delivered" ||
                            statusKey === "cancelled" ||
                            statusKey === "pending"
                              ? statusKey
                              : "pending"
                          ];

                    return (
                      <li
                        key={order.id}
                        className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-px hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-xs font-semibold text-indigo-700 overflow-hidden">
                            {getImageSrc(product?.image_url) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={getImageSrc(product?.image_url) as string}
                                alt={product?.name ?? "Product image"}
                                className="w-full h-full object-cover rounded-xl"
                                loading="lazy"
                              />
                            ) : (
                              <span className="px-1 text-center line-clamp-2">
                                {product?.name ?? "Product"}
                              </span>
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
                                {order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-700 line-clamp-1">
                              {product?.name ?? "Product details not available"}
                            </div>
                            <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                              <span>
                                Placed:{" "}
                                <span className="font-medium text-gray-700">
                                  {formatDate(order.createdAt)}
                                </span>
                              </span>
                              <span className="inline-block h-1 w-1 rounded-full bg-gray-300" />
                              <span>
                                Amount:{" "}
                                <span className="font-semibold text-gray-900">
                                  {formatAED(order.total_amount)}
                                </span>
                              </span>
                              {typeof (order as any).admin_earning ===
                                "number" && (
                                <>
                                  <span className="inline-block h-1 w-1 rounded-full bg-gray-300" />
                                  <span>
                                    Admin earning:{" "}
                                    <span className="font-semibold text-gray-900">
                                      {formatAED((order as any).admin_earning)}
                                    </span>
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                              <span>
                                Buyer:{" "}
                                <span className="font-medium text-gray-700">
                                  {buyer?.name ?? "Unknown"}
                                </span>
                                {buyer?.email ? (
                                  <span className="text-gray-400">
                                    {" "}
                                    · {buyer.email}
                                  </span>
                                ) : null}
                              </span>
                              <span className="inline-block h-1 w-1 rounded-full bg-gray-300" />
                              <span>
                                Seller:{" "}
                                <span className="font-medium text-gray-700">
                                  {seller?.name ?? "Unknown"}
                                </span>
                                {seller?.email ? (
                                  <span className="text-gray-400">
                                    {" "}
                                    · {seller.email}
                                  </span>
                                ) : null}
                              </span>
                            </div>
                            {order.address ? (
                              <div className="text-xs text-gray-500">
                                Address:{" "}
                                <span className="text-gray-700">
                                  {order.address}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="p-4 border-t bg-white flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Page{" "}
                <span className="font-medium text-gray-700">
                  {pagination?.currentPage ?? page}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">
                  {pagination?.totalPages ?? 1}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!!pagination && page >= pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
