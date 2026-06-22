"use client";

type SizeVariant = {
  size: string;
  price: string;
  image_url: string[];
};

type SizeVariantsEditorProps = {
  variants: SizeVariant[];
  onChange: (variants: SizeVariant[]) => void;
  uploadedUrls: string[];
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
  uploadedUrls,
  allowedOptions = [],
  title = "Size variants",
  optionLabel = "Size",
  helperText = "Each size can have its own price and image.",
  addButtonText = "Add size",
  placeholder = "S, M, L, XL",
}: SizeVariantsEditorProps) {
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
            {uploadedUrls.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                Upload product images first, then assign one to this size.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {uploadedUrls.map((url) => {
                  const active = variant.image_url.includes(url);
                  return (
                    <button
                      key={url}
                      type="button"
                      onClick={() => updateVariant(index, { image_url: [url] })}
                      className={`overflow-hidden rounded-lg border ${
                        active
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="Variant option" className="h-16 w-16 object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
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
      )})}
    </div>
  );
}
