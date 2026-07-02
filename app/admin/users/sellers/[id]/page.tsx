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

export default function SellerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSelected, setPreviewSelected] = useState(0);
  const [fullOpen, setFullOpen] = useState(false);

  //========================= API CALLS ==========================//
  //==============================================================//
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-user", "seller", id],
    queryFn: async () => {
      const resp = await api.get(`/users/role/seller/${id}`);
      return resp.data;
    },
    enabled: !!id,
  });

  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  const approveSellerMutation = useMutation({
    mutationFn: async () => {
      const user = data?.data;
      const seller = user?.Seller;

      let userResp: any = null;
      let sellerResp: any = null;

      if (!user?.is_varified) {
        const resp = await api.patch(`/users/${id}/toggle-status`);
        userResp = resp.data;
      }

      if (seller?.id && seller?.verification_status !== "approved") {
        const resp = await api.put("/seller/status", {
          seller_id: seller.id,
          verification_status: "approved",
        });
        sellerResp = resp.data;
      }

      return { userResp, sellerResp };
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", "seller", id] });
      setToast({
        show: true,
        message:
          res?.sellerResp?.message ||
          res?.userResp?.message ||
          "Seller approved successfully",
      });
      setTimeout(() => setToast({ show: false, message: "" }), 3000);
    },
  });

  const sellerStatusMutation = useMutation({
    mutationFn: async ({ sellerId, status }: { sellerId: number; status: "approved" | "rejected" }) => {
      const resp = await api.put("/seller/status", {
        seller_id: sellerId,
        verification_status: status,
      });
      return resp.data;
    },
    onSuccess: (res, variables) => {
      const updatedSeller = res?.data || {};
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", "seller", id] });
      queryClient.setQueryData(["admin-user", "seller", id], (old: unknown) => {
        const previous = (old as { data?: { Seller?: Record<string, unknown> } } | undefined) ?? undefined;
        if (!previous?.data) return old;
        return {
          ...previous,
          data: {
            ...previous.data,
            Seller: {
              ...(previous.data.Seller ?? {}),
              ...((updatedSeller as Record<string, unknown>) ?? {}),
            },
          },
        };
      });
      setToast({
        show: true,
        message: res?.message || `Seller ${variables.status} successfully`,
      });
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
      router.push("/admin/users/sellers");
    },
  });

  const userToggleMutation = useMutation({
    mutationFn: async () => {
      const resp = await api.patch(`/users/${id}/toggle-status`);
      return resp.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", "seller", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setToast({ show: true, message: res?.message || "User status updated" });
      setTimeout(() => setToast({ show: false, message: "" }), 3000);
    },
  });

  const [confirm, setConfirm] = useState<{ open: boolean; action: "suspend" | "delete" | null }>({ open: false, action: null });

  const user = data?.data;
  const seller = user?.Seller;
  const sellerStatus = seller?.verification_status ?? null;
  const showApproveRejectActions = sellerStatus === null || sellerStatus === "pending" || typeof sellerStatus === "undefined";
  const documents = seller?.documents as
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
  const availableDocItems = docItems.filter((item) => item.url);

  const isImageUrl = (value?: string) =>
    typeof value === "string" &&
    /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(value);

  const isPdfUrl = (value?: string) =>
    typeof value === "string" && /\.pdf(\?.*)?$/i.test(value);
  
  const getPdfPreviewSrc = (value: string) =>
    `/api/document?url=${encodeURIComponent(value)}`;

  const getDocumentHref = (value: string) =>
    isPdfUrl(value) ? getPdfPreviewSrc(value) : value;

  const openPreview = (index: number) => {
    setPreviewSelected(index);
    setPreviewOpen(true);
  };

  const selectedPreviewDoc = availableDocItems[previewSelected];

  return (
    <div className="space-y-6">
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
          <h1 className="text-2xl font-semibold">Seller profile</h1>
          <p className="text-sm text-gray-500 mt-1">Detailed account and profile information</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-sm text-gray-600 hover:text-gray-800">ÃƒÂ¢Ã¢â‚¬Â Ã‚Â Back</button>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-md p-6">
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">Failed to load seller</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="w-36 h-36 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-3xl font-semibold text-gray-700">
                <div>{initials(user?.name)}</div>
              </div>

              <div className="text-center md:text-left">
                <div className="text-lg font-bold">{user?.name || "-"}</div>
                <div className="text-sm text-gray-500">{user?.email || "-"}</div>
              </div>

              <div className="mt-2">
                {seller ? (
                  // Prefer seller's verification status when seller profile exists
                  seller.verification_status === "approved" ? (
                    <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                      <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Verified
                    </span>
                  ) : seller.verification_status === "rejected" ? (
                    <span className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Rejected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-sm ring-1 ring-amber-100">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Not verified
                    </span>
                  )
                ) : (
                  // Fallback to user's is_varified when no seller profile
                  user?.is_varified ? (
                    <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                      <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-sm ring-1 ring-amber-100">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Not verified
                    </span>
                  )
                )}
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
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Seller profile</h3>
                {!seller ? (
                  <div className="p-4 border rounded-lg text-sm text-gray-500">
                    No seller profile is linked to this user.
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="text-xs text-gray-500">Verification status</span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          seller.verification_status === "approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : seller.verification_status === "rejected"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {seller.verification_status
                          ? seller.verification_status.charAt(0).toUpperCase() +
                            seller.verification_status.slice(1)
                          : "Pending"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-xs text-gray-500">Shop name</div>
                        <div className="mt-1 font-medium">{seller.shop_name || "-"}</div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="text-xs text-gray-500">Business type</div>
                        <div className="mt-1 font-medium">{seller.business_type || "-"}</div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="text-xs text-gray-500">Business email</div>
                        <div className="mt-1 font-medium">{seller.business_email || "-"}</div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="text-xs text-gray-500">Business phone</div>
                        <div className="mt-1 font-medium">{seller.business_phone || "-"}</div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="text-xs text-gray-500">Address</div>
                        <div className="mt-1 font-medium">{seller.business_address || "-"}</div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="text-xs text-gray-500">City / Country</div>
                        <div className="mt-1 font-medium">{seller.city}, {" "}{seller.country}</div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="text-xs text-gray-500">ID card number</div>
                        <div className="mt-1 font-medium">{seller.id_card_number || "-"}</div>
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
                                <button
                                  type="button"
                                  onClick={() => {
                                    const docIndex = availableDocItems.findIndex(
                                      (item) => item.label === d.label && item.url === d.url,
                                    );
                                    openPreview(docIndex >= 0 ? docIndex : 0);
                                  }}
                                  className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                  View document
                                </button>
                              ) : (
                                <div className="text-sm text-gray-400">Not provided</div>
                              )}
                            </div>

                            {d.url && isImageUrl(d.url) && (
                              <button
                                type="button"
                                onClick={() => {
                                  const docIndex = availableDocItems.findIndex(
                                    (item) => item.label === d.label && item.url === d.url,
                                  );
                                  openPreview(docIndex >= 0 ? docIndex : 0);
                                }}
                                className="mt-3 block overflow-hidden rounded-md border bg-gray-50 hover:opacity-90"
                                aria-label={`Preview ${d.label}`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={d.url}
                                  alt={d.label}
                                  className="w-full h-28 object-cover"
                                />
                              </button>
                            )}

                            {d.url && isPdfUrl(d.url) && (
                              <button
                                type="button"
                                onClick={() => {
                                  const docIndex = availableDocItems.findIndex(
                                    (item) => item.label === d.label && item.url === d.url,
                                  );
                                  openPreview(docIndex >= 0 ? docIndex : 0);
                                }}
                                className="mt-3 flex h-28 w-full items-center justify-center rounded-md border border-dashed bg-gray-50 px-4 text-center text-sm font-medium text-red-600 hover:bg-gray-100"
                              >
                                PDF document
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {showApproveRejectActions && (
                        <>
                          <button
                            onClick={() => approveSellerMutation.mutate()}
                            disabled={approveSellerMutation.status === "pending"}
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60"
                          >
                            {approveSellerMutation.status === "pending" && (
                              <span
                                className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white"
                                aria-hidden="true"
                              />
                            )}
                            {approveSellerMutation.status === "pending"
                              ? "Approving..."
                              : "Approve seller"}
                          </button>

                          <button
                            onClick={() =>
                              sellerStatusMutation.mutate({
                                sellerId: seller.id,
                                status: "rejected",
                              })
                            }
                            disabled={sellerStatusMutation.status === "pending"}
                            className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm disabled:opacity-60"
                          >
                            Reject seller
                          </button>
                        </>
                      )}
                      <div className="ml-2 inline-flex gap-2">
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
                  </>
                )}
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
                    await userToggleMutation.mutateAsync();
                  }
                  setConfirm({ open: false, action: null });
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
              >
                {deleteMutation.status === "pending" || userToggleMutation.status === "pending"
                  ? "Processing..."
                  : confirm.action === "delete"
                  ? "Delete"
                  : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setPreviewOpen(false);
              setFullOpen(false);
            }}
          />
          <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <div className="text-sm font-medium">Document preview</div>
              <div className="flex items-center gap-3">
                {selectedPreviewDoc?.url ? (
                  <a
                    href={getDocumentHref(selectedPreviewDoc.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Open in new tab
                  </a>
                ) : null}
                <button
                  type="button"
                  className="text-sm text-gray-600"
                  onClick={() => {
                    setPreviewOpen(false);
                    setFullOpen(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
              <div className="md:col-span-2">
                {!selectedPreviewDoc?.url ? (
                  <div className="p-8 text-center text-sm text-gray-500">No document available</div>
                ) : isImageUrl(selectedPreviewDoc.url) ? (
                  <button
                    type="button"
                    onClick={() => setFullOpen(true)}
                    className="block w-full overflow-hidden rounded-md bg-gray-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedPreviewDoc.url}
                      alt={selectedPreviewDoc.label}
                      className="h-120 w-full object-contain bg-gray-50"
                    />
                  </button>
                ) : isPdfUrl(selectedPreviewDoc.url) ? (
                  <div className="space-y-3">
                    <iframe
                      key={selectedPreviewDoc.url}
                      src={getPdfPreviewSrc(selectedPreviewDoc.url)}
                      title={selectedPreviewDoc.label}
                      className="h-130 w-full rounded-md border"
                    />
                    <div className="text-xs text-gray-500">
                      If the PDF does not load in your browser, use "Open in new tab".
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border p-6 text-sm">
                    <a
                      href={getDocumentHref(selectedPreviewDoc.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600"
                    >
                      Open document in new tab
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-1">
                {availableDocItems.map((doc, index) => (
                  <button
                    key={doc.label + index}
                    type="button"
                    onClick={() => {
                      setPreviewSelected(index);
                      setFullOpen(false);
                    }}
                    className={`w-full rounded p-2 text-left ${index === previewSelected ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  >
                    <div className="text-sm font-medium">{doc.label}</div>
                    <div className="truncate text-xs text-gray-500">{doc.url}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {fullOpen && selectedPreviewDoc?.url && isImageUrl(selectedPreviewDoc.url) && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setFullOpen(false)} />
          <div className="relative z-10 flex max-h-[96vh] w-full max-w-[96vw] items-center justify-center overflow-hidden rounded bg-black">
            <button
              type="button"
              className="absolute left-3 top-3 z-20 rounded-full bg-black/40 p-2 text-white"
              onClick={() => setFullOpen(false)}
            >
              Close
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPreviewDoc.url}
              alt={selectedPreviewDoc.label}
              className="max-h-[92vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
