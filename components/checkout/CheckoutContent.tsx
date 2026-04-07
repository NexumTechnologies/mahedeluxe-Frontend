"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import ShippingAddressForm, { type ShippingAddressData } from "./ShippingAddressForm";
import ItemsAndDeliverySection from "./ItemsAndDeliverySection";
import OrderSummary from "./OrderSummary";

export default function CheckoutContent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [shippingComplete, setShippingComplete] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "shipping" | "payment" | "items"
  >("shipping");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["buyer-cart"],
    enabled: isClient,
    queryFn: async () => {
      const res = await api.get("/addToCart");
      return res.data;
    },
  });

  const cart = (data as any)?.data || data || {};
  const items = cart.items || [];
  const totalItems = cart.totalItems || items.length || 0;
  const itemSubtotal = cart.totalPrice || 0;

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      if (!shippingAddress) {
        throw new Error("Shipping address is required");
      }

      const res = await api.post(
        "/order",
        {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          phone: shippingAddress.phone,
          apartment: shippingAddress.apartment,
          state: shippingAddress.state,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-cart"] });
      setIsConfirmModalOpen(false);
      let redirectTo = "/";

      try {
        const storedUser =
          typeof window !== "undefined" ? localStorage.getItem("user") : null;
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        const role = parsed?.role;

        if (role === "buyer") {
          redirectTo = "/buyer/dashboard";
        } else if (role === "user") {
          redirectTo = "/";
        }
      } catch {
        // Fallback to home if parsing fails
        redirectTo = "/";
      }

      router.push(redirectTo);
    },
  });

  return (
    <div className="w-full max-w-310 mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          <ShippingAddressForm
            isComplete={shippingComplete}
            onComplete={setShippingComplete}
            isActive={activeSection === "shipping"}
            onActivate={() => setActiveSection("shipping")}
            onAddressChange={setShippingAddress}
          />
          <ItemsAndDeliverySection
            items={items}
            isLoading={isLoading}
            isActive={activeSection === "items"}
            onActivate={() => setActiveSection("items")}
          />
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:w-100 shrink-0">
          <OrderSummary
            items={items}
            totalItems={totalItems}
            itemSubtotal={itemSubtotal}
            isLoading={isLoading}
            hasError={!!error}
            canPay={shippingComplete && !!shippingAddress}
            onPayNow={() => setIsConfirmModalOpen(true)}
          />
        </div>
      </div>

      {isConfirmModalOpen && (
        <div className="app-modal-overlay">
          <div className="app-modal-panel max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Confirm your order
            </h2>
            <div className="space-y-3 text-sm text-slate-700 max-h-[60vh] overflow-y-auto">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Shipping address
                </h3>
                <p>{shippingAddress?.summary || ""}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Items
                </h3>
                <ul className="space-y-1">
                  {items.map((item: any) => (
                    <li key={item.id} className="flex justify-between text-xs">
                      {(() => {
                        const quantity = Number(item.quantity ?? 1) || 1;
                        const product = item.Product || {};
                        const listing = (product as any).listing;
                        const listingPrice =
                          listing &&
                          listing.is_listed &&
                          listing.display_price != null
                            ? Number(listing.display_price)
                            : undefined;
                        const baseUnit =
                          typeof item.unit_price === "number" &&
                          !Number.isNaN(item.unit_price)
                            ? item.unit_price
                            : undefined;
                        const fallbackUnit =
                          Number(item.total_price ?? 0) / quantity || 0;
                        const unitPrice =
                          typeof listingPrice === "number" &&
                          !Number.isNaN(listingPrice)
                            ? listingPrice
                            : typeof baseUnit === "number"
                              ? baseUnit
                              : fallbackUnit;
                        const lineTotal = unitPrice * quantity;

                        return (
                          <>
                            <span className="truncate mr-2">
                              {item.Product?.name || "Product"} x{quantity}
                            </span>
                            <span className="font-medium">{lineTotal} AED</span>
                          </>
                        );
                      })()}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900">Total</span>
                <span className="font-semibold text-slate-900">
                  {itemSubtotal} AED
                </span>
              </div>
            </div>
            {placeOrderMutation.isError && (
              <p className="text-xs text-red-600">
                Failed to place order. Please try again.
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 text-xs sm:text-sm rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                disabled={placeOrderMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => placeOrderMutation.mutate()}
                disabled={placeOrderMutation.isPending}
                className="px-4 py-2 text-xs sm:text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {placeOrderMutation.isPending
                  ? "Placing order..."
                  : "Confirm order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
