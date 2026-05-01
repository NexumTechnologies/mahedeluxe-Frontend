"use client";

import { ChevronRight } from "lucide-react";
import { formatAED } from "@/lib/utils";
import { useI18n } from "@/components/LanguageProvider";

interface OrderSummaryProps {
  items: any[];
  totalItems?: number;
  itemSubtotal?: number;
  isLoading?: boolean;
  hasError?: boolean;
  canPay?: boolean;
  onPayNow?: () => void;
}

export default function OrderSummary({
  items,
  totalItems,
  itemSubtotal,
  isLoading,
  hasError,
  canPay,
  onPayNow,
}: OrderSummaryProps) {
  const itemCount = totalItems ?? items.length ?? 0;
  const subtotal = itemSubtotal ?? 0;
  const { dir, t } = useI18n();

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 shadow-sm" dir={dir}>
      <h2 className="text-lg sm:text-xl font-semibold text-slate-950">{t("checkout.orderSummary")}</h2>

      <div className="mt-5 space-y-3 border-b border-slate-200 pb-4 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>{t("checkout.items")} ({itemCount})</span>
          <span className="font-medium text-slate-900">{formatAED(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>{t("checkout.shipping")}</span>
          <span className="font-medium text-slate-900">{t("checkout.calculatedLater")}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-base sm:text-lg font-semibold text-slate-950">{t("checkout.orderTotal")}</span>
        <span className="text-xl sm:text-2xl font-semibold text-slate-950">{formatAED(subtotal)}</span>
      </div>

      <button
        className="mt-4 inline-flex h-10 sm:h-11 w-full items-center justify-center gap-2 rounded-md bg-amber-400 text-sm sm:text-base font-medium text-slate-950 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!canPay || itemCount === 0}
        onClick={onPayNow}
      >
        <span>{itemCount === 0 ? t("checkout.addItemsToContinue") : t("checkout.proceedToOrder")}</span>
        {itemCount > 0 && <ChevronRight className="h-4 w-4" />}
      </button>

      <p className="mt-3 text-xs text-slate-500">
        {t("checkout.placingOrderAgreement")}
      </p>

      {hasError && (
        <p className="mt-3 text-sm text-red-600">
          {t("checkout.checkoutPreparationFailed")}
        </p>
      )}

      {isLoading && (
        <p className="mt-3 text-sm text-slate-500">
          {t("checkout.updatingSummary")}
        </p>
      )}
    </div>
  );
}
