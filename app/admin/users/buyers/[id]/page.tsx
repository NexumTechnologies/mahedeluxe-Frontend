"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export default function BuyerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-user", "buyer", id],
    queryFn: async () => {
      const resp = await api.get(`/users/role/buyer/${id}`);
      return resp.data;
    },
    enabled: !!id,
  });

  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  const toggleMutation = useMutation({
    mutationFn: async () => {
      const resp = await api.patch(`/users/${id}/toggle-status`);
      return resp.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", "buyer", id] });
      // update cache and show toast
      queryClient.setQueryData(["admin-user", "buyer", id], (old: unknown) => {
        const updated = (res as { data?: unknown })?.data ?? {};
        const previous = (old as { [key: string]: unknown }) ?? {};
        return { ...previous, data: updated };
      });
      setToast({ show: true, message: res?.message || "User status updated" });
      setTimeout(() => setToast({ show: false, message: "" }), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const resp = await api.delete(`/users/${id}`);
      return resp.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setToast({ show: true, message: res?.message || "User deleted" });
      setTimeout(() => setToast({ show: false, message: "" }), 3000);
      router.push("/admin/users/buyers");
    },
  });

  const [confirm, setConfirm] = useState<{ open: boolean; action: "suspend" | "delete" | null }>({ open: false, action: null });

  const user = data?.data;
  const buyer = user?.Buyer;
  const documents = buyer?.documents as
    | {
        business_license_url?: string;
        tax_certificate_url?: string;
        factory_photo_url?: string;
        [key: string]: unknown;
      }
    | undefined;

  const docItems: Array<{ label: string; url?: string }> = [
    { label: "Business license", url: documents?.business_license_url },
    { label: "Tax certificate", url: documents?.tax_certificate_url },
    { label: "Factory / Warehouse photo", url: documents?.factory_photo_url },
  ];

  const isImageUrl = (value?: string) =>
    typeof value === "string" &&
    /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(value);

  const isPdfUrl = (value?: string) =>
    typeof value === "string" && /\.pdf(\?.*)?$/i.test(value);

  const getDocumentHref = (value: string) =>
    isPdfUrl(value) ? `/api/document?url=${encodeURIComponent(value)}` : value;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50">
          <div className="flex items-center gap-3 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-sm font-medium">{toast.message}</div>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Buyer profile</h1>
          <p className="text-sm text-gray-500 mt-1">Detailed account and profile information</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-md p-6">
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">Failed to load buyer</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="w-36 h-36 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-3xl font-semibold text-gray-700">
                {buyer?.profile_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={buyer.profile_image} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <div>{initials(user?.name)}</div>
                )}
              </div>

              <div className="text-center md:text-left">
                <div className="text-lg font-bold">{user?.name || "-"}</div>
                <div className="text-sm text-gray-500">{user?.email || "-"}</div>
              </div>

              <div className="mt-2">
                {user?.is_varified ? (
                  <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                    <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <button
                    onClick={() => toggleMutation.mutate()}
                    disabled={toggleMutation.status === "pending"}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm disabled:opacity-60"
                  >
                    {toggleMutation.status === "pending" ? "Approving..." : "Approve buyer"}
                  </button>
                )}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setConfirm({ open: true, action: "suspend" })}
                  className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-sm"
                >
                  {user?.is_varified ? "Suspend user" : "Activate user"}
                </button>

                <button
                  onClick={() => setConfirm({ open: true, action: "delete" })}
                  className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm"
                >
                  Delete user
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-xs text-gray-500">Role</div>
                  <div className="mt-1 font-medium">{user?.role || "-"}</div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-xs text-gray-500">Last Login</div>
                  <div className="mt-1 font-medium">{formatDate(user?.last_login)}</div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-xs text-gray-500">Account Created</div>
                  <div className="mt-1 font-medium">{formatDate(user?.created_at)}</div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-xs text-gray-500">Email Verified</div>
                  <div className="mt-1 font-medium">{user?.is_varified ? "Yes" : "No"}</div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Buyer profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-xs text-gray-500">DOB</div>
                    <div className="mt-1 font-medium">{formatDate(buyer?.dob)}</div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="text-xs text-gray-500">Gender</div>
                    <div className="mt-1 font-medium">{buyer?.gender || "-"}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {docItems.map((d) => (
                    <div key={d.label} className="p-4 border rounded-lg">
                      <div className="text-xs text-gray-500">{d.label}</div>
                      <div className="mt-2">
                        {d.url ? (
                          <a
                            href={getDocumentHref(d.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            View document
                          </a>
                        ) : (
                          <div className="text-sm text-gray-400">Not provided</div>
                        )}
                      </div>

                      {d.url && isImageUrl(d.url) && (
                        <div className="mt-3 overflow-hidden rounded-md border bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={d.url}
                            alt={d.label}
                            className="w-full h-28 object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {confirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold">{confirm.action === "delete" ? "Delete user" : "Confirm status change"}</h3>
            <p className="mt-2 text-sm text-gray-600">
              {confirm.action === "delete"
                ? "This will permanently delete the user and cannot be undone. Are you sure?"
                : "Are you sure you want to change this user's account status?"}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirm({ open: false, action: null })}
                className="px-4 py-2 rounded-lg bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (confirm.action === "delete") {
                    deleteMutation.mutate();
                  } else if (confirm.action === "suspend") {
                    await toggleMutation.mutateAsync();
                    setToast({ show: true, message: "User status updated" });
                    setTimeout(() => setToast({ show: false, message: "" }), 3000);
                    queryClient.invalidateQueries({ queryKey: ["admin-user", "buyer", id] });
                    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
                  }
                  setConfirm({ open: false, action: null });
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
              >
                {deleteMutation.status === "pending" || toggleMutation.status === "pending"
                  ? "Processing..."
                  : confirm.action === "delete"
                  ? "Delete"
                  : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
