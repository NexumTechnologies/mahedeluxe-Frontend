"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

type CustomerProfile = {
  profile_image?: string | null;
};

type CustomerRow = {
  id: number;
  name: string;
  email: string;
  role?: string;
  is_varified?: boolean;
  Customer?: CustomerProfile;
};

type UsersResponse = {
  data?: {
    items?: CustomerRow[];
    pagination?: {
      totalItems?: number;
    };
  };
};

type SelectedUserState =
  | null
  | { error: true; message: string }
  | (CustomerRow & { is_varified?: boolean });

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

export default function AdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [unverifiedOnly, setUnverifiedOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SelectedUserState>(null);
  const size = 10;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users", "user", page, size, debouncedSearch],
    queryFn: async () => {
      const resp = await api.get(`/users`, {
        // backend user role enum uses 'user' for generic customers
        params: { role: "user", page, size, search: debouncedSearch },
      });
      return resp.data;
    },
  });

  const payload = data as UsersResponse | undefined;
  let users = payload?.data?.items ?? [];
  // exclude admins just in case
  users = users.filter((u) => u.role !== "admin");
  const pagination = payload?.data?.pagination;
  const total = pagination?.totalItems ?? 0;
  const start = total === 0 ? 0 : (page - 1) * size + 1;
  const end = Math.min(page * size, total || 0);

  if (unverifiedOnly) {
    users = users.filter((u) => !u.is_varified);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer accounts.</p>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email"
              className="px-3 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={unverifiedOnly} onChange={(e) => setUnverifiedOnly(e.target.checked)} className="w-4 h-4" />
            <span>Unverified only</span>
          </label>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">Failed to load customers</div>
        ) : (
          <>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="text-sm text-gray-600">Showing {start}-{end} of {total}</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Per page: {size}</span>
              </div>
            </div>

            <div className="p-4">
          {/* Modal */}
          {modalOpen && (
            <div className="app-modal-overlay">
              <div className="app-modal-panel z-10 max-w-2xl">
                <div className="flex items-start justify-between border-b px-6 py-4">
                  <h3 className="text-lg font-semibold">Customer details</h3>
                  <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700">Close</button>
                </div>

                <div className="app-modal-scroll px-6 py-4">
                  {!selectedUser ? (
                    <div className="text-center py-6">Loading details...</div>
                  ) : isErrorState(selectedUser) ? (
                    <div className="text-red-600">{selectedUser.message || 'Failed to load'}</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Name</div>
                        <div className="font-medium">{selectedUser.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium">{selectedUser.email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Role</div>
                        <div className="font-medium">{selectedUser.role}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Verified</div>
                        <div className="font-medium">{selectedUser.is_varified ? 'Yes' : 'No'}</div>
                      </div>
                      {/* additional details removed per request */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
              <ul className="divide-y">
                {users.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-700">
                        {c.Customer?.profile_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.Customer.profile_image} alt={c.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          initials(c.name)
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-sm text-gray-500">{c.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        {c.is_varified ? (
                          <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm">
                            <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">Not verified</span>
                        )}
                      </div>

                      <button
                        onClick={async () => {
                          setModalOpen(true);
                          setSelectedUser(null);
                          try {
                            const resp = await api.get(`/users/${c.id}`);
                            setSelectedUser((resp.data?.data || resp.data) as SelectedUserState);
                          } catch {
                            // show minimal feedback in modal
                            setSelectedUser({ error: true, message: 'Failed to load details' });
                          }
                        }}
                        className="inline-flex items-center gap-2 text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
                      >
                        View
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Total: {total}</div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-3 py-1 border rounded bg-gray-50">Page {page}</span>
                <button
                  disabled={page >= Math.ceil((total || 0) / size)}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
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
