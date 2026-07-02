"use client";

import { useId, useState } from "react";
import api from "@/lib/axios";

type SizeVariant = {
  size: string;
  price: string;
  image_url: string[];
};

type SizeVariantsEditorProps = {
  variants: SizeVariant[];
  onChange: (variants: SizeVariant[]) => void;
  allowedOptions?: string[];
  title?: string;
  optionLabel?: string;
  helperText?: string;
  addButtonText?: string;
  placeholder?: string;
};

const createEmptyVariant = (): SizeVariant => ({
  size: "",
  price: "",
  image_url: [],
});

export default function SizeVariantsEditor({
  variants,
  onChange,
  allowedOptions = [],
  title = "Size variants",
  optionLabel = "Size",
  helperText = "Each size can have its own price and image.",
  addButtonText = "Add size",
  placeholder = "S, M, L, XL",
}: SizeVariantsEditorProps) {
  const inputIdPrefix = useId();
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState<number | null>(null);
  const safeVariants = variants.length > 0 ? variants : [createEmptyVariant()];
  const normalizedAllowedOptions = [...new Set(
    allowedOptions
      .map((option) => String(option || "").trim().toLowerCase())
      .filter(Boolean),
  )];
  const usesFreeTextOnly =
    normalizedAllowedOptions.length === 0 ||
    (normalizedAllowedOptions.length === 1 && normalizedAllowedOptions[0] === "size");

  const splitVariantValue = (value: string) => {
    const normalizedValue = String(value || "").trim();
    if (usesFreeTextOnly) {
      return { amount: normalizedValue, unit: "" };
    }

    const matchedUnit = normalizedAllowedOptions.find(
      (option) =>
        normalizedValue.toLowerCase() === option ||
        normalizedValue.toLowerCase().endsWith(` ${option}`),
    );

    if (!matchedUnit) {
      return {
        amount: normalizedValue,
        unit: normalizedAllowedOptions[0] || "",
      };
    }

    if (normalizedValue.toLowerCase() === matchedUnit) {
      return { amount: "", unit: matchedUnit };
    }

    return {
      amount: normalizedValue.slice(0, -matchedUnit.length).trim(),
      unit: matchedUnit,
    };
  };

  const buildVariantValue = (amount: string, unit: string) => {
    const trimmedAmount = amount.trim();
    const trimmedUnit = unit.trim();
    if (!trimmedUnit) return trimmedAmount;
    if (!trimmedAmount) return trimmedUnit;
    return `${trimmedAmount} ${trimmedUnit}`;
  };

  const formatOptionLabel = (option: string) => {
    if (option === "kg") return "KG";
    if (option === "ml") return "ML";
    return option.charAt(0).toUpperCase() + option.slice(1);
  };

  const updateVariant = (index: number, next: Partial<SizeVariant>) => {
    onChange(
      safeVariants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...next } : variant,
      ),
    );
  };

  const removeVariant = (index: number) => {
    const next = safeVariants.filter((_, variantIndex) => variantIndex !== index);
    onChange(next.length > 0 ? next : [createEmptyVariant()]);
  };

  const addVariant = () => {
    onChange([...safeVariants, createEmptyVariant()]);
  };

  //========================= API CALLS ==========================//
  //==============================================================//
  const uploadVariantImage = async (index: number, file: File) => {
    const formData = new FormData();
    formData.append("images", file);

    try {
      setUploadingVariantIndex(index);
      const res = await api.post("/upload/multiple", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const urls = res.data?.urls || res.data?.url || res.data || [];
      const nextUrl = Array.isArray(urls) ? urls[0] : urls;
      if (!nextUrl) return;

      updateVariant(index, { image_url: [String(nextUrl)] });
    } catch (error) {
      console.error("Variant image upload failed", error);
    } finally {
      setUploadingVariantIndex(null);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-[11px] text-slate-500">
            {helperText}
          </p>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
        >
          {addButtonText}
        </button>
      </div>

      {safeVariants.map((variant, index) => {
        const parsedVariantValue = splitVariantValue(variant.size);
        const variantImage = variant.image_url.find(Boolean) || "";
        const isUploading = uploadingVariantIndex === index;
        const inputId = `${inputIdPrefix}-variant-image-${index}`;

        return (
          <div key={index} className="space-y-3 rounded-lg border bg-white p-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="min-w-0">
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  {optionLabel}
                </label>
                {usesFreeTextOnly ? (
                  <input
                    type="text"
                    value={variant.size}
                    onChange={(e) => updateVariant(index, { size: e.target.value })}
                    placeholder={placeholder}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                ) : (
                  <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_5.5rem] gap-2">
                    <input
                      type="text"
                      value={parsedVariantValue.amount}
                      onChange={(e) =>
                        updateVariant(index, {
                          size: buildVariantValue(
                            e.target.value,
                            parsedVariantValue.unit || normalizedAllowedOptions[0] || "",
                          ),
                        })
                      }
                      placeholder="250, 500, 1"
                      className="w-full min-w-0 rounded border px-3 py-2 text-sm"
                    />
                    <select
                      value={parsedVariantValue.unit || normalizedAllowedOptions[0] || ""}
                      onChange={(e) =>
                        updateVariant(index, {
                          size: buildVariantValue(
                            parsedVariantValue.amount,
                            e.target.value,
                          ),
                        })
                      }
                      className="w-full rounded border px-3 py-2 text-sm"
                    >
                      {normalizedAllowedOptions.map((option) => (
                        <option key={option} value={option}>
                          {formatOptionLabel(option)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={variant.price}
                  onChange={(e) => updateVariant(index, { price: e.target.value })}
                  placeholder="0.00"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Variant image
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <label
                    htmlFor={inputId}
                    aria-disabled={isUploading}
                    className={`inline-flex cursor-pointer items-center rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 ${
                      isUploading ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    {variantImage ? "Replace image" : "Upload image"}
                  </label>
                  <input
                    id={inputId}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.currentTarget.value = "";
                      if (!file) return;
                      await uploadVariantImage(index, file);
                    }}
                  />
                  <p className="text-[11px] text-slate-500">
                    Each variant uses its own image.
                  </p>
                </div>

                {isUploading && (
                  <p className="text-[11px] text-slate-500">Uploading variant image...</p>
                )}

                {variantImage ? (
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => updateVariant(index, { image_url: [] })}
                      className="absolute right-1 top-1 z-10 rounded-full border bg-white px-1.5 text-[10px] leading-none shadow"
                    >
                      x
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={variantImage} alt="Variant option" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    No variant image uploaded yet.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeVariant(index)}
                className="text-xs font-medium text-red-600 hover:text-red-700"
              >
                Remove option
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
