export function normalizeCheckoutNumber(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function getCheckoutItemQuantity(item: unknown) {
  const quantity = normalizeCheckoutNumber(
    (item as { quantity?: unknown } | null | undefined)?.quantity,
    1,
  );
  return Math.max(1, Math.floor(quantity));
}

export function getCheckoutUnitPrice(item: unknown) {
  const entry = (item as {
    unit_price?: unknown;
    total_price?: unknown;
    Product?: {
      customer_price?: unknown;
      price?: unknown;
      listing?: {
        display_price?: unknown;
        is_listed?: unknown;
      } | null;
    } | null;
  } | null | undefined) ?? { Product: null };

  const customerPrice = normalizeCheckoutNumber(
    entry.Product?.customer_price,
    NaN,
  );
  if (Number.isFinite(customerPrice)) {
    return Math.max(0, customerPrice);
  }

  const listingPrice = normalizeCheckoutNumber(
    entry.Product?.listing?.display_price,
    NaN,
  );
  if (
    entry.Product?.listing?.is_listed &&
    Number.isFinite(listingPrice)
  ) {
    return Math.max(0, listingPrice);
  }

  const productPrice = normalizeCheckoutNumber(entry.Product?.price, NaN);
  if (Number.isFinite(productPrice)) {
    return Math.max(0, productPrice);
  }

  const itemUnitPrice = normalizeCheckoutNumber(entry.unit_price, NaN);
  if (Number.isFinite(itemUnitPrice)) {
    return Math.max(0, itemUnitPrice);
  }

  const quantity = getCheckoutItemQuantity(entry);
  const fallbackUnitPrice =
    normalizeCheckoutNumber(entry.total_price, 0) / quantity;

  return Math.max(0, fallbackUnitPrice);
}

export function getCheckoutBaseUnitPrice(item: unknown) {
  const entry = (item as {
    base_unit_price?: unknown;
    baseUnitPrice?: unknown;
    unit_price?: unknown;
    Product?: {
      base_price?: unknown;
      price?: unknown;
    } | null;
  } | null | undefined) ?? { Product: null };

  const baseUnitPrice = normalizeCheckoutNumber(
    entry.base_unit_price ?? entry.baseUnitPrice,
    NaN,
  );
  if (Number.isFinite(baseUnitPrice)) {
    return Math.max(0, baseUnitPrice);
  }

  const productBasePrice = normalizeCheckoutNumber(
    entry.Product?.base_price,
    NaN,
  );
  if (Number.isFinite(productBasePrice)) {
    return Math.max(0, productBasePrice);
  }

  const productPrice = normalizeCheckoutNumber(entry.Product?.price, NaN);
  if (Number.isFinite(productPrice)) {
    return Math.max(0, productPrice);
  }

  return Math.max(0, normalizeCheckoutNumber(entry.unit_price, 0));
}

export function getCheckoutLineTotal(item: unknown) {
  return getCheckoutUnitPrice(item) * getCheckoutItemQuantity(item);
}

export function getCheckoutSubtotal(items: unknown[]) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + getCheckoutLineTotal(item), 0);
}
