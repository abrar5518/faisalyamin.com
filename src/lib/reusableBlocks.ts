export const REUSABLE_BLOCK_TYPES = [
  { value: "trust", label: "Trust badges" },
  { value: "cod", label: "Cash on Delivery" },
  { value: "delivery", label: "Delivery message" },
  { value: "returns", label: "Returns snippet" },
  { value: "whatsapp", label: "WhatsApp help" },
  { value: "promo", label: "Promo banner" },
  { value: "shipping", label: "Product shipping info" },
] as const;

export const REUSABLE_BLOCK_PLACEMENTS = [
  { value: "general", label: "General" },
  { value: "cart", label: "Cart" },
  { value: "checkout", label: "Checkout" },
  { value: "product", label: "Product page" },
  { value: "footer", label: "Footer" },
] as const;

export type ReusableBlockType = (typeof REUSABLE_BLOCK_TYPES)[number]["value"];
export type ReusableBlockPlacement = (typeof REUSABLE_BLOCK_PLACEMENTS)[number]["value"];

export type ReusableBlockItem = {
  title: string;
  text: string;
};

export type ReusableBlockViewModel = {
  id: number;
  title: string;
  slug: string;
  type: string;
  placement: string;
  eyebrow?: string | null;
  bodyHtml?: string | null;
  icon?: string | null;
  primaryLabel?: string | null;
  primaryHref?: string | null;
  secondaryLabel?: string | null;
  secondaryHref?: string | null;
  items: ReusableBlockItem[];
  isEnabled: boolean;
  sortOrder: number;
};

export function normalizeReusableBlockSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseReusableBlockItems(value?: string | null): ReusableBlockItem[] {
  if (!value?.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        title: typeof item?.title === "string" ? item.title.trim() : "",
        text: typeof item?.text === "string" ? item.text.trim() : "",
      }))
      .filter((item) => item.title || item.text);
  } catch {
    return [];
  }
}

export function serializeReusableBlockItems(items: ReusableBlockItem[]) {
  return JSON.stringify(
    items
      .map((item) => ({
        title: item.title.trim(),
        text: item.text.trim(),
      }))
      .filter((item) => item.title || item.text)
  );
}

export function mapReusableBlock(row: {
  id: number;
  title: string;
  slug: string;
  type: string;
  placement: string;
  eyebrow?: string | null;
  bodyHtml?: string | null;
  icon?: string | null;
  primaryLabel?: string | null;
  primaryHref?: string | null;
  secondaryLabel?: string | null;
  secondaryHref?: string | null;
  itemsJson?: string | null;
  isEnabled: boolean;
  sortOrder: number;
}): ReusableBlockViewModel {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    type: row.type,
    placement: row.placement,
    eyebrow: row.eyebrow,
    bodyHtml: row.bodyHtml,
    icon: row.icon,
    primaryLabel: row.primaryLabel,
    primaryHref: row.primaryHref,
    secondaryLabel: row.secondaryLabel,
    secondaryHref: row.secondaryHref,
    items: parseReusableBlockItems(row.itemsJson),
    isEnabled: row.isEnabled,
    sortOrder: row.sortOrder,
  };
}
