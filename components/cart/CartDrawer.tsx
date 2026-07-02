/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import api from "@/lib/axios";
import {
  getGuestCart,
  removeGuestCartItem,
  hasStoredAuth,
} from "@/lib/cartStorage";
import {
  getCheckoutItemQuantity,
  getCheckoutLineTotal,
  getCheckoutSubtotal,
  getCheckoutUnitPrice,
} from "@/lib/checkoutPricing";
import { useI18n } from "@/components/LanguageProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import { formatPriceFromAED } from "@/lib/currency";

export default function CartDrawer() {
  const { locale } = useI18n();
  const { currency, rates } = useCurrency();
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  //========================= API CALLS ==========================//
  //==============================================================//
  const loadCart = async () => {
    setLoading(true);
    try {
      if (hasStoredAuth()) {
        const res = await api.get("/addToCart");
        const cart = res.data?.data || res.data || {};
        setItems(cart.items || []);
      } else {
        setItems(getGuestCart().items || []);
      }
    } catch {
      setItems(getGuestCart().items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const openHandler = () => {
      setOpen(true);
      setEntered(false);
      loadCart();
    };

    const guestChange = () => loadCart();

    window.addEventListener("open-cart-drawer", openHandler as EventListener);
    window.addEventListener("guest-cart-change", guestChange as EventListener);
    return () => {
      window.removeEventListener("open-cart-drawer", openHandler as EventListener);
      window.removeEventListener("guest-cart-change", guestChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWithAnimation();
    };
    const frame = requestAnimationFrame(() => setEntered(true));
    window.addEventListener("keydown", handleEsc);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const closeWithAnimation = () => {
    setEntered(false);
    setTimeout(() => setOpen(false), 260);
  };

  const handleClose = () => closeWithAnimation();

  const handleRemove = async (item: any) => {
    if (hasStoredAuth()) {
      try {
        await api.delete(`/addToCart/${item.id}`);
        await loadCart();
      } catch {
        // ignore
      }
      return;
    }

    removeGuestCartItem(
      Number(item.product_id),
      item.selected_size || item.Product?.selected_size || null,
    );
    setItems(getGuestCart().items || []);
  };

  if (!open) return null;

  const subtotal = getCheckoutSubtotal(items);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      <aside
        className={`absolute right-0 top-0 flex h-full w-11/12 transform flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 sm:w-96 ${
          entered ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between rounded-l-md bg-linear-to-l from-amber-400 to-orange-300 px-4 py-4 text-white sm:px-6">
          <div>
            <h3 className="text-lg font-semibold">Your cart</h3>
            <div className="text-xs opacity-90">
              {items.length} item{items.length === 1 ? "" : "s"}
            </div>
          </div>
          <button
            aria-label="Close cart"
            onClick={handleClose}
            className="rounded-full bg-white/20 p-2 hover:bg-white/30"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="flex-1 p-4 sm:p-6">
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">Loading cart...</div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">Your cart is empty.</div>
          ) : (
            <div className="space-y-3">
              {items.map((item: any) => {
                const product = item.Product || {};
                const qty = getCheckoutItemQuantity(item);
                const unit = getCheckoutUnitPrice(item);
                const lineTotal = getCheckoutLineTotal(item);
                const selectedSize = item.selected_size || product.selected_size || null;
                const imageSrc =
                  (product.image_url &&
                    (Array.isArray(product.image_url)
                      ? product.image_url[0]
                      : product.image_url)) ||
                  "/detail-product.jpg";

                return (
                  <div
                    key={`${item.id || item.product_id}-${selectedSize || "default"}`}
                    className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageSrc}
                        alt={product.name || "Product"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {product.name || "Product"}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                            <span>{`Qty x${qty}`}</span>
                            {selectedSize && <span>{`Size ${selectedSize}`}</span>}
                            <span>{formatPriceFromAED(unit, currency, rates, locale)}</span>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          {formatPriceFromAED(lineTotal, currency, rates, locale)}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          onClick={() => handleRemove(item)}
                          className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                        <Link
                          href={`/products/${product.id}`}
                          className="text-sm text-slate-600 hover:underline"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-4" />
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-white p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-slate-600">Subtotal</div>
            <div className="text-lg font-semibold">
              {formatPriceFromAED(subtotal, currency, rates, locale)}
            </div>
          </div>
          <div className="space-y-2">
            <Link
              href="/checkout"
              className="block w-full rounded-full bg-blue-600 py-3 text-center font-medium text-white"
            >
              Proceed to checkout
            </Link>
            <button onClick={handleClose} className="w-full text-center text-sm text-slate-600">
              Continue shopping
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
