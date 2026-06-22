export const VARIANT_TYPE_OPTIONS = [
  { value: "size", label: "Size" },
  { value: "kg", label: "KG" },
  { value: "gram", label: "Gram" },
  { value: "liter", label: "Liter" },
  { value: "ml", label: "ML" },
  { value: "piece", label: "Piece" },
] as const;

export type VariantType = (typeof VARIANT_TYPE_OPTIONS)[number]["value"];

const normalizeOptions = (rawValue: unknown): string[] => {
  const list = Array.isArray(rawValue)
    ? rawValue
    : typeof rawValue === "string"
      ? rawValue.split(",")
      : [];

  return [...new Set(
    list
      .map((item) => String(item || "").trim().toLowerCase())
      .filter(Boolean),
  )];
};

export function getVariantTypeMeta(rawValue: unknown) {
  const options = normalizeOptions(rawValue);
  const hasWeight = options.includes("kg") || options.includes("gram");
  const hasVolume = options.includes("liter") || options.includes("ml");

  if (hasWeight && !options.includes("size") && !options.includes("piece") && !hasVolume) {
    return {
      options,
      title: "Weight variants",
      label: "Weight option",
      helperText: "Use weight options like gram or kg. Each option can have its own price and image.",
      addButtonText: "Add weight option",
      placeholder: "100 gram, 250 gram, 1 kg",
    };
  }

  if (hasVolume && !options.includes("size") && !options.includes("piece") && !hasWeight) {
    return {
      options,
      title: "Volume variants",
      label: "Volume option",
      helperText: "Use volume options like ML or liter. Each option can have its own price and image.",
      addButtonText: "Add volume option",
      placeholder: "100 ml, 250 ml, 1 liter",
    };
  }

  if (options.length === 1 && options[0] === "piece") {
    return {
      options,
      title: "Piece variants",
      label: "Piece option",
      helperText: "Use piece-based options. Each option can have its own price and image.",
      addButtonText: "Add piece option",
      placeholder: "1 piece, 2 pieces, box of 6",
    };
  }

  if (options.length === 1 && options[0] === "size") {
    return {
      options,
      title: "Size variants",
      label: "Size",
      helperText: "Each size can have its own price and image.",
      addButtonText: "Add size",
      placeholder: "S, M, L, XL",
    };
  }

  const optionLabels = options
    .map((value) => VARIANT_TYPE_OPTIONS.find((option) => option.value === value)?.label || value)
    .join(", ");

  return {
    options,
    title: "Variant options",
    label: "Variant option",
    helperText:
      optionLabels.length > 0
        ? `Allowed options: ${optionLabels}. Each option can have its own price and image.`
        : "Each option can have its own price and image.",
    addButtonText: "Add option",
    placeholder: optionLabels.length > 0 ? optionLabels : "Add option",
  };
}
