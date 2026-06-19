export type GlobalCopy = {
  product: {
    addToCart: string;
    buyNow: string;
    mobileCartShort: string;
    relatedProductsTitle: string;
  };
  cart: {
    drawerTitle: string;
    drawerSubtitle: string;
    emptyTitle: string;
    emptyBody: string;
    continueShopping: string;
    viewCart: string;
    checkout: string;
    subtotal: string;
    shipping: string;
    discount: string;
    total: string;
    noShipping: string;
    shippingNote: string;
    freeShippingProgress: string;
    freeShippingUnlocked: string;
    lineTotal: string;
    itemsTitle: string;
    itemsCount: string;
    addMore: string;
    removeItem: string;
    itemShippingBadge: string;
    savedAmount: string;
    cartPageTitle: string;
    cartPageSubtitle: string;
    cartPageEmptyBody: string;
    cartPageEmptyPrimary: string;
    cartPageEmptySecondary: string;
    orderSummaryTitle: string;
    orderSummaryNote: string;
    couponTitle: string;
    couponHelp: string;
    couponPlaceholder: string;
    applyCoupon: string;
    applyingCoupon: string;
    appliedCoupon: string;
    removeCoupon: string;
    continue: string;
    secureNote: string;
    needHelpTitle: string;
    needHelpBody: string;
    contactSupport: string;
    trackOrder: string;
    secureCheckoutBadge: string;
    breadcrumbHome: string;
    breadcrumbCart: string;
    mobileSummary: string;
  };
  checkout: {
    checkout: string;
    codTitle: string;
    codHelper: string;
    placeOrder: string;
    placeOrderSubtext: string;
    placingOrder: string;
    continueShopping: string;
  };
  trust: {
    qualityTitle: string;
    qualityText: string;
    shippingTitle: string;
    shippingText: string;
    supportTitle: string;
    supportText: string;
  };
};

export const DEFAULT_GLOBAL_COPY: GlobalCopy = {
  product: {
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    mobileCartShort: "Cart",
    relatedProductsTitle: "Related products",
  },
  cart: {
    drawerTitle: "Your cart",
    drawerSubtitle: "{{count}} item(s) ready for checkout",
    emptyTitle: "Your cart is empty",
    emptyBody:
      "Looks like you have not added anything yet. Find something useful and we will keep it here.",
    continueShopping: "Continue Shopping",
    viewCart: "View Cart",
    checkout: "Checkout",
    subtotal: "Subtotal",
    shipping: "Shipping",
    discount: "Discount",
    total: "Total",
    noShipping: "Free",
    shippingNote: "Shipping and any discounts are calculated at checkout.",
    freeShippingProgress: "Add {{amount}} more for free shipping.",
    freeShippingUnlocked: "Free shipping unlocked for this order.",
    lineTotal: "Line total",
    itemsTitle: "Items",
    itemsCount: "{{count}} item(s) in cart",
    addMore: "Add more",
    removeItem: "Remove",
    itemShippingBadge: "Insured shipping",
    savedAmount: "You save {{amount}}",
    cartPageTitle: "Shopping cart",
    cartPageSubtitle: "Review items, adjust quantities, and proceed to checkout.",
    cartPageEmptyBody: "Browse products and add items to your cart.",
    cartPageEmptyPrimary: "Explore categories",
    cartPageEmptySecondary: "Shop all products",
    orderSummaryTitle: "Order summary",
    orderSummaryNote: "Taxes & shipping calculated at checkout.",
    couponTitle: "Coupon",
    couponHelp: "Enter a coupon code to apply discounts.",
    couponPlaceholder: "Enter coupon code",
    applyCoupon: "Apply",
    applyingCoupon: "Applying...",
    appliedCoupon: "Applied: {{code}}",
    removeCoupon: "Remove",
    continue: "Continue",
    secureNote:
      "Secure payments. Signature required for delivery. Returns within 7 days.",
    needHelpTitle: "Need help?",
    needHelpBody:
      "Share your budget and preferences. We will recommend the best options.",
    contactSupport: "Contact Support",
    trackOrder: "Track Order",
    secureCheckoutBadge: "Secure checkout",
    breadcrumbHome: "Home",
    breadcrumbCart: "Cart",
    mobileSummary: "{{count}} item(s) - Shipping {{shipping}}",
  },
  checkout: {
    checkout: "Checkout",
    codTitle: "Cash on Delivery",
    codHelper: "Pay when parcel arrives.",
    placeOrder: "Place My Order",
    placeOrderSubtext: "Pay Cash on Delivery",
    placingOrder: "Placing Order...",
    continueShopping: "Continue Shopping",
  },
  trust: {
    qualityTitle: "Quality checked",
    qualityText: "Checked before dispatch",
    shippingTitle: "Shipping",
    shippingText: "Delivery across Pakistan",
    supportTitle: "Support",
    supportText: "Fast WhatsApp help",
  },
};

function mergeObject<T extends Record<string, unknown>>(defaults: T, value: unknown): T {
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;

  const input = value as Record<string, unknown>;
  const output: Record<string, unknown> = { ...defaults };

  for (const key of Object.keys(defaults)) {
    const defaultValue = defaults[key];
    const incoming = input[key];

    if (typeof defaultValue === "string") {
      output[key] = typeof incoming === "string" ? incoming : defaultValue;
    } else if (
      defaultValue &&
      typeof defaultValue === "object" &&
      !Array.isArray(defaultValue)
    ) {
      output[key] = mergeObject(defaultValue as Record<string, unknown>, incoming);
    }
  }

  return output as T;
}

export function parseGlobalCopy(value?: string | null): GlobalCopy {
  if (!value?.trim()) return DEFAULT_GLOBAL_COPY;

  try {
    return mergeObject(DEFAULT_GLOBAL_COPY, JSON.parse(value));
  } catch {
    return DEFAULT_GLOBAL_COPY;
  }
}

export function serializeGlobalCopy(copy: GlobalCopy) {
  return JSON.stringify(mergeObject(DEFAULT_GLOBAL_COPY, copy));
}

export function renderCopyTemplate(value: string, tokens: Record<string, string | number>) {
  return Object.entries(tokens).reduce(
    (text, [key, tokenValue]) => text.replaceAll(`{{${key}}}`, String(tokenValue)),
    value
  );
}
