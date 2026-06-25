import { prisma } from "@/lib/prisma";
import {
  DEFAULT_CART_SETTINGS,
  serializeCartSettings,
} from "@/lib/cartSettings";
import {
  DEFAULT_CATALOG_SETTINGS,
  serializeCatalogSettings,
} from "@/lib/catalogSettings";
import {
  DEFAULT_CHECKOUT_SETTINGS,
  serializeCheckoutSettings,
} from "@/lib/checkoutSettings";
import {
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_FOOTER_COPYRIGHT,
  DEFAULT_FOOTER_NEWSLETTER,
  DEFAULT_FOOTER_SOCIAL_LINKS,
  DEFAULT_FOOTER_TRUST_ITEMS,
  serializeFooterColumns,
  serializeFooterSocialLinks,
  serializeFooterTrustItems,
} from "@/lib/footerSettings";
import {
  DEFAULT_GLOBAL_COPY,
  serializeGlobalCopy,
} from "@/lib/globalCopy";
import {
  DEFAULT_HEADER_MENU_ITEMS,
  DEFAULT_HEADER_SEARCH_PLACEHOLDER,
  parseHeaderMenuItems,
  serializeHeaderMenuItems,
} from "@/lib/headerSettings";
import {
  DEFAULT_THEME_SETTINGS,
  serializeThemeSettings,
} from "@/lib/themeSettings";
import {
  serializeReusableBlockItems,
  type ReusableBlockItem,
} from "@/lib/reusableBlocks";

export type OnboardingTaskGroup =
  | "Brand"
  | "Store"
  | "Content"
  | "Catalog"
  | "Conversion"
  | "Growth";

export type OnboardingTask = {
  id: string;
  group: OnboardingTaskGroup;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  required: boolean;
  complete: boolean;
  detail?: string;
};

export type OnboardingSummary = {
  total: number;
  completed: number;
  requiredTotal: number;
  requiredCompleted: number;
  percent: number;
  isLaunchReady: boolean;
  tasks: OnboardingTask[];
  counts: {
    products: number;
    categories: number;
    pages: number;
    reusableBlocks: number;
  };
  lastCheckedAt: string;
};

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

function countComplete(tasks: OnboardingTask[]) {
  return tasks.filter((task) => task.complete).length;
}

function countRequiredComplete(tasks: OnboardingTask[]) {
  return tasks.filter((task) => task.required && task.complete).length;
}

function parseJsonObject(value?: string | null) {
  if (!value?.trim()) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function getOnboardingSummary(): Promise<OnboardingSummary> {
  const [
    siteSettings,
    storeSettings,
    contact,
    products,
    categories,
    pages,
    reusableBlocks,
  ] = await Promise.all([
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
    prisma.storeSettings.findFirst({ orderBy: { id: "asc" } }),
    prisma.contact.findFirst({ orderBy: { id: "asc" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count(),
    prisma.page.count(),
    prisma.reusableBlock.count({ where: { isEnabled: true } }),
  ]);

  const headerItems = parseHeaderMenuItems(siteSettings?.headerMenuItems).filter(
    (item) => item.enabled !== false
  );
  const themeConfigured = Boolean(parseJsonObject(siteSettings?.themeSettings));
  const checkoutConfigured = Boolean(parseJsonObject(siteSettings?.checkoutSettings));
  const trackingConfigured = Boolean(
    hasText(siteSettings?.metaPixelIds) ||
      hasText(siteSettings?.googleTagManagerId) ||
      hasText(siteSettings?.microsoftClarityId) ||
      hasText(siteSettings?.customHeadScripts) ||
      hasText(siteSettings?.customBodyEndScripts)
  );

  const tasks: OnboardingTask[] = [
    {
      id: "brand",
      group: "Brand",
      title: "Upload logo and store name",
      description: "Public header, checkout, and emails should show the client brand.",
      href: "/admin/settings?tab=branding",
      actionLabel: "Open branding",
      required: true,
      complete: hasText(siteSettings?.logoUrl) && (hasText(siteSettings?.siteName) || hasText(storeSettings?.storeName)),
      detail: hasText(siteSettings?.logoUrl) ? "Logo found" : "Logo missing",
    },
    {
      id: "domain",
      group: "Brand",
      title: "Set website URL once",
      description: "Use one canonical URL/domain source for frontend links, SEO, sitemap, and tracking.",
      href: "/admin/settings?tab=site",
      actionLabel: "Open site settings",
      required: true,
      complete: hasText(siteSettings?.siteUrl) || hasText(storeSettings?.storeDomain),
      detail: siteSettings?.siteUrl || storeSettings?.storeDomain || "URL missing",
    },
    {
      id: "contact",
      group: "Store",
      title: "Add contact and WhatsApp details",
      description: "Customers need a clear support channel before and after ordering.",
      href: "/admin/contact",
      actionLabel: "Open contact",
      required: true,
      complete: Boolean(
        hasText(contact?.whatsapp) &&
          (hasText(contact?.phone) || hasText(contact?.email)) &&
          hasText(contact?.addressLine1)
      ),
      detail: hasText(contact?.whatsapp) ? "WhatsApp configured" : "WhatsApp missing",
    },
    {
      id: "theme",
      group: "Brand",
      title: "Choose colors and theme style",
      description: "Primary color, accent color, button radius, and typography should match the client.",
      href: "/admin/settings?tab=design",
      actionLabel: "Open theme",
      required: true,
      complete: themeConfigured,
      detail: themeConfigured ? "Custom theme saved" : "Default theme only",
    },
    {
      id: "navigation",
      group: "Content",
      title: "Configure header menu",
      description: "Keep the main navigation short, clear, and niche-appropriate.",
      href: "/admin/settings?tab=headerFooter",
      actionLabel: "Open menus",
      required: true,
      complete: Boolean(siteSettings?.headerMenuItems && headerItems.length >= 2),
      detail: `${headerItems.length} active links`,
    },
    {
      id: "footer",
      group: "Content",
      title: "Configure footer links and text",
      description: "Footer should include policy pages, support links, and client-specific copyright.",
      href: "/admin/settings?tab=headerFooter",
      actionLabel: "Open footer",
      required: true,
      complete: hasText(siteSettings?.footerColumns) && hasText(siteSettings?.footerCopyright),
      detail: hasText(siteSettings?.footerColumns) ? "Footer saved" : "Footer defaults only",
    },
    {
      id: "checkout",
      group: "Conversion",
      title: "Review checkout and COD settings",
      description: "Checkout labels, city list, shipping fee, COD, and trust badges should be ready.",
      href: "/admin/settings?tab=checkout",
      actionLabel: "Open checkout",
      required: true,
      complete: Boolean(checkoutConfigured && storeSettings?.codEnabled && hasText(storeSettings?.defaultShippingFee)),
      detail: storeSettings?.codEnabled ? "COD enabled" : "COD disabled",
    },
    {
      id: "categories",
      group: "Catalog",
      title: "Create product categories",
      description: "Categories make product browsing easier and keep the shop reusable for any niche.",
      href: "/admin/categories",
      actionLabel: "Open categories",
      required: true,
      complete: categories > 0,
      detail: `${categories} categories`,
    },
    {
      id: "products",
      group: "Catalog",
      title: "Add first active products",
      description: "At least one active product is required before launch.",
      href: "/admin/products",
      actionLabel: "Open products",
      required: true,
      complete: products > 0,
      detail: `${products} active products`,
    },
    {
      id: "pages",
      group: "Content",
      title: "Prepare core information pages",
      description: "Shipping, returns, privacy, terms, FAQ, and contact pages reduce customer doubts.",
      href: "/admin/pages",
      actionLabel: "Open pages",
      required: true,
      complete: pages >= 5,
      detail: `${pages} pages`,
    },
    {
      id: "tracking",
      group: "Growth",
      title: "Add tracking and marketing IDs",
      description: "Meta Pixel, Google Tag Manager, Clarity, and custom snippets can be managed centrally.",
      href: "/admin/settings?tab=tracking",
      actionLabel: "Open tracking",
      required: false,
      complete: trackingConfigured,
      detail: trackingConfigured ? "Tracking found" : "No tracking IDs",
    },
    {
      id: "reusable-blocks",
      group: "Conversion",
      title: "Create reusable trust blocks",
      description: "Trust badges, COD messages, delivery notes, and WhatsApp help can be reused anywhere.",
      href: "/admin/reusable-blocks",
      actionLabel: "Open blocks",
      required: false,
      complete: reusableBlocks > 0,
      detail: `${reusableBlocks} enabled blocks`,
    },
  ];

  const total = tasks.length;
  const completed = countComplete(tasks);
  const requiredTotal = tasks.filter((task) => task.required).length;
  const requiredCompleted = countRequiredComplete(tasks);

  return {
    total,
    completed,
    requiredTotal,
    requiredCompleted,
    percent: Math.round((completed / total) * 100),
    isLaunchReady: requiredCompleted === requiredTotal,
    tasks,
    counts: {
      products,
      categories,
      pages,
      reusableBlocks,
    },
    lastCheckedAt: new Date().toISOString(),
  };
}

function fillString<T extends Record<string, unknown>>(data: T, key: keyof T, value: string) {
  if (!hasText(data[key] as string | null | undefined)) {
    data[key] = value as T[keyof T];
  }
}

export async function applyGenericOnboardingTemplate() {
  const siteSettings = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
  const storeSettings = await prisma.storeSettings.findFirst({ orderBy: { id: "asc" } });

  const siteData = {
    siteName: siteSettings?.siteName ?? null,
    logoAlt: siteSettings?.logoAlt ?? null,
    siteIconAlt: siteSettings?.siteIconAlt ?? null,
    siteFooterText: siteSettings?.siteFooterText ?? null,
    headerMenuItems: siteSettings?.headerMenuItems ?? null,
    headerSearchPlaceholder: siteSettings?.headerSearchPlaceholder ?? null,
    footerCopyright: siteSettings?.footerCopyright ?? null,
    footerColumns: siteSettings?.footerColumns ?? null,
    footerNewsletterEyebrow: siteSettings?.footerNewsletterEyebrow ?? null,
    footerNewsletterTitle: siteSettings?.footerNewsletterTitle ?? null,
    footerNewsletterSubtitle: siteSettings?.footerNewsletterSubtitle ?? null,
    footerNewsletterConsentText: siteSettings?.footerNewsletterConsentText ?? null,
    footerTrustItems: siteSettings?.footerTrustItems ?? null,
    footerSocialLinks: siteSettings?.footerSocialLinks ?? null,
    globalCopy: siteSettings?.globalCopy ?? null,
    checkoutSettings: siteSettings?.checkoutSettings ?? null,
    cartSettings: siteSettings?.cartSettings ?? null,
    catalogSettings: siteSettings?.catalogSettings ?? null,
    themeSettings: siteSettings?.themeSettings ?? null,
  };

  fillString(siteData, "siteName", "Your Store");
  fillString(siteData, "logoAlt", "Store logo");
  fillString(siteData, "siteIconAlt", "Store icon");
  fillString(siteData, "siteFooterText", "Reliable products, simple checkout, and helpful support.");
  fillString(siteData, "headerMenuItems", serializeHeaderMenuItems(DEFAULT_HEADER_MENU_ITEMS));
  fillString(siteData, "headerSearchPlaceholder", DEFAULT_HEADER_SEARCH_PLACEHOLDER);
  fillString(siteData, "footerCopyright", DEFAULT_FOOTER_COPYRIGHT);
  fillString(siteData, "footerColumns", serializeFooterColumns(DEFAULT_FOOTER_COLUMNS));
  fillString(siteData, "footerNewsletterEyebrow", DEFAULT_FOOTER_NEWSLETTER.eyebrow);
  fillString(siteData, "footerNewsletterTitle", DEFAULT_FOOTER_NEWSLETTER.title);
  fillString(siteData, "footerNewsletterSubtitle", DEFAULT_FOOTER_NEWSLETTER.subtitle);
  fillString(siteData, "footerNewsletterConsentText", DEFAULT_FOOTER_NEWSLETTER.consentText);
  fillString(siteData, "footerTrustItems", serializeFooterTrustItems(DEFAULT_FOOTER_TRUST_ITEMS));
  fillString(siteData, "footerSocialLinks", serializeFooterSocialLinks(DEFAULT_FOOTER_SOCIAL_LINKS));
  fillString(siteData, "globalCopy", serializeGlobalCopy(DEFAULT_GLOBAL_COPY));
  fillString(siteData, "checkoutSettings", serializeCheckoutSettings(DEFAULT_CHECKOUT_SETTINGS));
  fillString(siteData, "cartSettings", serializeCartSettings(DEFAULT_CART_SETTINGS));
  fillString(siteData, "catalogSettings", serializeCatalogSettings(DEFAULT_CATALOG_SETTINGS));
  fillString(siteData, "themeSettings", serializeThemeSettings(DEFAULT_THEME_SETTINGS));

  if (siteSettings) {
    await prisma.siteSettings.update({ where: { id: siteSettings.id }, data: siteData });
  } else {
    await prisma.siteSettings.create({ data: siteData });
  }

  const storeData = {
    storeName: storeSettings?.storeName ?? null,
    storeDomain: storeSettings?.storeDomain ?? null,
    freeShippingThreshold: storeSettings?.freeShippingThreshold ?? null,
    defaultShippingFee: storeSettings?.defaultShippingFee ?? null,
    returnsDays: storeSettings?.returnsDays ?? null,
    codEnabled: storeSettings?.codEnabled ?? true,
    cardEnabled: storeSettings?.cardEnabled ?? false,
    gatewayName: storeSettings?.gatewayName ?? null,
    cryptoEnabled: storeSettings?.cryptoEnabled ?? false,
    siteTitle: storeSettings?.siteTitle ?? null,
    siteMetaDesc: storeSettings?.siteMetaDesc ?? null,
    indexable: storeSettings?.indexable ?? true,
  };

  fillString(storeData, "storeName", "Your Store");
  fillString(storeData, "storeDomain", "https://example.com");
  fillString(storeData, "freeShippingThreshold", "5000");
  fillString(storeData, "defaultShippingFee", "250");
  fillString(storeData, "gatewayName", "Cash on Delivery");
  fillString(storeData, "siteTitle", "Your Store - Online Shopping");
  fillString(
    storeData,
    "siteMetaDesc",
    "Shop quality products online with simple checkout and reliable delivery."
  );
  if (storeData.returnsDays === null) storeData.returnsDays = 7;

  if (storeSettings) {
    await prisma.storeSettings.update({ where: { id: storeSettings.id }, data: storeData });
  } else {
    await prisma.storeSettings.create({ data: storeData });
  }

  await seedGenericCategory();
  await seedGenericPages();
  await seedGenericReusableBlocks();

  return getOnboardingSummary();
}

async function seedGenericCategory() {
  const existing = await prisma.category.count();
  if (existing > 0) return;

  await prisma.category.create({
    data: {
      name: "General",
      slug: "general",
      description: "Browse all store products.",
      descriptionHtml:
        "<p>Use this category as a starter collection. Rename it from admin to match the client's product niche.</p>",
      metaTitle: "General Products",
      metaDescription: "Browse products available in this store.",
    },
  });
}

async function seedGenericPages() {
  const pages = [
    {
      slug: "shipping",
      title: "Shipping",
      contentHtml:
        "<p>We deliver orders through reliable courier partners. Delivery timelines and charges can be customized from admin settings.</p>",
      shortDescription: "Delivery information and shipping timelines.",
    },
    {
      slug: "returns",
      title: "Returns",
      contentHtml:
        "<p>If a customer receives the wrong or damaged item, they can contact support for help with the return process.</p>",
      shortDescription: "Return policy and customer support guidance.",
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      contentHtml:
        "<p>This store collects only the information required to process orders, provide support, and improve the shopping experience.</p>",
      shortDescription: "How customer information is handled.",
    },
    {
      slug: "terms",
      title: "Terms & Conditions",
      contentHtml:
        "<p>By placing an order, customers agree to provide accurate details and accept the store's order confirmation process.</p>",
      shortDescription: "Basic shopping terms for this store.",
    },
    {
      slug: "faq",
      title: "FAQ",
      contentHtml:
        "<p>Add common customer questions here, including delivery time, payment method, returns, and WhatsApp support.</p>",
      shortDescription: "Frequently asked questions.",
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        ...page,
        metaTitle: page.title,
        metaDescription: page.shortDescription,
      },
    });
  }
}

async function seedGenericReusableBlocks() {
  const checkoutItems: ReusableBlockItem[] = [
    { title: "Cash on Delivery", text: "Customers can pay when the parcel arrives." },
    { title: "Delivery across Pakistan", text: "Courier delivery can be configured for the store." },
    { title: "Easy returns", text: "Support can guide customers if an issue happens." },
    { title: "WhatsApp support", text: "Help is available before and after ordering." },
  ];

  await prisma.reusableBlock.upsert({
    where: { slug: "starter-checkout-trust" },
    update: {},
    create: {
      title: "Checkout Trust",
      slug: "starter-checkout-trust",
      type: "trust",
      placement: "checkout",
      eyebrow: "Safe order",
      bodyHtml: "<p>Place your order with confidence. Support is available if you need help.</p>",
      icon: "shield",
      itemsJson: serializeReusableBlockItems(checkoutItems),
      isEnabled: true,
      sortOrder: 20,
    },
  });

  await prisma.reusableBlock.upsert({
    where: { slug: "starter-whatsapp-help" },
    update: {},
    create: {
      title: "WhatsApp Help",
      slug: "starter-whatsapp-help",
      type: "help",
      placement: "general",
      eyebrow: "Need help?",
      bodyHtml: "<p>Customers can contact support on WhatsApp before placing an order.</p>",
      icon: "message",
      primaryLabel: "Contact Support",
      primaryHref: "/contact",
      isEnabled: true,
      sortOrder: 30,
    },
  });
}
