"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { clearGuestCart, hasStoredAuth } from "@/lib/cartStorage";

const SUCCESS_URL = "/checkout/success";
const PAYMENT_SUCCESS_KEY = "checkout:last-payment-success";
const ORDER_SUCCESS_KEY = "checkout:last-order";
const NGENIUS_PENDING_CHECKOUT_KEY = "checkout:pending-ngenius";
const REDIRECT_TIMEOUT_MS = 1200;
const CART_CLEAR_TIMEOUT_MS = 800;

export default function PaymentReturnPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("finalizing");

  useEffect(() => {
    const ref = searchParams.get("ref");
    let redirected = false;

    const redirectToHome = () => {
      if (redirected) return;
      redirected = true;
      const target = ref
        ? `${SUCCESS_URL}?ref=${encodeURIComponent(ref)}`
        : SUCCESS_URL;
      window.location.replace(target);
    };

    const fallbackTimer = window.setTimeout(() => {
      redirectToHome();
    }, REDIRECT_TIMEOUT_MS);

    //========================= API CALLS ==========================//
    //==============================================================//
    const clearAndRedirect = async () => {
      try {
        clearGuestCart();

        const isAuthenticated = hasStoredAuth();

        const pendingRaw = window.sessionStorage.getItem(
          NGENIUS_PENDING_CHECKOUT_KEY,
        );
        const pending = pendingRaw ? (JSON.parse(pendingRaw) as any) : null;

        if (isAuthenticated) {
          // If we have a shipping snapshot, place the order from the server cart now.
          const shipping = pending?.shipping;
          if (shipping) {
            try {
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

              window.sessionStorage.setItem(
                ORDER_SUCCESS_KEY,
                JSON.stringify({
                  customerEmail:
                    pending?.customerEmail || shipping.email || "",
                  customerName:
                    pending?.customerName ||
                    `${shipping.firstName || ""} ${shipping.lastName || ""}`.trim(),
                  orders: Array.isArray(createdOrders) ? createdOrders : [],
                  shippingAddress: pending?.shippingAddress || "",
                  totalAmount: pending?.totalAmount || 0,
                  placedAt: new Date().toISOString(),
                }),
              );
            } catch {
              // If placing order fails (e.g., cart already emptied), keep going.
            }
          }

          // Clear any remaining active cart items quickly (best-effort).
          await Promise.race([
            api.delete("/addToCart"),
            new Promise((resolve) =>
              window.setTimeout(resolve, CART_CLEAR_TIMEOUT_MS),
            ),
          ]);
        }

        try {
          window.sessionStorage.removeItem(NGENIUS_PENDING_CHECKOUT_KEY);
        } catch {
          // ignore
        }

        window.sessionStorage.setItem(
          PAYMENT_SUCCESS_KEY,
          JSON.stringify({
            message: "Payment completed successfully.",
            ref: ref || pending?.orderReference || null,
            placedAt: new Date().toISOString(),
          }),
        );
      } catch {
        // Redirect anyway; the payment itself already succeeded.
      } finally {
        window.clearTimeout(fallbackTimer);
        setStatus("done");
        redirectToHome();
      }
    };

    if (!ref) {
      setStatus("missing-ref");
    }

    clearAndRedirect();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fafc,#ffffff)] px-4">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Payment confirmed</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">Finalizing your order</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {status === "missing-ref"
            ? "Return information is missing. Redirecting you to the checkout success screen."
            : "Your cart is being cleared and you will be redirected to the checkout success screen."}
        </p>
      </div>
    </div>
  );
}
