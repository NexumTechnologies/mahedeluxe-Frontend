"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useI18n } from "@/components/LanguageProvider";
import {
  formatDashboardDate,
  formatDashboardDateTime,
  getOrderStatusLabel,
  translateDashboard,
} from "@/lib/dashboard-i18n";

export default function BuyerOrdersPage() {
  const { dir, locale } = useI18n();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  //========================= API CALLS ==========================//
  //==============================================================//
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["buyer-orders"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/order", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
  });

  const orders = (data as any)?.data || data || [];

  return (
    <div className="max-w-6xl mx-auto p-6" dir={dir}>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{td("buyerOrders.title")}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {td("buyerOrders.subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 border rounded-md text-sm text-slate-700 hover:bg-slate-50"
          disabled={isLoading}
        >
          {isLoading ? td("common.refreshing") : td("common.refresh")}
        </button>
      </header>

      <section className="mt-6 bg-white border rounded-lg p-4">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-slate-500">
            {td("buyerOrders.loading")}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-red-500">
            {td("buyerOrders.failed")}
          </div>
        ) : !orders.length ? (
          <div className="py-8 text-center text-sm text-slate-500">
            {td("buyerOrders.empty")}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className={`${dir === "rtl" ? "text-right" : "text-left"} text-slate-500`}>
              <tr>
                <th className="py-2">{td("common.order")}</th>
                <th className="py-2">{td("common.product")}</th>
                <th className="py-2">{td("common.image")}</th>
                <th className="py-2">{td("common.amount")}</th>
                <th className="py-2">{td("common.status")}</th>
                <th className="py-2">{td("common.date")}</th>
                <th className="py-2 text-right">{td("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order: any) => (
                <tr key={order.id} className="align-top">
                  <td className="py-2 pr-4">
                    <div className="font-medium text-slate-900">
                      #{order.id}
                    </div>
                  </td>
                  <td className="py-2 pr-4 max-w-xs">
                    <div className="text-slate-900 truncate">
                      {order.Product?.name || td("common.product")}
                    </div>
                    {order.address && (
                      <div className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
                        {order.address}
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                      {order.Product?.image_url?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={order.Product.image_url[0]}
                          alt={order.Product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{td("common.noImage")}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 pr-4">
                    <span className="font-medium text-slate-900">
                      {order.total_amount} AED
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize
                        ${order.status === "delivered"
                          ? "bg-emerald-50 text-emerald-700"
                          : order.status === "processing"
                          ? "bg-blue-50 text-blue-700"
                          : order.status === "cancelled"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-700"}
                      `}
                    >
                      {getOrderStatusLabel(locale, order.status)}
                    </span>
                  </td>
                  <td className="py-2 text-slate-500 text-xs">
                    {order.createdAt
                      ? formatDashboardDate(locale, order.createdAt)
                      : "-"}
                  </td>
                  <td className="py-2 pr-0 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {td("common.view")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-lg p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedOrder.Product?.name || td("common.product")}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {td("common.order")} #{selectedOrder.id} {"ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢"}{" "}
                  {selectedOrder.createdAt
                    ? formatDashboardDateTime(locale, selectedOrder.createdAt)
                    : ""}
                </p>
                {selectedOrder.status && (
                  <span
                    className={`inline-flex mt-2 items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${
                      selectedOrder.status === "delivered"
                        ? "bg-emerald-50 text-emerald-700"
                        : selectedOrder.status === "cancelled"
                        ? "bg-red-50 text-red-600"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {getOrderStatusLabel(locale, selectedOrder.status)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                {td("common.close")}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[160px,1fr] gap-4 items-start">
              <div className="w-full max-w-40 h-40 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center text-xs text-slate-400 mx-auto md:mx-0">
                {(() => {
                  const product = selectedOrder.Product || {};
                  const rawImage = product.image_url as any;
                  const mainImage = Array.isArray(rawImage)
                    ? rawImage[0]
                    : rawImage;
                  if (mainImage) {
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mainImage}
                          alt={product.name || td("common.product")}
                        className="w-full h-full object-cover"
                      />
                    );
                  }
                  return <span>{td("common.noImage")}</span>;
                })()}
              </div>

              <div className="space-y-2 text-sm text-slate-700">
                {selectedOrder.address && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-0.5">
                      {td("common.shippingAddress")}
                    </h3>
                    <p className="text-xs leading-relaxed">
                      {selectedOrder.address}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-0.5">
                    {td("common.amount")}
                  </h3>
                  <p className="font-semibold text-slate-900">
                    {selectedOrder.total_amount} AED
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs sm:text-sm rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                {td("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
