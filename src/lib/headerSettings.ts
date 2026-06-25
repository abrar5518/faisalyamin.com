export type HeaderMenuItem = {
  label: string;
  href: string;
  enabled?: boolean;
};

export const DEFAULT_HEADER_MENU_ITEMS: HeaderMenuItem[] = [
  { label: "Shop", href: "/shop", enabled: true },
  { label: "Categories", href: "/categories", enabled: true },
  { label: "Deals", href: "/deals", enabled: true },
  { label: "Blog", href: "/blog", enabled: true },
];

export const DEFAULT_HEADER_SEARCH_PLACEHOLDER =
  "Search products, categories, or deals...";

function normalizeHref(href: string) {
  const value = href.trim();
  if (!value) return "";
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  return value.startsWith("/") ? value : `/${value}`;
}

export function sanitizeHeaderMenuItems(items: HeaderMenuItem[]) {
  return items
    .map((item) => ({
      label: item.label.trim(),
      href: normalizeHref(item.href),
      enabled: item.enabled !== false,
    }))
    .filter((item) => item.label && item.href)
    .slice(0, 8);
}

export function parseHeaderMenuItems(value?: string | null) {
  if (!value?.trim()) return DEFAULT_HEADER_MENU_ITEMS;

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return DEFAULT_HEADER_MENU_ITEMS;

    const items = sanitizeHeaderMenuItems(
      parsed.map((item) => {
        if (!item || typeof item !== "object") {
          return { label: "", href: "", enabled: false };
        }

        const entry = item as Record<string, unknown>;
        return {
          label: typeof entry.label === "string" ? entry.label : "",
          href: typeof entry.href === "string" ? entry.href : "",
          enabled:
            typeof entry.enabled === "boolean" ? entry.enabled : true,
        };
      })
    );

    return items.length ? items : DEFAULT_HEADER_MENU_ITEMS;
  } catch {
    return DEFAULT_HEADER_MENU_ITEMS;
  }
}

export function serializeHeaderMenuItems(items: HeaderMenuItem[]) {
  return JSON.stringify(sanitizeHeaderMenuItems(items));
}
