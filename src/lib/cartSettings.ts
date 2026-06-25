export type CartSettings = {
  continueShoppingHref: string;
  emptyPrimaryHref: string;
  emptySecondaryHref: string;
  supportHref: string;
  trackOrderHref: string;
  showFreeShippingProgress: boolean;
};

export const DEFAULT_CART_SETTINGS: CartSettings = {
  continueShoppingHref: "/shop",
  emptyPrimaryHref: "/categories",
  emptySecondaryHref: "/shop",
  supportHref: "/contact",
  trackOrderHref: "/account/orders",
  showFreeShippingProgress: true,
};

function cleanHref(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return fallback;
}

function mergeCartSettings(value: unknown): CartSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return DEFAULT_CART_SETTINGS;
  }

  const input = value as Record<string, unknown>;

  return {
    continueShoppingHref: cleanHref(
      input.continueShoppingHref,
      DEFAULT_CART_SETTINGS.continueShoppingHref
    ),
    emptyPrimaryHref: cleanHref(input.emptyPrimaryHref, DEFAULT_CART_SETTINGS.emptyPrimaryHref),
    emptySecondaryHref: cleanHref(
      input.emptySecondaryHref,
      DEFAULT_CART_SETTINGS.emptySecondaryHref
    ),
    supportHref: cleanHref(input.supportHref, DEFAULT_CART_SETTINGS.supportHref),
    trackOrderHref: cleanHref(input.trackOrderHref, DEFAULT_CART_SETTINGS.trackOrderHref),
    showFreeShippingProgress:
      typeof input.showFreeShippingProgress === "boolean"
        ? input.showFreeShippingProgress
        : DEFAULT_CART_SETTINGS.showFreeShippingProgress,
  };
}

export function parseCartSettings(value?: string | null): CartSettings {
  if (!value?.trim()) return DEFAULT_CART_SETTINGS;

  try {
    return mergeCartSettings(JSON.parse(value));
  } catch {
    return DEFAULT_CART_SETTINGS;
  }
}

export function serializeCartSettings(settings: CartSettings) {
  return JSON.stringify(mergeCartSettings(settings));
}

export function parseMoneySetting(value?: string | null, fallback = 0) {
  if (!value) return fallback;
  const normalized = value.replace(/[^\d.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}
