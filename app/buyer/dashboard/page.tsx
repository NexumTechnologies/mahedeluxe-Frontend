"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useI18n } from "@/components/LanguageProvider";
import {
  formatDashboardDate,
  getOrderStatusLabel,
  translateDashboard,
} from "@/lib/dashboard-i18n";
import { formatAED } from "@/lib/utils";

export default function BuyerDashboardHome() {
  const { dir, locale } = useI18n();
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  const { data: profileData } = useQuery({
    queryKey: ["buyer-profile"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/auth/profile", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
  });

  const user =
    profileData?.data || profileData?.user || profileData || null;

  const buyerName = user?.name || td("common.buyer");
  const isApproved = user?.is_varified;
  const accountStatus: string = isApproved
    ? td("common.approved")
    : td("common.pending");
  const statusClass =
    isApproved
      ? "inline-block px-2 py-0.5 text-green-700 bg-green-50 rounded font-medium"
      : accountStatus === td("common.pending")
        ? "inline-block px-2 py-0.5 text-red-700 bg-red-50 rounded font-medium"
        : "inline-block px-2 py-0.5 text-yellow-700 bg-yellow-50 rounded font-medium";

    const { data: dashboardData, isLoading, error } = useQuery({
      queryKey: ["buyer-dashboard"],
      queryFn: async () => {
        const token = localStorage.getItem("token");
        const res = await api.get("/buyer/dashboard", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        return res.data;
      },
    });

    const dashboard = (dashboardData as any)?.data || dashboardData || null;
    const totalOrders = dashboard?.totalOrders ?? 0;
    const pendingOrders = dashboard?.pendingOrders ?? 0;
    const completedOrders = dashboard?.completedOrders ?? 0;
    const wishlistItems = dashboard?.wishlistItems ?? 0;
    const recentOrders = dashboard?.recentOrders ?? [];

  return (
    <div className="max-w-6xl mx-auto p-6" dir={dir}>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {td("buyerHome.welcome", { name: buyerName })}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {td("common.accountStatus")} {" "}
            <span className={statusClass} role="status" aria-live="polite">
              {accountStatus}
            </span>
          </p>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <p className="text-sm text-slate-500">{td("buyerHome.totalOrders")}</p>
          <div className="mt-2 text-2xl font-semibold">
            {isLoading ? "-" : totalOrders}
          </div>
        </div>
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <p className="text-sm text-slate-500">{td("buyerHome.pendingOrders")}</p>
          <div className="mt-2 text-2xl font-semibold">
            {isLoading ? "-" : pendingOrders}
          </div>
        </div>
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <p className="text-sm text-slate-500">{td("buyerHome.completedOrders")}</p>
          <div className="mt-2 text-2xl font-semibold">
            {isLoading ? "-" : completedOrders}
          </div>
        </div>
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <p className="text-sm text-slate-500">{td("buyerHome.wishlistItems")}</p>
          <div className="mt-2 text-2xl font-semibold">
            {isLoading ? "-" : wishlistItems}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">{td("buyerHome.recentOrders")}</h2>
        <div className="bg-white border rounded-lg p-4">
          {isLoading ? (
            <div className="py-6 text-sm text-slate-500">{td("common.loading")}</div>
          ) : error ? (
            <div className="py-6 text-sm text-red-500">
              {td("buyerHome.failedRecentOrders")}
            </div>
          ) : !recentOrders.length ? (
            <div className="py-6 text-sm text-slate-500">
              {td("buyerHome.noRecentOrders")}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className={`${dir === "rtl" ? "text-right" : "text-left"} text-slate-500`}>
                <tr>
                  <th className="py-2">{td("common.order")}</th>
                  <th className="py-2">{td("common.product")}</th>
                  <th className="py-2">{td("common.amount")}</th>
                  <th className="py-2">{td("common.status")}</th>
                  <th className="py-2">{td("common.date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order: any) => (
                  <tr key={order.id}>
                    <td className="py-2">#{order.id}</td>
                    <td className="py-2">
                      {order.Product?.name || td("common.product")}
                    </td>
                    <td className="py-2 text-xs text-slate-600">
                      <div className="font-semibold text-slate-900">
                        {formatAED(order.total_amount || 0)}
                      </div>
                      <div>
                        Product price: {formatAED(order.base_unit_price || order.Product?.price || 0)}
                      </div>
                      <div>
                        Admin commission: {typeof order.commission_percentage === "number" ? `${order.commission_percentage}%` : "0%"}
                      </div>
                      <div>
                        Admin amount: {formatAED(order.admin_earning_amount || 0)}
                      </div>
                    </td>
                    <td className="py-2">
                      <span
                        className={`text-sm font-medium ${
                          order.status === "delivered"
                            ? "text-emerald-600"
                            : order.status === "cancelled"
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {getOrderStatusLabel(locale, order.status)}
                      </span>
                    </td>
                    <td className="py-2 text-xs text-slate-500">
                      {formatDashboardDate(locale, order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
