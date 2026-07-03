export type CatalogTemplateSettings = {
  mobileProductCardLayout: "compact-2" | "classic-1";
  shopFallbackTitle: string;
  shopFallbackSubtitle: string;
  shopFallbackRichHtml: string;
  categoryEyebrow: string;
  categoryFallbackIntro: string;
  categoryTrustBadges: string[];
  categorySearchPlaceholder: string;
  categoryPaginationTip: string;
  categorySubcategoryTitleTemplate: string;
  categorySubcategoryIntro: string;
  categoryHelpTitle: string;
  categoryHelpBody: string;
  categoryHelpPrimaryLabel: string;
  categoryHelpSecondaryLabel: string;
  categoryFaqIntro: string;
  categorySidebarTrustItems: Array<{ title: string; text: string }>;
  subcategoryFallbackIntro: string;
  subcategoryFallbackRichHtml: string;
  subcategoryFaqIntro: string;
  productBrandFallback: string;
  productFallbackDescription: string;
  productGalleryBadges: string[];
  productGalleryTrustItems: Array<{ title: string; text: string }>;
  productPriceLabel: string;
  productShippingNote: string;
  productSizeHelper: string;
  productFinePrint: string;
  productDescriptionTabLabel: string;
  productReviewsTabLabel: string;
  productShippingTabLabel: string;
  productReviewsTitle: string;
  productReviewsIntro: string;
  productShippingReturnsHtml: string;
  productFaqTitleTemplate: string;
  productFaqIntro: string;
  relatedProductsTitle: string;
  relatedProductsSubtitle: string;
  relatedProductsViewAllLabel: string;
};

export const DEFAULT_CATALOG_SETTINGS: CatalogTemplateSettings = {
  mobileProductCardLayout: "compact-2",
  shopFallbackTitle: "Shop",
  shopFallbackSubtitle: "Browse products with secure checkout and reliable delivery.",
  shopFallbackRichHtml: `
    <h2>Shop the full collection</h2>
    <p>Use the filters above to narrow down your search and find the right product for your needs.</p>
    <ul>
      <li>Clear product details and helpful support</li>
      <li>Secure checkout and reliable delivery</li>
      <li>Easy access to delivery, return, and support information</li>
    </ul>
  `,
  categoryEyebrow: "Curated collection",
  categoryFallbackIntro: "Explore curated products with clear details and reliable support.",
  categoryTrustBadges: [
    "Quality checked",
    "Delivery across Pakistan",
    "Secure checkout",
    "Easy returns",
  ],
  categorySearchPlaceholder: "Search in this category...",
  categoryPaginationTip: "Use category filters and product details to compare options before checkout.",
  categorySubcategoryTitleTemplate: "Explore {{category}} collections",
  categorySubcategoryIntro:
    "Browse focused collections to quickly find the right product style, use case, or budget.",
  categoryHelpTitle: "Need help choosing?",
  categoryHelpBody:
    "Share your budget and requirements. We will help you choose the right option.",
  categoryHelpPrimaryLabel: "WhatsApp Support",
  categoryHelpSecondaryLabel: "Track Order",
  categoryFaqIntro: "Quick answers about this category, delivery, returns and choosing the right product.",
  categorySidebarTrustItems: [
    { title: "Quality", text: "Quality checked before dispatch" },
    { title: "Shipping", text: "Reliable delivery support" },
    { title: "Returns", text: "Clear return policy" },
    { title: "Payments", text: "Secure checkout options" },
  ],
  subcategoryFallbackIntro: "Explore products with secure checkout and reliable delivery.",
  subcategoryFallbackRichHtml: `
    <h2>Buying Guide</h2>
    <p>We help you buy with confidence through clear product details, quality checks, and support.</p>
    <h3>Delivery & Returns</h3>
    <ul>
      <li>Delivery support in serviceable areas</li>
      <li>Return policy where applicable</li>
      <li>Support via contact channels configured by the store</li>
    </ul>
  `,
  subcategoryFaqIntro:
    "Quick answers about this subcategory, delivery, returns and choosing the right product.",
  productBrandFallback: "Store",
  productFallbackDescription:
    "A quality checked product with clear details and reliable support.",
  productGalleryBadges: ["Quality Checked", "Insured Shipping"],
  productGalleryTrustItems: [
    { title: "Quality checked", text: "Product details checked before dispatch." },
    { title: "Secure checkout", text: "Protected checkout and order confirmation." },
    { title: "Fast dispatch", text: "Orders are prepared after confirmation." },
  ],
  productPriceLabel: "Price",
  productShippingNote:
    "Inclusive of applicable taxes. Standard shipping is {{shipping}} across Pakistan.",
  productSizeHelper: "Need help choosing? Chat with support for guidance.",
  productFinePrint:
    "By purchasing, you agree to our Terms, Shipping, and Returns policy. Availability may vary by variant.",
  productDescriptionTabLabel: "Description",
  productReviewsTabLabel: "Reviews",
  productShippingTabLabel: "Shipping & Returns",
  productReviewsTitle: "Customer reviews",
  productReviewsIntro: "Real customer feedback to help you shop with confidence.",
  productShippingReturnsHtml: `
    <h3>Shipping & Returns</h3>
    <p>Delivery charges, timelines, and return eligibility are shown through the store policies. Contact support if you need help before placing an order.</p>
  `,
  productFaqTitleTemplate: "{{product}} FAQs",
  productFaqIntro: "Helpful answers about this product before you place an order.",
  relatedProductsTitle: "Related products",
  relatedProductsSubtitle: "Similar picks customers often compare with this item.",
  relatedProductsViewAllLabel: "View all",
};

function cleanString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function cleanList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const items = value.filter(
    (item): item is string => typeof item === "string" && Boolean(item.trim())
  );
  return items.length ? items : fallback;
}

function cleanItems(
  value: unknown,
  fallback: Array<{ title: string; text: string }>
) {
  if (!Array.isArray(value)) return fallback;
  const items = value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const row = item as Record<string, unknown>;
      const title = typeof row.title === "string" ? row.title.trim() : "";
      const text = typeof row.text === "string" ? row.text.trim() : "";
      return title || text ? { title, text } : null;
    })
    .filter((item): item is { title: string; text: string } => Boolean(item));
  return items.length ? items : fallback;
}

function cleanMobileProductCardLayout(value: unknown): CatalogTemplateSettings["mobileProductCardLayout"] {
  return value === "classic-1" ? "classic-1" : "compact-2";
}

function mergeCatalogSettings(value: unknown): CatalogTemplateSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return DEFAULT_CATALOG_SETTINGS;
  }

  const input = value as Record<string, unknown>;

  return {
    ...DEFAULT_CATALOG_SETTINGS,
    mobileProductCardLayout: cleanMobileProductCardLayout(input.mobileProductCardLayout),
    shopFallbackTitle: cleanString(input.shopFallbackTitle, DEFAULT_CATALOG_SETTINGS.shopFallbackTitle),
    shopFallbackSubtitle: cleanString(
      input.shopFallbackSubtitle,
      DEFAULT_CATALOG_SETTINGS.shopFallbackSubtitle
    ),
    shopFallbackRichHtml: cleanString(
      input.shopFallbackRichHtml,
      DEFAULT_CATALOG_SETTINGS.shopFallbackRichHtml
    ),
    categoryEyebrow: cleanString(input.categoryEyebrow, DEFAULT_CATALOG_SETTINGS.categoryEyebrow),
    categoryFallbackIntro: cleanString(
      input.categoryFallbackIntro,
      DEFAULT_CATALOG_SETTINGS.categoryFallbackIntro
    ),
    categoryTrustBadges: cleanList(
      input.categoryTrustBadges,
      DEFAULT_CATALOG_SETTINGS.categoryTrustBadges
    ),
    categorySearchPlaceholder: cleanString(
      input.categorySearchPlaceholder,
      DEFAULT_CATALOG_SETTINGS.categorySearchPlaceholder
    ),
    categoryPaginationTip: cleanString(
      input.categoryPaginationTip,
      DEFAULT_CATALOG_SETTINGS.categoryPaginationTip
    ),
    categorySubcategoryTitleTemplate: cleanString(
      input.categorySubcategoryTitleTemplate,
      DEFAULT_CATALOG_SETTINGS.categorySubcategoryTitleTemplate
    ),
    categorySubcategoryIntro: cleanString(
      input.categorySubcategoryIntro,
      DEFAULT_CATALOG_SETTINGS.categorySubcategoryIntro
    ),
    categoryHelpTitle: cleanString(input.categoryHelpTitle, DEFAULT_CATALOG_SETTINGS.categoryHelpTitle),
    categoryHelpBody: cleanString(input.categoryHelpBody, DEFAULT_CATALOG_SETTINGS.categoryHelpBody),
    categoryHelpPrimaryLabel: cleanString(
      input.categoryHelpPrimaryLabel,
      DEFAULT_CATALOG_SETTINGS.categoryHelpPrimaryLabel
    ),
    categoryHelpSecondaryLabel: cleanString(
      input.categoryHelpSecondaryLabel,
      DEFAULT_CATALOG_SETTINGS.categoryHelpSecondaryLabel
    ),
    categoryFaqIntro: cleanString(input.categoryFaqIntro, DEFAULT_CATALOG_SETTINGS.categoryFaqIntro),
    categorySidebarTrustItems: cleanItems(
      input.categorySidebarTrustItems,
      DEFAULT_CATALOG_SETTINGS.categorySidebarTrustItems
    ),
    subcategoryFallbackIntro: cleanString(
      input.subcategoryFallbackIntro,
      DEFAULT_CATALOG_SETTINGS.subcategoryFallbackIntro
    ),
    subcategoryFallbackRichHtml: cleanString(
      input.subcategoryFallbackRichHtml,
      DEFAULT_CATALOG_SETTINGS.subcategoryFallbackRichHtml
    ),
    subcategoryFaqIntro: cleanString(
      input.subcategoryFaqIntro,
      DEFAULT_CATALOG_SETTINGS.subcategoryFaqIntro
    ),
    productBrandFallback: cleanString(
      input.productBrandFallback,
      DEFAULT_CATALOG_SETTINGS.productBrandFallback
    ),
    productFallbackDescription: cleanString(
      input.productFallbackDescription,
      DEFAULT_CATALOG_SETTINGS.productFallbackDescription
    ),
    productGalleryBadges: cleanList(
      input.productGalleryBadges,
      DEFAULT_CATALOG_SETTINGS.productGalleryBadges
    ),
    productGalleryTrustItems: cleanItems(
      input.productGalleryTrustItems,
      DEFAULT_CATALOG_SETTINGS.productGalleryTrustItems
    ),
    productPriceLabel: cleanString(input.productPriceLabel, DEFAULT_CATALOG_SETTINGS.productPriceLabel),
    productShippingNote: cleanString(
      input.productShippingNote,
      DEFAULT_CATALOG_SETTINGS.productShippingNote
    ),
    productSizeHelper: cleanString(input.productSizeHelper, DEFAULT_CATALOG_SETTINGS.productSizeHelper),
    productFinePrint: cleanString(input.productFinePrint, DEFAULT_CATALOG_SETTINGS.productFinePrint),
    productDescriptionTabLabel: cleanString(
      input.productDescriptionTabLabel,
      DEFAULT_CATALOG_SETTINGS.productDescriptionTabLabel
    ),
    productReviewsTabLabel: cleanString(
      input.productReviewsTabLabel,
      DEFAULT_CATALOG_SETTINGS.productReviewsTabLabel
    ),
    productShippingTabLabel: cleanString(
      input.productShippingTabLabel,
      DEFAULT_CATALOG_SETTINGS.productShippingTabLabel
    ),
    productReviewsTitle: cleanString(
      input.productReviewsTitle,
      DEFAULT_CATALOG_SETTINGS.productReviewsTitle
    ),
    productReviewsIntro: cleanString(
      input.productReviewsIntro,
      DEFAULT_CATALOG_SETTINGS.productReviewsIntro
    ),
    productShippingReturnsHtml: cleanString(
      input.productShippingReturnsHtml,
      DEFAULT_CATALOG_SETTINGS.productShippingReturnsHtml
    ),
    productFaqTitleTemplate: cleanString(
      input.productFaqTitleTemplate,
      DEFAULT_CATALOG_SETTINGS.productFaqTitleTemplate
    ),
    productFaqIntro: cleanString(input.productFaqIntro, DEFAULT_CATALOG_SETTINGS.productFaqIntro),
    relatedProductsTitle: cleanString(
      input.relatedProductsTitle,
      DEFAULT_CATALOG_SETTINGS.relatedProductsTitle
    ),
    relatedProductsSubtitle: cleanString(
      input.relatedProductsSubtitle,
      DEFAULT_CATALOG_SETTINGS.relatedProductsSubtitle
    ),
    relatedProductsViewAllLabel: cleanString(
      input.relatedProductsViewAllLabel,
      DEFAULT_CATALOG_SETTINGS.relatedProductsViewAllLabel
    ),
  };
}

export function parseCatalogSettings(value?: string | null): CatalogTemplateSettings {
  if (!value?.trim()) return DEFAULT_CATALOG_SETTINGS;

  try {
    return mergeCatalogSettings(JSON.parse(value));
  } catch {
    return DEFAULT_CATALOG_SETTINGS;
  }
}

export function serializeCatalogSettings(settings: CatalogTemplateSettings) {
  return JSON.stringify(mergeCatalogSettings(settings));
}

export function listToText(items: string[]) {
  return items.join("\n");
}

export function textToList(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function itemsToText(items: Array<{ title: string; text: string }>) {
  return items.map((item) => `${item.title} | ${item.text}`).join("\n");
}

export function textToItems(value: string) {
  return value
    .split(/\r?\n/)
    .map((row) => {
      const [title = "", ...rest] = row.split("|");
      return { title: title.trim(), text: rest.join("|").trim() };
    })
    .filter((item) => item.title || item.text);
}

export function renderCatalogTemplate(value: string, tokens: Record<string, string | number>) {
  return Object.entries(tokens).reduce(
    (text, [key, tokenValue]) => text.replaceAll(`{{${key}}}`, String(tokenValue)),
    value
  );
}
