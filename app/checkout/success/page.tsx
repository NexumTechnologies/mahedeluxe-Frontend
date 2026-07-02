"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Mail,
  MapPin,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import api from "@/lib/axios";
import { hasStoredAuth } from "@/lib/cartStorage";
import { normalizeCheckoutNumber } from "@/lib/checkoutPricing";

type OrderSuccessItem = {
  id: number;
  quantity: number;
  total_amount: number;
  base_unit_price?: number | null;
  status?: string;
  Product?: {
    name?: string;
    image_url?: string | string[] | null;
  } | null;
};

type OrderSuccessPayload = {
  customerEmail?: string;
  customerName?: string;
  orders?: OrderSuccessItem[];
  shippingAddress?: string;
  totalAmount?: number;
  placedAt?: string;
};

const STORAGE_KEY = "checkout:last-order";
const NGENIUS_PENDING_CHECKOUT_KEY = "checkout:pending-ngenius";
const NGENIUS_PLACED_PREFIX = "checkout:ngenius-order-placed:";

const formatAED = (value: number) => `${Number(value || 0).toFixed(2)} AED`;

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<OrderSuccessPayload | null>(() => {
    if (typeof window === "undefined") return null;

    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as OrderSuccessPayload;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (payload?.orders?.length) return;
    if (typeof window === "undefined") return;
    if (!hasStoredAuth()) return;

    const ref = searchParams.get("ref") || "";

    let pending: any = null;
    try {
      const raw = window.sessionStorage.getItem(NGENIUS_PENDING_CHECKOUT_KEY);
      pending = raw ? (JSON.parse(raw) as any) : null;
    } catch {
      pending = null;
    }

    const orderReference = String(
      pending?.orderReference || ref || pending?.orderId || "",
    ).trim();

    if (!pending?.shipping) return;
    if (orderReference) {
      try {
        if (window.sessionStorage.getItem(NGENIUS_PLACED_PREFIX + orderReference)) {
          return;
        }
      } catch {
        // ignore
      }
    }

    let cancelled = false;

    //========================= API CALLS ==========================//
    //==============================================================//
    (async () => {
      try {
        const shipping = pending.shipping;
        const orderRes = await api.post("/order", {
          email: shipping.email,
          firstName: shipping.firstName,
          lastName: shipping.lastName,
          phone: shipping.phone,
          apartment: shipping.apartment,
          state: shipping.state,
          city: shipping.city,
          postalCode: shipping.postalCode,
          country: shipping.country,
        });

        const createdOrders =
          (orderRes as any)?.data?.data || (orderRes as any)?.data || [];

        const nextPayload: OrderSuccessPayload = {
          customerEmail: pending?.customerEmail || shipping.email || "",
          customerName:
            pending?.customerName ||
            `${shipping.firstName || ""} ${shipping.lastName || ""}`.trim(),
          orders: Array.isArray(createdOrders) ? createdOrders : [],
          shippingAddress: pending?.shippingAddress || "",
          totalAmount: pending?.totalAmount || 0,
          placedAt: new Date().toISOString(),
        };

        if (cancelled) return;

        setPayload(nextPayload);

        try {
          window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextPayload));
        } catch {
          // ignore
        }

        try {
          if (orderReference) {
            window.sessionStorage.setItem(
              NGENIUS_PLACED_PREFIX + orderReference,
              new Date().toISOString(),
            );
          }
          window.sessionStorage.removeItem(NGENIUS_PENDING_CHECKOUT_KEY);
        } catch {
          // ignore
        }
      } catch {
        // If placing order fails, we'll fall back to fetching latest orders below.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [payload?.orders?.length, searchParams]);

  useEffect(() => {
    if (payload?.orders?.length) return;
    if (typeof window === "undefined") return;
    if (!hasStoredAuth()) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await api.get("/order");
        const orders =
          (res as any)?.data?.data || (res as any)?.data || ([] as any[]);

        if (!Array.isArray(orders) || orders.length === 0) return;

        const sorted = [...orders].sort((a, b) => {
          const aTs = new Date(a?.createdAt || 0).getTime();
          const bTs = new Date(b?.createdAt || 0).getTime();
          return bTs - aTs;
        });

        const latestTs = new Date(sorted[0]?.createdAt || 0).getTime();
        const windowMs = 2 * 60 * 1000;
        const latestGroup = sorted.filter((order) => {
          const ts = new Date(order?.createdAt || 0).getTime();
          return Math.abs(ts - latestTs) <= windowMs;
        });

        const totalAmount = latestGroup.reduce(
          (sum, order) => sum + Number(order?.total_amount || 0),
          0,
        );

        const nextPayload: OrderSuccessPayload = {
          customerEmail: latestGroup[0]?.User?.email,
          customerName: latestGroup[0]?.User?.name,
          orders: latestGroup,
          shippingAddress: latestGroup[0]?.address,
          totalAmount,
          placedAt: latestGroup[0]?.createdAt,
        };

        if (cancelled) return;
        setPayload(nextPayload);

        try {
          window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextPayload));
        } catch {
          // ignore session storage failures
        }
      } catch {
        // ignore fetch failures
      }
    })();

    return () => {
      cancelled = true;
    };
    // include searchParams so a new ref triggers a retry
  }, [payload?.orders?.length, searchParams]);

  const items = useMemo(() => payload?.orders ?? [], [payload]);
  const orderNumbers = useMemo(
    () => items.map((item) => `#${item.id}`).join(", "),
    [items],
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc,#ffffff)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_35%),linear-gradient(135deg,#0f172a,#1d4ed8)] px-6 py-10 text-white sm:px-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Order complete</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your order has been placed successfully</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              A confirmation email has been prepared for {payload?.customerEmail || "your email address"}. Keep this page for your records while the admin and sellers process your request.
            </p>
          </div>

          <div className="grid gap-6 px-6 py-8 sm:px-10 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <ReceiptText className="h-4 w-4" />
                    Order refs
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-950">{orderNumbers || "Available after checkout"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <ShoppingBag className="h-4 w-4" />
                    Items
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-950">{items.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Mail className="h-4 w-4" />
                    Total
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-950">{formatAED(payload?.totalAmount || 0)}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-lg font-semibold text-slate-950">Order details</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <div className="px-5 py-8 text-sm text-slate-500">We could not load the order summary from this browser session, but the order request was submitted.</div>
                  ) : (
                    items.map((item) => {
                      const productName = item.Product?.name || "Product";
                      const quantity = Math.max(
                        1,
                        Math.floor(normalizeCheckoutNumber(item.quantity, 1)),
                      );
                      const unitPrice =
                        normalizeCheckoutNumber(item.total_amount, 0) / quantity;
                      const imageValue = item.Product?.image_url;
                      const imageSrc = Array.isArray(imageValue) ? imageValue[0] : imageValue;

                      return (
                        <div key={item.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                              {imageSrc ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imageSrc} alt={productName} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No image</div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-slate-950">{productName}</h3>
                              <p className="mt-1 text-sm text-slate-500">Order #{item.id} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Status: {item.status || "pending"}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm sm:min-w-70">
                            <div>
                              <div className="text-xs uppercase tracking-wide text-slate-400">Qty</div>
                              <div className="mt-1 font-semibold text-slate-900">{quantity}</div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-wide text-slate-400">Unit</div>
                              <div className="mt-1 font-semibold text-slate-900">{formatAED(unitPrice)}</div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-wide text-slate-400">Total</div>
                              <div className="mt-1 font-semibold text-slate-900">{formatAED(Number(item.total_amount) || 0)}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <MapPin className="h-4 w-4" />
                  Delivery information
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700">{payload?.shippingAddress || "No delivery summary was saved."}</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</div>
                <p className="mt-3 text-sm font-semibold text-slate-950">{payload?.customerName || "Customer"}</p>
                <p className="mt-1 text-sm text-slate-600">{payload?.customerEmail || "Email not available"}</p>
                {payload?.placedAt && (
                  <p className="mt-3 text-xs text-slate-400">Placed on {new Date(payload.placedAt).toLocaleString()}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Link href="/buyer/dashboard/orders" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  View my orders
                </Link>
                <Link href="/browse" className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Continue browsing
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
