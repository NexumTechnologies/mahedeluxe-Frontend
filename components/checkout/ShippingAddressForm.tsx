"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
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
    <div className="bg-white rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isComplete
              ? "bg-orange text-white"
              : isActive
              ? "bg-blue text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {isComplete ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.3333 4L6 11.3333L2.66667 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>
        <h2 className="text-xl font-semibold text-[#000000]">
          Shipping address
        </h2>
        {isComplete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onActivate}
            className="ml-auto text-blue"
          >
            Change
          </Button>
        )}
      </div>

      {isComplete && !isActive ? (
        <div className="text-sm text-[#6B6B6B]">
          <p className="font-medium text-[#000000]">
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name and Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                className="h-12"
                required
              />
            </div>
            <div>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                className="h-12"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="h-12"
              required
            />
          </div>

          {/* Apartment, suite, unit, building, floor (optional) */}
          <div>
            <Input
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              placeholder="Apartment, suite, unit, building, floor (optional)"
              className="h-12"
            />
          </div>

          {/* State, City, Postal Code */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State / province"
                className="h-12"
                required
              />
            </div>
            <div>
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="h-12"
                required
              />
            </div>
            <div>
              <Input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Postal code"
                className="h-12"
                required
              />
            </div>
          </div>

          {/* Set as default checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="setAsDefault"
              id="setAsDefault"
              checked={formData.setAsDefault}
              onChange={handleChange}
              className="w-4 h-4 text-blue border-gray-300 rounded focus:ring-blue"
            />
            <label
              htmlFor="setAsDefault"
              className="text-sm text-[#6B6B6B] cursor-pointer"
            >
              Set as default shipping address
            </label>
          </div>

          {/* Continue to payment button */}
          <button
            type="submit"
            className="w-full h-12 text-base font-medium bg-linear-to-r from-orange to-orange-300 rounded-lg text-white"
          >
            Continue to payment
          </button>
        </form>
      )}
    </div>
  );
}
