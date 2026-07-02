"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useI18n } from "@/components/LanguageProvider";
import { translateDashboard } from "@/lib/dashboard-i18n";

type AdminRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_varified?: boolean;
  profile_image?: string | null;
};

type UsersResponse = {
  data?: {
    items?: AdminRow[];
    pagination?: {
      totalItems?: number;
    };
  };
};

type SelectedUserState =
  | null
  | { error: true; message: string }
  | AdminRow;

function isErrorState(value: SelectedUserState): value is { error: true; message: string } {
  return Boolean(value && typeof value === "object" && "error" in value);
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export default function AdminUsersAdminsPage() {
  const { dir, locale } = useI18n();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SelectedUserState>(null);
  const size = 10;
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  //========================= API CALLS ==========================//
  //==============================================================//
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users", "admin", page, size, debouncedSearch],
    queryFn: async () => {
      const resp = await api.get(`/users`, {
        params: { role: "admin", page, size, search: debouncedSearch },
      });
      return resp.data;
    },
  });

  const payload = data as UsersResponse | undefined;
  const users = payload?.data?.items ?? [];
  const pagination = payload?.data?.pagination;
  const total = pagination?.totalItems ?? 0;
  const start = total === 0 ? 0 : (page - 1) * size + 1;
  const end = Math.min(page * size, total || 0);

  return (
    <div className="space-y-4" dir={dir}>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{td("adminUsers.title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{td("adminUsers.subtitle")}</p>
        </div>
        <div>
          <Link href="#" className="text-sm text-[#7c3aed]">{td("adminUsers.addAdmin")}</Link>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center">{td("common.loading")}</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{td("adminUsers.failed")}</div>
        ) : (
          <>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="text-sm text-gray-600">{td("common.showingRange", { start, end, total })}</div>
              <div className="flex items-center gap-2">
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder={td("common.searchByNameOrEmail")}
                  className="px-3 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            <div className="p-4">
              <ul className="divide-y">
                {users.map((u) => (
                  <li key={u.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-700">
                        {u.profile_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.profile_image} alt={u.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          initials(u.name)
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">{u.role}</div>
                      <button
                        onClick={async () => {
                          setModalOpen(true);
                          setSelectedUser(null);
                          try {
                            const resp = await api.get(`/users/${u.id}`);
                            setSelectedUser((resp.data?.data || resp.data) as SelectedUserState);
                          } catch {
                            setSelectedUser({ error: true, message: td("adminUsers.failedToLoadDetails") });
                          }
                        }}
                        className="inline-flex items-center gap-2 text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
                      >
                        {td("common.view")}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">{td("common.total", { total })}</div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  {td("common.prev")}
                </button>
                <span className="px-3 py-1 border rounded bg-gray-50">{td("common.page", { page })}</span>
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

      {modalOpen && (
        <div className="app-modal-overlay">
          <div className="app-modal-panel z-10 max-w-2xl">
            <div className="flex items-start justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold">{td("adminUsers.adminDetails")}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700">{td("common.close")}</button>
            </div>

            <div className="app-modal-scroll px-6 py-4">
              {!selectedUser ? (
                <div className="text-center py-6">{td("adminUsers.loadingDetails")}</div>
              ) : isErrorState(selectedUser) ? (
                <div className="text-red-600">{selectedUser.message || td("adminUsers.failedToLoadDetails")}</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">{td("adminUsers.name")}</div>
                    <div className="font-medium">{selectedUser.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{td("common.email")}</div>
                    <div className="font-medium">{selectedUser.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{td("common.role")}</div>
                    <div className="font-medium">{selectedUser.role}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{td("adminUsers.verified")}</div>
                    <div className="font-medium">{selectedUser.is_varified ? td("common.yes") : td("common.no")}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
