export type GuestCartProduct = {
  id: number;
  name: string;
  price?: number;
  base_price?: number;
  customer_price?: number;
  admin_margin_amount?: number;
  admin_margin_percentage?: number;
  quantity?: number;
  min_order_quantity?: number;
  image_url?: string | string[] | null;
  listing?: {
    display_price?: number | null;
    is_listed?: boolean | null;
  } | null;
};

export type GuestCartItem = {
  id: string;
  product_id: number;
  quantity: number;
  total_price: number;
  unit_price: number;
  Product: GuestCartProduct;
};

export type GuestCart = {
  items: GuestCartItem[];
  totalItems: number;
  totalPrice: number;
};

const GUEST_CART_KEY = "guest-cart";

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeNumber(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function getUnitPrice(product: GuestCartProduct) {
  const customerPrice = normalizeNumber(product.customer_price, NaN);
  if (Number.isFinite(customerPrice) && customerPrice > 0) {
    return customerPrice;
  }

  const listingPrice = normalizeNumber(product.listing?.display_price, NaN);
  if (product.listing?.is_listed && Number.isFinite(listingPrice) && listingPrice > 0) {
    return listingPrice;
  }

  return Math.max(0, normalizeNumber(product.price, 0));
}

function buildCart(items: GuestCartItem[]): GuestCart {
  return {
    items,
    totalItems: items.length,
    totalPrice: items.reduce((sum, item) => sum + normalizeNumber(item.total_price, 0), 0),
  };
}

export function getGuestCart(): GuestCart {
  if (!isBrowser()) return buildCart([]);

  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return buildCart([]);

    const parsed = JSON.parse(raw) as GuestCart | GuestCartItem[] | null;
    const items = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.items)
        ? parsed.items
        : [];

    return buildCart(items);
  } catch {
    return buildCart([]);
  }
}

export function setGuestCart(items: GuestCartItem[]) {
  if (!isBrowser()) return buildCart(items);

  const nextCart = buildCart(items);

  try {
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(nextCart));
    window.dispatchEvent(new Event("guest-cart-change"));
  } catch {
    // ignore
  }

  return nextCart;
}

export function clearGuestCart() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(GUEST_CART_KEY);
    window.dispatchEvent(new Event("guest-cart-change"));
  } catch {
    // ignore
  }
}

export function addGuestCartItem(product: GuestCartProduct, quantity: number) {
  const safeQuantity = Math.max(1, Math.floor(normalizeNumber(quantity, 1)));
  const unitPrice = getUnitPrice(product);
  const currentCart = getGuestCart();
  const existingItem = currentCart.items.find((item) => item.product_id === product.id);
  const productStock = product.quantity != null ? normalizeNumber(product.quantity, 0) : null;
  const minOrderQuantity = Math.max(1, Math.floor(normalizeNumber(product.min_order_quantity, 1)));

  const nextItems = currentCart.items.map((item) => ({ ...item }));

  if (existingItem) {
    const nextQuantity = existingItem.quantity + safeQuantity;
    const clampedQuantity =
      productStock != null && productStock > 0 ? Math.min(nextQuantity, productStock) : nextQuantity;

    existingItem.quantity = Math.max(minOrderQuantity, clampedQuantity);
    existingItem.unit_price = unitPrice;
    existingItem.total_price = existingItem.quantity * unitPrice;
  } else {
    const initialQuantity =
      productStock != null && productStock > 0
        ? Math.min(Math.max(minOrderQuantity, safeQuantity), productStock)
        : Math.max(minOrderQuantity, safeQuantity);

    nextItems.unshift({
      id: `guest-${product.id}`,
      product_id: product.id,
      quantity: initialQuantity,
      unit_price: unitPrice,
      total_price: initialQuantity * unitPrice,
      Product: {
        id: product.id,
        name: product.name,
        price: product.price,
        base_price: product.base_price,
        customer_price: product.customer_price,
        admin_margin_amount: product.admin_margin_amount,
        admin_margin_percentage: product.admin_margin_percentage,
        quantity: product.quantity,
        min_order_quantity: product.min_order_quantity,
        image_url: product.image_url,
        listing: product.listing ?? undefined,
      },
    });
  }

  return setGuestCart(nextItems);
}

export function updateGuestCartItemQuantity(productId: number, quantity: number) {
  const safeQuantity = Math.max(1, Math.floor(normalizeNumber(quantity, 1)));
  const currentCart = getGuestCart();
  const nextItems = currentCart.items
    .map((item) => {
      if (item.product_id !== productId) return item;

      const stock = item.Product.quantity != null ? normalizeNumber(item.Product.quantity, 0) : null;
      const minOrderQuantity = Math.max(
        1,
        Math.floor(normalizeNumber(item.Product.min_order_quantity, 1)),
      );
      const clampedQuantity =
        stock != null && stock > 0
          ? Math.min(Math.max(safeQuantity, minOrderQuantity), stock)
          : Math.max(safeQuantity, minOrderQuantity);

      return {
        ...item,
        quantity: clampedQuantity,
        total_price: clampedQuantity * normalizeNumber(item.unit_price, 0),
      };
    })
    .filter((item) => item.quantity > 0);

  return setGuestCart(nextItems);
}

export function removeGuestCartItem(productId: number) {
  const currentCart = getGuestCart();
  return setGuestCart(currentCart.items.filter((item) => item.product_id !== productId));
}

export function hasStoredAuth() {
  if (!isBrowser()) return false;
  try {
    return !!window.localStorage.getItem("token") || !!window.localStorage.getItem("user");
  } catch {
    return false;
  }
}