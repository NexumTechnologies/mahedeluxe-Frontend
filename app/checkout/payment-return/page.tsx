"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { clearGuestCart, hasStoredAuth } from "@/lib/cartStorage";

const HOME_URL = "https://mahedeluxe.ae/";
const PAYMENT_SUCCESS_KEY = "checkout:last-payment-success";
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
      window.location.replace(HOME_URL);
    };

    if (!ref) {
      setStatus("missing-ref");
      redirectToHome();
      return;
    }

    const fallbackTimer = window.setTimeout(() => {
      redirectToHome();
    }, REDIRECT_TIMEOUT_MS);

    const clearAndRedirect = async () => {
      try {
        clearGuestCart();

        if (hasStoredAuth()) {
          await Promise.race([
            api.delete("/addToCart"),
            new Promise((resolve) => window.setTimeout(resolve, CART_CLEAR_TIMEOUT_MS)),
          ]);
        }

        window.sessionStorage.removeItem("checkout:last-order");
        window.sessionStorage.setItem(
          PAYMENT_SUCCESS_KEY,
          JSON.stringify({
            message: "Payment completed successfully.",
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

    clearAndRedirect();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fafc,#ffffff)] px-4">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Payment confirmed</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">Finalizing your order</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {status === "missing-ref"
            ? "Return information is missing. Redirecting you to the homepage."
            : "Your cart is being cleared and you will be redirected to the homepage."}
        </p>
      </div>
    </div>
  );
}
