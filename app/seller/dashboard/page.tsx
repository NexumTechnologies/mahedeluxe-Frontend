"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useI18n } from "@/components/LanguageProvider";
import {
  formatDashboardDate,
  getOrderStatusLabel,
  translateDashboard,
} from "@/lib/dashboard-i18n";

function Tile({
  href,
  title,
  desc,
}: {
  href?: string;
  title: string;
  desc: string;
}) {
  const content = (
    <div className="p-6 border rounded-lg hover:shadow-md transition">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-500 mt-2">{desc}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default function SellerDashboardPage() {
  const { dir, locale } = useI18n();
  const router = useRouter();
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  const { data, isLoading, error } = useQuery({
    queryKey: ["seller-dashboard"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/seller/dashboard", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
  });

  const dashboard = (data as any)?.data || data || null;
  const totalProducts = dashboard?.totalProducts ?? 0;
  const pendingOrders = dashboard?.pendingOrders ?? 0;
  const totalSales = dashboard?.totalSales ?? 0;
  const messagesCount = dashboard?.messagesCount ?? 0;
  const recentOrders = dashboard?.recentOrders ?? [];

  const handleLogout = () => {
    try {
      // clear client session data and navigate to signin
      sessionStorage.clear();
      localStorage.removeItem("registration");
    } catch (e) {
      // ignore
    }
    router.push("/auth/seller/signin");
  };

  return (
    <div className="max-w-6xl mx-auto p-6" dir={dir}>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {td("sellerHome.title")}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {td("sellerHome.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/seller/dashboard/profile"
            className="px-4 py-2 border rounded-md text-slate-700 hover:bg-slate-50"
          >
            {td("sellerHome.editProfile")}
          </Link>
          <Link
            href="/seller/dashboard/orders"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:opacity-95"
          >
            {td("sellerHome.viewOrders")}
          </Link>
        </div>
      </header>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <p className="text-sm text-slate-500">{td("sellerHome.totalProducts")}</p>
          <div className="mt-2 text-2xl font-semibold">
            {isLoading ? "-" : totalProducts}
          </div>
        </div>
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <p className="text-sm text-slate-500">{td("sellerHome.pendingOrders")}</p>
          <div className="mt-2 text-2xl font-semibold">
            {isLoading ? "-" : pendingOrders}
          </div>
        </div>
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <p className="text-sm text-slate-500">{td("sellerHome.totalSales")}</p>
          <div className="mt-2 text-2xl font-semibold">
            {isLoading ? "-" : `${totalSales} AED`}
          </div>
        </div>
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <p className="text-sm text-slate-500">{td("sellerHome.messages")}</p>
          <div className="mt-2 text-2xl font-semibold">
            {isLoading ? "-" : messagesCount}
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">{td("sellerHome.quickActions")}</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/seller/dashboard/products"
            className="px-4 py-2 border rounded-md hover:bg-slate-50"
          >
            {td("sellerHome.browseProducts")}
          </Link>
          <Link
            href="/seller/dashboard/orders"
            className="px-4 py-2 border rounded-md hover:bg-slate-50"
          >
            {td("sellerHome.manageOrders")}
          </Link>
          <Link
            href="/seller/dashboard/invoices"
            className="px-4 py-2 border rounded-md hover:bg-slate-50"
          >
            {td("sellerHome.invoices")}
          </Link>
          <Link
            href="/seller/dashboard/profile"
            className="px-4 py-2 border rounded-md hover:bg-slate-50"
          >
            {td("sellerHome.profileDocuments")}
          </Link>
        </div>
      </section>

      {/* Recent activity */}
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold">{td("sellerHome.recentOrders")}</h3>
          <p className="text-sm text-slate-500 mt-2">
            {td("sellerHome.latestOrdersSubtitle")}
          </p>
          <div className="mt-4">
            {isLoading ? (
              <div className="py-6 text-sm text-slate-500">{td("common.loading")}</div>
            ) : error ? (
              <div className="py-6 text-sm text-red-500">
                {td("sellerHome.failedRecentOrders")}
              </div>
            ) : !recentOrders.length ? (
              <div className="py-6 text-sm text-slate-500">
                {td("sellerHome.noRecentOrders")}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className={`${dir === "rtl" ? "text-right" : "text-left"} text-slate-500`}>
                  <tr>
                    <th className="py-2">{td("common.order")}</th>
                    <th className="py-2">{td("common.customer")}</th>
                    <th className="py-2">{td("common.amount")}</th>
                    <th className="py-2">{td("common.status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id}>
                      <td className="py-2">#{order.id}</td>
                      <td className="py-2">
                        {order.User?.name || td("common.buyerLabel")}
                      </td>
                      <td className="py-2">
                        {order.total_amount} AED
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
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold">{td("sellerHome.recentMessages")}</h3>
          <p className="text-sm text-slate-500 mt-2">
            {td("sellerHome.recentMessagesSubtitle")}
          </p>
          <div className="mt-4 text-sm text-slate-500">
            {isLoading
              ? td("common.loading")
              : messagesCount > 0
              ? td("sellerHome.youHaveMessages", { count: messagesCount })
              : td("sellerHome.noNewMessages")}
          </div>
        </div>
      </section>

    </div>
  );
}
