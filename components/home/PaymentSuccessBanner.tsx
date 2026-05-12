"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

const PAYMENT_SUCCESS_KEY = "checkout:last-payment-success";

type PaymentSuccessPayload = {
  message?: string;
  placedAt?: string;
};

export default function PaymentSuccessBanner() {
  const [payload, setPayload] = useState<PaymentSuccessPayload | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(PAYMENT_SUCCESS_KEY);
      if (!raw) return;

      window.sessionStorage.removeItem(PAYMENT_SUCCESS_KEY);
      setPayload(JSON.parse(raw) as PaymentSuccessPayload);
    } catch {
      window.sessionStorage.removeItem(PAYMENT_SUCCESS_KEY);
    }
  }, []);

  if (!payload) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 shadow-sm">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Payment successful</p>
          <p className="text-sm text-emerald-800">
            {payload.message || "Your payment was completed successfully. You can continue browsing."}
          </p>
        </div>
      </div>
    </div>
  );
}
