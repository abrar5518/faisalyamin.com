"use client";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const CURRENCY = "PKR";
const ITEM_BRAND = "Sahoolat";
const DEFAULT_CATEGORY = "Products";
const DEDUPE_WINDOW_MS = 500;

type ProductLike = {
  id?: string | number;
  productId?: string | number;
  product_id?: string | number;
  slug?: string;
  name?: string;
  title?: string;
  price?: string | number;
  qty?: number;
  quantity?: number;
  category?: string | null;
  categoryName?: string | null;
  item_category?: string | null;
};

type CartLike = {
  items: ProductLike[];
  total?: number;
};

type OrderItemLike = ProductLike & {
  item_price?: string | number;
};

type OrderLike = {
  id: string | number;
  total?: string | number;
  shipping?: string | number;
  items: OrderItemLike[];
};

type GAItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category: string;
  item_brand: string;
};

const recentEvents = new Map<string, number>();

function hasWindow() {
  return typeof window !== "undefined";
}

function getGtag() {
  if (!hasWindow()) return null;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = (...args: any[]) => {
      window.dataLayer?.push(args);
    };
  }

  return window.gtag;
}

function toNumber(value: ProductLike["price"]) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value) return 0;
  const parsed = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toStringValue(value: unknown) {
  return String(value ?? "").trim();
}

function getItemId(item: ProductLike) {
  return toStringValue(item.product_id ?? item.productId ?? item.id ?? item.slug);
}

function getItemName(item: ProductLike) {
  return toStringValue(item.title ?? item.name);
}

function getItemCategory(item: ProductLike) {
  return toStringValue(item.item_category ?? item.category ?? item.categoryName) || DEFAULT_CATEGORY;
}

function getQuantity(item: ProductLike) {
  const quantity = Number(item.quantity ?? item.qty ?? 1);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function toGAItem(item: ProductLike): GAItem {
  return {
    item_id: getItemId(item),
    item_name: getItemName(item),
    price: toNumber(item.price),
    quantity: getQuantity(item),
    item_category: getItemCategory(item),
    item_brand: ITEM_BRAND,
  };
}

function getCartValue(items: GAItem[], value?: number) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function shouldSkipDuplicate(key: string) {
  const now = Date.now();
  const last = recentEvents.get(key);
  if (last && now - last < DEDUPE_WINDOW_MS) return true;
  recentEvents.set(key, now);
  return false;
}

function sendGoogleEvent(eventName: string, params: Record<string, unknown>, dedupeKey: string) {
  if (!hasWindow() || shouldSkipDuplicate(dedupeKey)) return false;

  const gtag = getGtag();
  if (!gtag) return false;

  gtag("event", eventName, params);
  return true;
}

export function trackViewItem(product: ProductLike) {
  const item = toGAItem(product);

  sendGoogleEvent(
    "view_item",
    {
      currency: CURRENCY,
      value: item.price,
      items: [item],
    },
    `view_item:${item.item_id}`,
  );
}

export function trackGoogleAddToCart(product: ProductLike) {
  const item = toGAItem(product);

  sendGoogleEvent(
    "add_to_cart",
    {
      currency: CURRENCY,
      value: item.price * item.quantity,
      items: [item],
    },
    `add_to_cart:${item.item_id}:${item.quantity}`,
  );
}

export function trackViewCart(cart: CartLike) {
  const items = cart.items.map(toGAItem);

  sendGoogleEvent(
    "view_cart",
    {
      currency: CURRENCY,
      value: getCartValue(items, cart.total),
      items,
    },
    `view_cart:${items.map((item) => `${item.item_id}:${item.quantity}`).join("|")}`,
  );
}

export function trackRemoveFromCart(product: ProductLike) {
  const item = toGAItem(product);

  sendGoogleEvent(
    "remove_from_cart",
    {
      currency: CURRENCY,
      value: item.price * item.quantity,
      items: [item],
    },
    `remove_from_cart:${item.item_id}:${item.quantity}`,
  );
}

export function trackBeginCheckout(cart: CartLike) {
  const items = cart.items.map(toGAItem);

  sendGoogleEvent(
    "begin_checkout",
    {
      currency: CURRENCY,
      value: getCartValue(items, cart.total),
      items,
    },
    `begin_checkout:${items.map((item) => `${item.item_id}:${item.quantity}`).join("|")}`,
  );
}

export function trackPurchase(order: OrderLike) {
  if (!hasWindow()) return;

  const orderId = toStringValue(order.id);
  if (!orderId) return;

  const storageKey = `ga_purchase_sent_${orderId}`;
  if (window.localStorage.getItem(storageKey)) return;

  const items = order.items.map((item) =>
    toGAItem({
      ...item,
      price: item.item_price ?? item.price,
    }),
  );
  const value = toNumber(order.total) || getCartValue(items);
  const shipping = toNumber(order.shipping);

  const sent = sendGoogleEvent(
    "purchase",
    {
      transaction_id: orderId,
      value,
      shipping,
      currency: CURRENCY,
      items,
    },
    `purchase:${orderId}`,
  );

  if (sent) {
    window.localStorage.setItem(storageKey, "1");
  }
}

export function trackSearch(searchTerm: string) {
  const trimmed = searchTerm.trim();
  if (!trimmed) return;

  sendGoogleEvent(
    "search",
    {
      search_term: trimmed,
    },
    `search:${trimmed.toLowerCase()}`,
  );
}
