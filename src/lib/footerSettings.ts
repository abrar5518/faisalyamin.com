export type FooterLinkItem = {
  label: string;
  href: string;
  enabled?: boolean;
};

export type FooterColumn = {
  title: string;
  links: FooterLinkItem[];
  enabled?: boolean;
};

export type FooterTrustItem = {
  title: string;
  description?: string;
  enabled?: boolean;
};

export type FooterSocialLink = {
  label: string;
  href: string;
  enabled?: boolean;
};

export const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Shop",
    enabled: true,
    links: [
      { label: "Shop All", href: "/shop", enabled: true },
      { label: "Categories", href: "/categories", enabled: true },
      { label: "Deals", href: "/deals", enabled: true },
      { label: "Blog", href: "/blog", enabled: true },
      { label: "Cart", href: "/cart", enabled: true },
      { label: "Account", href: "/account", enabled: true },
    ],
  },
  {
    title: "Company",
    enabled: true,
    links: [
      { label: "Contact", href: "/contact", enabled: true },
      { label: "Privacy Policy", href: "/privacy", enabled: true },
      { label: "Shipping", href: "/shipping", enabled: true },
      { label: "Returns", href: "/returns", enabled: true },
    ],
  },
  {
    title: "Support",
    enabled: true,
    links: [
      { label: "FAQ", href: "/faq", enabled: true },
      { label: "Returns", href: "/returns", enabled: true },
      { label: "Contact Us", href: "/contact", enabled: true },
      { label: "Track Order", href: "/account/orders", enabled: true },
    ],
  },
];

export const DEFAULT_FOOTER_TRUST_ITEMS: FooterTrustItem[] = [
  {
    title: "Quality Checked",
    description: "Checked before dispatch",
    enabled: true,
  },
  {
    title: "Shipping",
    description: "Fast delivery across Pakistan",
    enabled: true,
  },
  {
    title: "Support",
    description: "WhatsApp help",
    enabled: true,
  },
];

export const DEFAULT_FOOTER_SOCIAL_LINKS: FooterSocialLink[] = [];

export const DEFAULT_FOOTER_NEWSLETTER = {
  eyebrow: "Store updates",
  title: "Get deals, launches and restock alerts",
  subtitle: "Weekly offers and product updates from the store.",
  consentText: "By subscribing you agree to our privacy policy.",
};

export const DEFAULT_FOOTER_COPYRIGHT =
  "Copyright (c) {{year}} {{siteName}}. All rights reserved.";

function normalizeHref(href: string) {
  const value = href.trim();
  if (!value) return "";
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  return value.startsWith("/") ? value : `/${value}`;
}

export function sanitizeFooterLinks(items: FooterLinkItem[]) {
  return items
    .map((item) => ({
      label: item.label.trim(),
      href: normalizeHref(item.href),
      enabled: item.enabled !== false,
    }))
    .filter((item) => item.label && item.href)
    .slice(0, 12);
}

export function sanitizeFooterColumns(columns: FooterColumn[]) {
  return columns
    .map((column) => ({
      title: column.title.trim(),
      enabled: column.enabled !== false,
      links: sanitizeFooterLinks(column.links || []),
    }))
    .filter((column) => column.title && column.links.length)
    .slice(0, 5);
}

export function sanitizeFooterTrustItems(items: FooterTrustItem[]) {
  return items
    .map((item) => ({
      title: item.title.trim(),
      description: item.description?.trim() || "",
      enabled: item.enabled !== false,
    }))
    .filter((item) => item.title)
    .slice(0, 6);
}

export function sanitizeFooterSocialLinks(items: FooterSocialLink[]) {
  return items
    .map((item) => ({
      label: item.label.trim(),
      href: normalizeHref(item.href),
      enabled: item.enabled !== false,
    }))
    .filter((item) => item.label && item.href)
    .slice(0, 8);
}

function parseJsonArray(value?: string | null) {
  if (!value?.trim()) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function parseFooterColumns(value?: string | null) {
  const parsed = parseJsonArray(value);
  if (!parsed) return DEFAULT_FOOTER_COLUMNS;

  const columns = sanitizeFooterColumns(
    parsed.map((column) => {
      if (!column || typeof column !== "object") {
        return { title: "", links: [], enabled: false };
      }

      const entry = column as Record<string, unknown>;
      const rawLinks = Array.isArray(entry.links) ? entry.links : [];
      return {
        title: typeof entry.title === "string" ? entry.title : "",
        enabled: typeof entry.enabled === "boolean" ? entry.enabled : true,
        links: rawLinks.map((link) => {
          if (!link || typeof link !== "object") {
            return { label: "", href: "", enabled: false };
          }

          const linkEntry = link as Record<string, unknown>;
          return {
            label: typeof linkEntry.label === "string" ? linkEntry.label : "",
            href: typeof linkEntry.href === "string" ? linkEntry.href : "",
            enabled:
              typeof linkEntry.enabled === "boolean" ? linkEntry.enabled : true,
          };
        }),
      };
    })
  );

  return columns.length ? columns : DEFAULT_FOOTER_COLUMNS;
}

export function parseFooterTrustItems(value?: string | null) {
  const parsed = parseJsonArray(value);
  if (!parsed) return DEFAULT_FOOTER_TRUST_ITEMS;

  const items = sanitizeFooterTrustItems(
    parsed.map((item) => {
      if (!item || typeof item !== "object") {
        return { title: "", description: "", enabled: false };
      }

      const entry = item as Record<string, unknown>;
      return {
        title: typeof entry.title === "string" ? entry.title : "",
        description:
          typeof entry.description === "string" ? entry.description : "",
        enabled: typeof entry.enabled === "boolean" ? entry.enabled : true,
      };
    })
  );

  return items.length ? items : DEFAULT_FOOTER_TRUST_ITEMS;
}

export function parseFooterSocialLinks(value?: string | null) {
  const parsed = parseJsonArray(value);
  if (!parsed) return DEFAULT_FOOTER_SOCIAL_LINKS;

  return sanitizeFooterSocialLinks(
    parsed.map((item) => {
      if (!item || typeof item !== "object") {
        return { label: "", href: "", enabled: false };
      }

      const entry = item as Record<string, unknown>;
      return {
        label: typeof entry.label === "string" ? entry.label : "",
        href: typeof entry.href === "string" ? entry.href : "",
        enabled: typeof entry.enabled === "boolean" ? entry.enabled : true,
      };
    })
  );
}

export function serializeFooterColumns(columns: FooterColumn[]) {
  return JSON.stringify(sanitizeFooterColumns(columns));
}

export function serializeFooterTrustItems(items: FooterTrustItem[]) {
  return JSON.stringify(sanitizeFooterTrustItems(items));
}

export function serializeFooterSocialLinks(items: FooterSocialLink[]) {
  return JSON.stringify(sanitizeFooterSocialLinks(items));
}
