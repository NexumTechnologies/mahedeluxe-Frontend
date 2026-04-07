"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function SellerOrdersPage() {
  const queryClient = useQueryClient();

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "processing" | "completed">(
    "all",
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/order/seller", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
  });

  console.log("here is the seller oders", data)

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const token = localStorage.getItem("token");
      const res = await api.put(
        `/order/seller/${id}/toggle-status`,
        { status },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
    },
  });

  const orders = (data as any)?.data || data || [];

  const sortedOrders = [...orders].sort((a: any, b: any) => {
    const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  const displayOrders = sortedOrders.filter((order: any) => {
    const status = String(order?.status || "").toLowerCase();
    if (activeTab === "pending") return status === "pending";
    if (activeTab === "processing") return status === "processing";
    if (activeTab === "completed") return status === "delivered";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
          <p className="mt-1 text-sm text-slate-600">
            Orders placed by buyers for your products.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 border rounded-md text-sm text-slate-700 hover:bg-slate-50"
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <section className="mt-2 bg-white border rounded-lg p-4">
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
              activeTab === "all"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
              activeTab === "pending"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("processing")}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
              activeTab === "processing"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Processing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
              activeTab === "completed"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Completed
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Loading your orders...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-red-500">
            Failed to load orders.
          </div>
        ) : !orders.length ? (
          <div className="py-8 text-center text-sm text-slate-500">
            You have not received any orders yet.
          </div>
        ) : !displayOrders.length ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No orders found for this tab.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2">Order</th>
                <th className="py-2">Product</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Buyer</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayOrders.map((order: any) => (
                <tr key={order.id} className="align-top">
                  <td className="py-2 pr-4">
                    <div className="font-medium text-slate-900">
                      #{order.id}
                    </div>
                  </td>
                  <td className="py-2 pr-4 max-w-xs">
                    <div className="text-slate-900 truncate">
                      {order.Product?.name || "Product"}
                    </div>
                  </td>
                  <td className="py-2 pr-4 text-xs text-slate-700">
                    {typeof order.quantity === "number" ? order.quantity : "-"}
                  </td>
                  <td className="py-2 pr-4">
                    <div className="text-slate-900 text-xs">
                      {order.User?.name || "Buyer"}
                    </div>
                    {order.User?.email && (
                      <div className="text-[11px] text-slate-500">
                        {order.User.email}
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-xs">
                    <div className="font-semibold text-slate-900">
                      {order.total_amount} AED
                    </div>
                    {typeof order.admin_earning_amount === "number" && (
                      <div className="text-[11px] text-slate-500">
                        Admin margin: {order.admin_earning_amount} AED
                      </div>
                    )}
                    {typeof order.seller_earning_amount === "number" && (
                      <div className="text-[11px] text-emerald-700 font-medium">
                        Your earning: {order.seller_earning_amount} AED
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${
                        order.status === "delivered"
                          ? "bg-emerald-50 text-emerald-700"
                          : order.status === "cancelled"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2 text-slate-500 text-xs">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-2 pr-0 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1 rounded-full border border-slate-300 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </button>
                      {order.status === "pending" && (
                        <button
                          type="button"
                          disabled={updateStatusMutation.isPending}
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: order.id,
                              status: "processing",
                            })
                          }
                          className="px-3 py-1 rounded-full border border-blue-500 text-[11px] font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Mark processing
                        </button>
                      )}
                      {order.status === "processing" && (
                        <button
                          type="button"
                          disabled={updateStatusMutation.isPending}
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: order.id,
                              status: "delivered",
                            })
                          }
                          className="px-3 py-1 rounded-full border border-emerald-500 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Mark delivered
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={
                          updateStatusMutation.isPending ||
                          order.status === "cancelled"
                        }
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: order.id,
                            status: "cancelled",
                          })
                        }
                        className="px-3 py-1 rounded-full border border-red-500 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {selectedOrder && (
        <div className="app-modal-overlay z-40">
          <div className="app-modal-panel max-w-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Order #{selectedOrder.id}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString()
                    : "-"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>

            <div className="app-modal-scroll space-y-4 px-4 py-4 text-sm">
              <div className="flex gap-3">
                {selectedOrder.Product?.image_url?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedOrder.Product.image_url[0]}
                    alt={selectedOrder.Product.name || "Product image"}
                    className="h-20 w-20 shrink-0 rounded-md object-cover border"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border bg-slate-50 text-xs text-slate-400">
                    No image
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {selectedOrder.Product?.name || "Product"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Total amount: {selectedOrder.total_amount} AED
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Quantity: {typeof selectedOrder.quantity === "number" ? selectedOrder.quantity : "-"}
                  </p>
                  {typeof selectedOrder.admin_earning_amount === "number" && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      Admin margin: {selectedOrder.admin_earning_amount} AED
                    </p>
                  )}
                  {typeof selectedOrder.seller_earning_amount === "number" && (
                    <p className="mt-0.5 text-xs text-emerald-700 font-medium">
                      Your earning: {selectedOrder.seller_earning_amount} AED
                    </p>
                  )}
                  <div className="mt-1 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Status: </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                        selectedOrder.status === "delivered"
                          ? "bg-emerald-50 text-emerald-700"
                          : selectedOrder.status === "cancelled"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-700">
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Buyer</span>
                  <span className="text-right">
                    {selectedOrder.User?.name || "Buyer"}
                    {selectedOrder.User?.email && (
                      <>
                        <br />
                        <span className="text-slate-500">
                          {selectedOrder.User.email}
                        </span>
                      </>
                    )}
                  </span>
                </div>
                {selectedOrder.address && (
                  <div className="flex justify-between gap-4">
                    <span className="font-medium">Shipping address</span>
                    <span className="max-w-65 text-right text-slate-600">
                      {selectedOrder.address}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-md border px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
