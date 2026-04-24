"use client";

import { useState } from "react";
import { CheckCircle2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface ShippingAddressData {
  country: string;
  firstName: string;
  lastName: string;
  phone: string;
  apartment: string;
  state: string;
  city: string;
  postalCode: string;
  setAsDefault: boolean;
  summary: string;
}

interface ShippingAddressFormProps {
  isComplete: boolean;
  onComplete: (complete: boolean) => void;
  isActive: boolean;
  onActivate: () => void;
  onAddressChange?: (address: ShippingAddressData) => void;
}

export default function ShippingAddressForm({
  isComplete,
  onComplete,
  isActive,
  onActivate,
  onAddressChange,
}: ShippingAddressFormProps) {
  const [formData, setFormData] = useState({
    country: "United Arab Emirates",
    firstName: "",
    lastName: "",
    phone: "",
    apartment: "",
    state: "",
    city: "",
    postalCode: "",
    setAsDefault: false,
  });

  const buildAddressSummary = (data: typeof formData) => {
    const parts: string[] = [];
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    if (fullName) parts.push(fullName);
    if (data.phone) parts.push(data.phone);

    const addressLineParts: string[] = [];
    if (data.apartment) addressLineParts.push(data.apartment);
    if (data.city) addressLineParts.push(data.city);
    if (data.state) addressLineParts.push(data.state);
    if (data.postalCode) addressLineParts.push(data.postalCode);
    addressLineParts.push("United Arab Emirates");

    parts.push(addressLineParts.filter(Boolean).join(", "));
    return parts.filter(Boolean).join(" | ");
  };

  const buildAddressData = (data: typeof formData): ShippingAddressData => ({
    ...data,
    summary: buildAddressSummary(data),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddressChange) {
      onAddressChange(buildAddressData(formData));
    }
    onComplete(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      };
      if (onAddressChange) {
        onAddressChange(buildAddressData(next));
      }
      return next;
    });
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            isComplete
              ? "bg-emerald-500 text-white"
              : isActive
              ? "bg-amber-500 text-white"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-950">
            Delivery details
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Enter your shipping address.
          </p>
        </div>
        {isComplete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onActivate}
            className="ml-auto text-sm text-blue-600 hover:text-blue-700"
          >
            Change
          </Button>
        )}
      </div>

      {isComplete && !isActive ? (
        <div className="space-y-2 text-sm text-slate-600">
          <p className="font-medium text-slate-950">
            {`${formData.firstName} ${formData.lastName}`.trim() || "Name"}
          </p>
          {formData.phone && <p>{formData.phone}</p>}
          <p>
            {[formData.apartment, formData.city, formData.state,
              formData.postalCode,
              "United Arab Emirates",
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                First name
              </label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                className="h-10 border-slate-300 bg-white"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Last name
              </label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                className="h-10 border-slate-300 bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Phone number
            </label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="h-10 border-slate-300 bg-white"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Apartment or building
            </label>
            <Input
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              placeholder="Apartment, suite, unit, building, floor (optional)"
              className="h-10 border-slate-300 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                State / province
              </label>
              <Input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State / province"
                className="h-10 border-slate-300 bg-white"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                City
              </label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="h-10 border-slate-300 bg-white"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Postal code
              </label>
              <Input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Postal code"
                className="h-10 border-slate-300 bg-white"
                required
              />
            </div>
          </div>

          <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Country: <span className="font-medium text-slate-900">United Arab Emirates</span>
          </div>

          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-amber-400 text-sm sm:text-base font-medium text-slate-950 transition hover:bg-amber-500"
          >
            Use this address
          </button>
        </form>
      )}
    </div>
  );
}
