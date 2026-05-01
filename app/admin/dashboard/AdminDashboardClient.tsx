"use client";

import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/components/LanguageProvider";
import { getAdminDashboardStats } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/authStorage";
import { translateDashboard } from "@/lib/dashboard-i18n";

interface DashboardStats {
  totalUsers?: number;
  pendingApprovalUsers?: number;
  activeSellers?: number;
  totalOrders?: number;
  pendingOrders?: number;
}

function Card({
  title,
  value,
  subtitle,
  accent,
}: {
  title: string;
  value: string;
  subtitle?: string;
  accent?: "primary" | "warning" | "success";
}) {
  const accentClasses: Record<string, string> = {
    primary:
      "bg-gradient-to-tr from-violet-500 to-indigo-500 text-white shadow-violet-200/80",
    warning:
      "bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-amber-200/80",
    success:
      "bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-emerald-200/80",
  };

  const useAccent = accent && accentClasses[accent];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md ${
        useAccent ? accentClasses[accent!] : ""
      }`}
    >
      {!useAccent && (
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.12),transparent_55%)]" />
      )}
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p
            className={`text-xs font-medium tracking-wide uppercase ${
              useAccent ? "text-white/80" : "text-gray-500"
            }`}
          >
            {title}
          </p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              useAccent ? "text-white" : "text-gray-900"
            }`}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={`mt-1 text-[11px] ${
                useAccent ? "text-white/80" : "text-gray-500"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div className="h-10 w-10 rounded-full bg-white/10 ring-1 ring-white/40 flex items-center justify-center text-xs font-semibold text-white/90">
          {title
            .split(" ")
            .map((w) => w[0])
            .join("")}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardClient() {
  const { dir, locale } = useI18n();
  const token = getStoredToken();
  const user = getStoredUser();
  const isAuthedAdmin = !!token && (user?.role === "admin" || user?.role === "Admin");
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  const { data, isLoading, isError } = useQuery<DashboardStats>({
    queryKey: ["admin-dashboard-stats"],
    enabled: isAuthedAdmin,
    queryFn: async () => {
      const res = await getAdminDashboardStats();
      const payload = res as { data?: DashboardStats } | null;
      return payload?.data ?? {};
    },
  });

  const stats = data || {};

  const totalUsers = stats.totalUsers ?? 0;
  const pendingApprovals = stats.pendingApprovalUsers ?? 0;
  const totalOrders = stats.totalOrders ?? 0;
  const pendingOrders = stats.pendingOrders ?? 0;

  const pendingUserPct = totalUsers
    ? Math.min(100, (pendingApprovals / (totalUsers || 1)) * 100)
    : 0;
  const pendingOrderPct = totalOrders
    ? Math.min(100, (pendingOrders / (totalOrders || 1)) * 100)
    : 0;

  return (
    <div className="space-y-8" dir={dir}>
      {/* Top header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {td("adminHome.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {td("adminHome.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {isLoading && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-medium text-violet-700 ring-1 ring-violet-100">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
              {td("adminHome.refreshingStats")}
            </span>
          )}
          {!isLoading && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-600 ring-1 ring-gray-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {td("common.liveData")}
            </span>
          )}
        </div>
      </div>

      {isError && !isLoading && (
        <p className="text-sm text-red-500">
          {td("adminHome.couldNotLoadStats")}
        </p>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card
          title={td("adminHome.totalUsers")}
          value={String(totalUsers)}
          subtitle={td("adminHome.totalUsersSubtitle")}
          accent="primary"
        />
        <Card
          title={td("adminHome.pendingApprovals")}
          value={String(pendingApprovals)}
          subtitle={td("adminHome.pendingApprovalsSubtitle", { percent: pendingUserPct.toFixed(0) })}
          accent="warning"
        />
        <Card
          title={td("adminHome.activeSellers")}
          value={String(stats.activeSellers ?? 0)}
          subtitle={td("adminHome.activeSellersSubtitle")}
          accent="success"
        />
        <Card
          title={td("adminHome.totalOrders")}
          value={String(totalOrders)}
          subtitle={td("adminHome.totalOrdersSubtitle", { percent: pendingOrderPct.toFixed(0) })}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users graph */}
        <section className="relative overflow-hidden rounded-2xl border border-violet-100 bg-linear-to-br from-violet-50 via-white to-indigo-50 shadow-sm p-6">
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.15),transparent_60%),radial-gradient(circle_at_bottom,rgba(37,99,235,0.12),transparent_55%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {td("adminHome.usersOverview")}
                <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-violet-600 ring-1 ring-violet-100">
                  {td("common.live")}
                </span>
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {td("adminHome.usersOverviewSubtitle")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-500">{td("adminHome.totalUsersShort")}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalUsers}
              </p>
              <p className="mt-1 text-[11px] text-violet-600 font-medium">
                {td("adminHome.pendingShort", { percent: pendingUserPct.toFixed(0) })}
              </p>
            </div>
          </div>

          <div className="relative mt-5 space-y-4">
            <div>
              <div className="flex justify-between text-[11px] text-gray-600 mb-1.5">
                <span>{td("adminHome.pendingApprovalsShort")}</span>
                <span className="font-medium">
                  {pendingApprovals} / {totalUsers || 1}
                </span>
              </div>
              <div className="h-3 rounded-full bg-white/80 shadow-inner overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-amber-400 via-orange-400 to-pink-500 transition-all duration-500"
                  style={{ width: `${pendingUserPct}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>{td("adminHome.pending")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                <span>{td("adminHome.verified")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Orders graph */}
        <section className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-linear-to-br from-emerald-50 via-white to-cyan-50 shadow-sm p-6">
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_60%),radial-gradient(circle_at_bottom,rgba(6,182,212,0.14),transparent_55%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {td("adminHome.ordersOverview")}
                <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-emerald-600 ring-1 ring-emerald-100">
                  {td("common.today")}
                </span>
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {td("adminHome.ordersOverviewSubtitle")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-500">{td("adminHome.totalOrdersShort")}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalOrders}
              </p>
              <p className="mt-1 text-[11px] text-emerald-600 font-medium">
                {td("adminHome.pendingShort", { percent: pendingOrderPct.toFixed(0) })}
              </p>
            </div>
          </div>

          <div className="relative mt-5 space-y-4">
            <div>
              <div className="flex justify-between text-[11px] text-gray-600 mb-1.5">
                <span>{td("adminHome.pendingOrdersShort")}</span>
                <span className="font-medium">
                  {pendingOrders} / {totalOrders || 1}
                </span>
              </div>
              <div className="h-3 rounded-full bg-white/80 shadow-inner overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-emerald-400 via-lime-400 to-cyan-500 transition-all duration-500"
                  style={{ width: `${pendingOrderPct}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>{td("adminHome.pending")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                <span>{td("adminHome.completedShort")} / {td("common.all")}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
