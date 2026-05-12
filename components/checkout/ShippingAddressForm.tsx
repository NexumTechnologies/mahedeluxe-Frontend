"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/LanguageProvider";

export interface ShippingAddressData {
  country: string;
  email: string;
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
  const { dir, t } = useI18n();
  const [formData, setFormData] = useState({
    country: t("checkout.unitedArabEmirates"),
    email: "",
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
    addressLineParts.push(t("checkout.unitedArabEmirates"));

    parts.push(addressLineParts.filter(Boolean).join(", "));
    return parts.filter(Boolean).join(" | ");
  };

  const buildAddressData = (data: typeof formData): ShippingAddressData => ({
    ...data,
    summary: buildAddressSummary(data),
  });

  useEffect(() => {
    if (onAddressChange) {
      onAddressChange(buildAddressData(formData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, onAddressChange]);

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
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 shadow-sm" dir={dir}>
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
            {t("checkout.deliveryDetails")}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t("checkout.enterShippingAddress")}
          </p>
        </div>
        {isComplete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onActivate}
            className="ml-auto text-sm text-blue-600 hover:text-blue-700"
          >
            {t("checkout.change")}
          </Button>
        )}
      </div>

      {isComplete && !isActive ? (
        <div className="space-y-2 text-sm text-slate-600">
          <p className="font-medium text-slate-950">
            {`${formData.firstName} ${formData.lastName}`.trim() || t("checkout.nameFallback")}
          </p>
          {formData.email && <p>{formData.email}</p>}
          {formData.phone && <p>{formData.phone}</p>}
          <p>
            {[formData.apartment, formData.city, formData.state,
              formData.postalCode,
              t("checkout.unitedArabEmirates"),
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
                Email address
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="h-10 border-slate-300 bg-white"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {t("checkout.firstName")}
              </label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={t("checkout.firstName")}
                className="h-10 border-slate-300 bg-white"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {t("checkout.lastName")}
              </label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t("checkout.lastName")}
                className="h-10 border-slate-300 bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("checkout.phoneNumber")}
            </label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t("checkout.phoneNumber")}
              className="h-10 border-slate-300 bg-white"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("checkout.apartmentOrBuilding")}
            </label>
            <Input
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              placeholder={t("checkout.apartmentPlaceholder")}
              className="h-10 border-slate-300 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {t("checkout.stateProvince")}
              </label>
              <Input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder={t("checkout.stateProvince")}
                className="h-10 border-slate-300 bg-white"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {t("checkout.city")}
              </label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder={t("checkout.city")}
                className="h-10 border-slate-300 bg-white"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {t("checkout.postalCode")}
              </label>
              <Input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder={t("checkout.postalCode")}
                className="h-10 border-slate-300 bg-white"
                required
              />
            </div>
          </div>

          <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {t("checkout.country")}: <span className="font-medium text-slate-900">{t("checkout.unitedArabEmirates")}</span>
          </div>

          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-amber-400 text-sm sm:text-base font-medium text-slate-950 transition hover:bg-amber-500"
          >
            {t("checkout.useThisAddress")}
          </button>
        </form>
      )}
    </div>
  );
}
