"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import api from "@/lib/axios";
import { getGuestCart, removeGuestCartItem, hasStoredAuth } from "@/lib/cartStorage";
import { formatAED } from "@/lib/utils";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    } catch (e) {
      setItems(getGuestCart().items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const openHandler = () => {
      setOpen(true);
      // ensure we start hidden and then animate in
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
    // animate in on next frame
    const frame = requestAnimationFrame(() => setEntered(true));
    window.addEventListener("keydown", handleEsc);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const closeWithAnimation = () => {
    // play exit animation then unmount
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

    removeGuestCartItem(Number(item.product_id));
    setItems(getGuestCart().items || []);
  };

  if (!open) return null;

  const subtotal = items.reduce((s, it) => s + (Number(it.unit_price || 0) * Number(it.quantity || 1)), 0);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      <aside
        className={`absolute right-0 top-0 h-full w-11/12 sm:w-96 bg-white shadow-2xl overflow-y-auto flex flex-col transform transition-transform duration-300 ${
          entered ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-4 sm:px-6 py-4 bg-linear-to-l from-amber-400 to-orange-300 text-white flex items-center justify-between rounded-l-md">
          <div>
            <h3 className="text-lg font-semibold">Your cart</h3>
            <div className="text-xs opacity-90">{items.length} item{items.length === 1 ? "" : "s"}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Close cart"
              onClick={handleClose}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 flex-1">
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">Loading cart…</div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">Your cart is empty.</div>
          ) : (
            <div className="space-y-3">
              {items.map((item: any) => {
                const product = item.Product || {};
                const qty = Number(item.quantity ?? 1) || 1;
                const unit = Number(item.unit_price ?? 0) || 0;
                return (
                  <div key={item.id || item.product_id} className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-3">
                    <div className="w-14 h-14 rounded-md bg-slate-100 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={(product.image_url && (Array.isArray(product.image_url) ? product.image_url[0] : product.image_url)) || '/detail-product.jpg'} alt={product.name || 'Product'} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{product.name || 'Product'}</p>
                          <div className="mt-1 text-xs text-slate-500 flex items-center gap-3">
                            <span>Qty ×{qty}</span>
                            <span>{formatAED(unit)}</span>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-slate-900">{formatAED(unit * qty)}</div>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <button onClick={() => handleRemove(item)} className="text-sm text-red-600 px-2 py-1 rounded-md hover:bg-red-50">Remove</button>
                        <Link href={`/products/${product.id}`} className="text-sm text-slate-600 hover:underline">View</Link>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-4" />
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 p-4 sm:p-6 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-slate-600">Subtotal</div>
            <div className="text-lg font-semibold">{formatAED(subtotal)}</div>
          </div>
          <div className="space-y-2">
            <Link href="/checkout" className="block w-full text-center rounded-full bg-blue-600 text-white py-3 font-medium">Proceed to checkout</Link>
            <button onClick={handleClose} className="w-full text-center text-sm text-slate-600">Continue shopping</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
