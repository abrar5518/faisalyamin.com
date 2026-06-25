export type EmailMode = "hidden" | "optional" | "required";

export type CheckoutSettings = {
  yourDetailsStepLabel: string;
  deliveryAddressStepLabel: string;
  confirmOrderStepLabel: string;
  phoneLabel: string;
  phonePlaceholder: string;
  phoneHelper: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  emailLabel: string;
  emailOptionalLabel: string;
  emailPlaceholder: string;
  emailMode: EmailMode;
  cityLabel: string;
  cityPlaceholder: string;
  cityOptions: string[];
  addressLabel: string;
  addressPlaceholder: string;
  addressHelper: string;
  paymentSectionTitle: string;
  orderSummaryTitle: string;
  emptyCartMessage: string;
  trustBadges: string[];
  helpTitle: string;
  helpButtonLabel: string;
  successTitle: string;
  successSubtitle: string;
  successOrderNumberLabel: string;
  successExpectedDeliveryLabel: string;
  successExpectedDeliveryText: string;
  successTotalLabel: string;
  successPreparedTitle: string;
  successPreparedText: string;
  successSupportButtonLabel: string;
};

export const DEFAULT_CITY_OPTIONS = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Sialkot",
  "Gujranwala",
  "Sargodha",
  "Bahawalpur",
  "Sukkur",
  "Larkana",
  "Sheikhupura",
  "Rahim Yar Khan",
  "Jhelum",
  "Gujrat",
  "Abbottabad",
  "Mardan",
  "Okara",
  "Sahiwal",
  "Wah Cantt",
  "Other",
];

export const DEFAULT_CHECKOUT_SETTINGS: CheckoutSettings = {
  yourDetailsStepLabel: "Your Details",
  deliveryAddressStepLabel: "Delivery Address",
  confirmOrderStepLabel: "Confirm Order",
  phoneLabel: "Phone Number",
  phonePlaceholder: "03XX XXXXXXX",
  phoneHelper: "We will call or WhatsApp for order confirmation.",
  fullNameLabel: "Full Name",
  fullNamePlaceholder: "Muhammad Ali",
  emailLabel: "Email",
  emailOptionalLabel: "Optional",
  emailPlaceholder: "you@example.com",
  emailMode: "optional",
  cityLabel: "City",
  cityPlaceholder: "Select your city",
  cityOptions: DEFAULT_CITY_OPTIONS,
  addressLabel: "Full Address",
  addressPlaceholder: "House number, street, area, city",
  addressHelper: "Courier will deliver your parcel on this address.",
  paymentSectionTitle: "Payment Method",
  orderSummaryTitle: "Confirm Order",
  emptyCartMessage: "Your cart is empty. Please add a product before checkout.",
  trustBadges: [
    "Cash on Delivery",
    "Delivery All Over Pakistan",
    "Easy Returns",
    "WhatsApp Support",
    "Secure Checkout",
  ],
  helpTitle: "Need help placing order?",
  helpButtonLabel: "Chat on WhatsApp",
  successTitle: "Order Placed Successfully",
  successSubtitle:
    "Thank you. We will call or WhatsApp you soon to confirm your Cash on Delivery order before dispatch.",
  successOrderNumberLabel: "Order Number",
  successExpectedDeliveryLabel: "Expected Delivery",
  successExpectedDeliveryText: "3-7 working days",
  successTotalLabel: "Total",
  successPreparedTitle: "Your order is being prepared",
  successPreparedText:
    "Items: {{items}} - Payment: Cash on Delivery - Delivery: All over Pakistan",
  successSupportButtonLabel: "WhatsApp Support",
};

function cleanList(value: unknown, fallback: string[], limit: number) {
  if (!Array.isArray(value)) return fallback;
  const items = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, limit);
  return items.length ? items : fallback;
}

function mergeCheckoutSettings(value: unknown): CheckoutSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return DEFAULT_CHECKOUT_SETTINGS;
  }

  const input = value as Record<string, unknown>;
  const merged: CheckoutSettings = { ...DEFAULT_CHECKOUT_SETTINGS };

  for (const key of Object.keys(DEFAULT_CHECKOUT_SETTINGS) as Array<keyof CheckoutSettings>) {
    const defaultValue = DEFAULT_CHECKOUT_SETTINGS[key];
    const incoming = input[key];

    if (Array.isArray(defaultValue)) {
      const fallback = defaultValue as string[];
      merged[key] = cleanList(incoming, fallback, key === "cityOptions" ? 80 : 12) as never;
    } else if (key === "emailMode") {
      merged.emailMode =
        incoming === "hidden" || incoming === "required" || incoming === "optional"
          ? incoming
          : DEFAULT_CHECKOUT_SETTINGS.emailMode;
    } else if (typeof defaultValue === "string") {
      merged[key] = (typeof incoming === "string" ? incoming : defaultValue) as never;
    }
  }

  return merged;
}

export function parseCheckoutSettings(value?: string | null): CheckoutSettings {
  if (!value?.trim()) return DEFAULT_CHECKOUT_SETTINGS;

  try {
    return mergeCheckoutSettings(JSON.parse(value));
  } catch {
    return DEFAULT_CHECKOUT_SETTINGS;
  }
}

export function serializeCheckoutSettings(settings: CheckoutSettings) {
  return JSON.stringify(mergeCheckoutSettings(settings));
}

export function listToTextareaValue(items: string[]) {
  return items.join("\n");
}

export function textareaValueToList(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function renderCheckoutTemplate(
  value: string,
  tokens: Record<string, string | number>
) {
  return Object.entries(tokens).reduce(
    (text, [key, tokenValue]) => text.replaceAll(`{{${key}}}`, String(tokenValue)),
    value
  );
}
