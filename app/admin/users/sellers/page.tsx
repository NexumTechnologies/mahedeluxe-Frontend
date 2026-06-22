"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useI18n } from "@/components/LanguageProvider";
import { translateDashboard } from "@/lib/dashboard-i18n";

type SellerProfile = {
  profile_image?: string | null;
  verification_status?: string | null;
  approved_at?: string | null;
  created_at?: string | null;
};

type SellerRow = {
  id: number;
  name: string;
  email: string;
  created_at?: string | null;
  is_varified?: boolean;
  productsCount?: number;
  ordersReceived?: number;
  Seller?: SellerProfile;
};

type UsersResponse = {
  data?: {
    items?: SellerRow[];
    pagination?: {
      totalItems?: number;
    };
  };
};

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

export default function AdminSellersPage() {
  const { dir, locale } = useI18n();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const size = 10;
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users", "seller", page, size, debouncedSearch],
    queryFn: async () => {
      const resp = await api.get(`/users`, {
        params: { role: "seller", page, size, search: debouncedSearch },
      });
      return resp.data;
    },
  });
  const payload = data as UsersResponse | undefined;
  const rawUsers = payload?.data?.items ?? [];
  const pagination = payload?.data?.pagination;
  const users = rawUsers.filter((b) => {
    const verificationStatus = b.Seller?.verification_status;
    if (statusFilter === "approved") return verificationStatus === "approved" || b.is_varified === true;
    if (statusFilter === "rejected") return verificationStatus === "rejected";
    if (statusFilter === "pending") {
      return verificationStatus === "pending" || (b.is_varified !== true && verificationStatus !== "rejected");
    }
    return true;
  });
  const total = users.length;
  const start = total === 0 ? 0 : (page - 1) * size + 1;
  const end = Math.min(page * size, total || 0);

  return (
    <div className="space-y-6" dir={dir}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {td("adminSellers.title")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {td("adminSellers.subtitle")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="hidden sm:block text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 ring-1 ring-gray-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {td("adminSellers.totalSellers", { total })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <Link
                href="/admin/approvals/sellers"
                className="text-sm font-medium text-[#7c3aed] hover:text-[#5b21b6]"
              >
                {td("adminSellers.viewApprovals")}
              </Link>
            </div>
            <div>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={td("common.searchByNameOrEmail")}
                className="px-3 py-2 border border-gray-200 rounded-lg w-64 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { value: "all", label: td("common.all") },
          { value: "approved", label: td("common.verified") },
          { value: "pending", label: td("common.notVerified") },
          { value: "rejected", label: td("common.rejected") },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setStatusFilter(item.value as typeof statusFilter);
              setPage(1);
            }}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === item.value
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {isLoading ? (
          <div className="p-6 text-center">{td("common.loading")}</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            {td("adminSellers.failed")}
          </div>
        ) : (
          <>
            <div className="p-4 border-b flex items-center justify-between bg-gray-50/60">
              <div className="text-sm text-gray-600">
                {td("common.showingRange", { start, end, total })}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{td("common.perPage", { size })}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50/60">
              {users.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  {td("adminSellers.empty")}
                </div>
              ) : (
                <ul className="space-y-3">
                  {users.map((b) => (
                    <li
                      key={b.id}
                      className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-px hover:shadow-md lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-lg font-semibold text-indigo-700 overflow-hidden">
                          {b.Seller?.profile_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={b.Seller.profile_image}
                              alt={b.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            initials(b.name)
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{b.name}</div>
                          <div className="text-sm text-gray-500">{b.email}</div>
                          <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                            <span>
                              {td("adminSellers.products")}
                              <span className="ml-1 font-medium text-gray-900">
                                {b.productsCount ?? 0}
                              </span>
                            </span>
                            <span>
                              {td("adminSellers.ordersReceived")}
                              <span className="ml-1 font-medium text-gray-900">
                                {b.ordersReceived ?? 0}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                        <div className="lg:flex-1 lg:px-6">
                          <div className="text-xs text-gray-500">Approval request Date</div>
                          <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(b.Seller?.created_at ?? b.created_at)}
                          </div>
                        </div>

                      <div className="flex items-center gap-3 sm:gap-4 lg:shrink-0">
                        <div>
                          {b.Seller?.verification_status === "approved" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {td("common.verified")}
                            </span>
                          ) : b.Seller?.verification_status === "rejected" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-red-100">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              {td("common.rejected")}
                            </span>
                          ) : b.is_varified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {td("common.verified")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              {td("common.notVerified")}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/admin/users/sellers/${b.id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
                        >
                          {td("common.view")}
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 flex items-center justify-between bg-white border-t border-gray-100">
              <div className="text-sm text-gray-600">{td("common.total", { total })}</div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  {td("common.prev")}
                </button>
                <span className="px-3 py-1 border rounded bg-gray-50">
                  {td("common.page", { page })}
                </span>
                <button
                  disabled={page >= Math.ceil((total || 0) / size)}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  {td("common.next")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
