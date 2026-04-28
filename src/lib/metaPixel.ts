"use client";

type ProductLike = {
  id?: string | number;
  slug?: string;
  name?: string;
  title?: string;
  price?: string | number;
};

type CartItemLike = ProductLike & {
  qty?: number;
};

type CartLike = {
  items: CartItemLike[];
  total?: number;
  totalItems?: number;
};

type OrderItemLike = ProductLike & {
  quantity?: number;
  qty?: number;
  item_price?: number;
};

type OrderLike = {
  id: string | number;
  total?: number;
  items: OrderItemLike[];
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

const CURRENCY = "PKR";

function canTrack() {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

function getContentId(item: ProductLike) {
  return String(item.id ?? item.slug ?? "").trim();
}

function getContentName(item: ProductLike) {
  return String(item.title ?? item.name ?? "").trim();
}

function getValue(value: ProductLike["price"]) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value) return 0;
  const parsed = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function track(eventName: string, payload: Record<string, unknown>) {
  if (!canTrack()) return;
  window.fbq?.("track", eventName, payload);
}

export function trackViewContent(product: ProductLike) {
  const contentId = getContentId(product);

  track("ViewContent", {
    content_ids: contentId ? [contentId] : [],
    content_name: getContentName(product),
    content_type: "product",
    value: getValue(product.price),
    currency: CURRENCY,
  });
}

export function trackAddToCart(product: ProductLike) {
  const contentId = getContentId(product);

  track("AddToCart", {
    content_ids: contentId ? [contentId] : [],
    content_name: getContentName(product),
    content_type: "product",
    value: getValue(product.price),
    currency: CURRENCY,
  });
}

export function trackInitiateCheckout(cart: CartLike) {
  const contentIds = cart.items.map(getContentId).filter(Boolean);
  const value =
    typeof cart.total === "number"
      ? cart.total
      : cart.items.reduce((sum, item) => sum + getValue(item.price) * (item.qty ?? 1), 0);
  const numItems =
    typeof cart.totalItems === "number"
      ? cart.totalItems
      : cart.items.reduce((sum, item) => sum + (item.qty ?? 1), 0);

  track("InitiateCheckout", {
    value,
    currency: CURRENCY,
    num_items: numItems,
    content_ids: contentIds,
    content_type: "product",
  });
}

export function trackPurchase(order: OrderLike) {
  const storageKey = `meta_purchase_fired_${order.id}`;

  if (typeof window !== "undefined") {
    if (
      window.localStorage.getItem(storageKey) ||
      window.sessionStorage.getItem(storageKey)
    ) {
      return;
    }
  }

  const contents = order.items.map((item) => ({
    id: getContentId(item),
    quantity: item.quantity ?? item.qty ?? 1,
    item_price: item.item_price ?? getValue(item.price),
  }));
  const totalItems = contents.reduce((sum, item) => sum + item.quantity, 0);
  const value =
    typeof order.total === "number"
      ? order.total
      : contents.reduce((sum, item) => sum + item.item_price * item.quantity, 0);

  track("Purchase", {
    value,
    currency: CURRENCY,
    contents,
    content_type: "product",
    num_items: totalItems,
  });

  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, "1");
    window.sessionStorage.setItem(storageKey, "1");
  }
}
