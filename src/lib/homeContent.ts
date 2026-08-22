export type HomeSocialProofItem = {
  title: string;
  desc: string;
};

export type HomeSections = {
  heroSliderEnabled: boolean;
  heroSliderAutoPlay: boolean;
  heroSliderIntervalMs: number;
  heroSliderShowArrows: boolean;
  heroSliderShowDots: boolean;
  saleTitle: string;
  saleSubtitle: string;
  saleViewAllLabel: string;
  saleViewAllHref: string;
  categoryTitle: string;
  categorySubtitle: string;
  categoryViewAllLabel: string;
  categoryViewAllHref: string;
  categorySource: "featured" | "manual";
  categoryIds: number[];
  featuredTitle: string;
  featuredSubtitle: string;
  featuredTabs: string[];
  featuredSource: "featured" | "sale" | "new" | "manual";
  featuredLimit: number;
  featuredViewAllLabel: string;
  featuredViewAllHref: string;
  featuredProductIds: number[];
  showcaseEnabled: boolean;
  showcaseEyebrow: string;
  showcaseTitle: string;
  showcaseSubtitle: string;
  editorialEnabled: boolean;
  editorialEyebrow: string;
  editorialTitle: string;
  editorialBody: string;
  editorialImage: string;
  editorialImageAlt: string;
  editorialButtonLabel: string;
  editorialButtonHref: string;
  socialProofEnabled: boolean;
  socialProofItems: HomeSocialProofItem[];
  reviewsEnabled: boolean;
  reviewsBadge: string;
  reviewsTitle: string;
  reviewsSubtitle: string;
  reviewsLinkLabel: string;
  reviewsLinkHref: string;
  introBadge: string;
  faqLinkLabel: string;
  faqLinkHref: string;
};

export const DEFAULT_HOME_SECTIONS: HomeSections = {
  heroSliderEnabled: true,
  heroSliderAutoPlay: true,
  heroSliderIntervalMs: 5000,
  heroSliderShowArrows: true,
  heroSliderShowDots: true,
  saleTitle: "Latest Deals",
  saleSubtitle: "Discover current offers, trending products, and limited-time savings.",
  saleViewAllLabel: "View all deals",
  saleViewAllHref: "/deals",
  categoryTitle: "Shop your world",
  categorySubtitle: "Distinct collections, one considered point of view.",
  categoryViewAllLabel: "Explore all",
  categoryViewAllHref: "/categories",
  categorySource: "featured",
  categoryIds: [],
  featuredTitle: "Trending now",
  featuredSubtitle: "Fresh silhouettes selected by our fashion editors.",
  featuredTabs: ["New arrivals", "Bestsellers", "The essentials"],
  featuredSource: "featured",
  featuredLimit: 8,
  featuredViewAllLabel: "View all products",
  featuredViewAllHref: "/shop",
  featuredProductIds: [],
  showcaseEnabled: true,
  showcaseEyebrow: "Curated product showcase",
  showcaseTitle: "Pick your statement piece.",
  showcaseSubtitle: "Hover a card to bring the product into focus.",
  editorialEnabled: true,
  editorialEyebrow: "The Aster Journal · Issue 06",
  editorialTitle: "The art of effortless dressing.",
  editorialBody: "A capsule of elevated neutrals, expressive texture and relaxed tailoring—created to work harder in your wardrobe.",
  editorialImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1300&q=90",
  editorialImageAlt: "A considered fashion collection on a clothing rail",
  editorialButtonLabel: "Discover the story",
  editorialButtonHref: "/blog",
  socialProofEnabled: true,
  socialProofItems: [
    { title: "Quality Checked", desc: "Products are checked before shipping." },
    { title: "Secure Payments", desc: "Multiple gateways with fraud protection." },
    { title: "Priority Support", desc: "Fast WhatsApp + email support." },
  ],
  reviewsEnabled: true,
  reviewsBadge: "Trusted by buyers",
  reviewsTitle: "Customers reviews and stories",
  reviewsSubtitle: "Real feedback from customers who bought from FaisalYamin.com",
  reviewsLinkLabel: "Read more",
  reviewsLinkHref: "/reviews",
  introBadge: "Introducing products",
  faqLinkLabel: "View all FAQs",
  faqLinkHref: "/faq",
};

function cleanString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function cleanBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function cleanStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return items.length ? items : fallback;
}

function cleanSocialItems(value: unknown, fallback: HomeSocialProofItem[]) {
  if (!Array.isArray(value)) return fallback;
  const items = value
    .map((item) => ({
      title: cleanString((item as any)?.title, ""),
      desc: cleanString((item as any)?.desc, ""),
    }))
    .filter((item) => item.title && item.desc);
  return items.length ? items : fallback;
}

export function parseHomeSections(value?: string | null): HomeSections {
  if (!value) return DEFAULT_HOME_SECTIONS;

  try {
    const raw = JSON.parse(value);
    return {
      heroSliderEnabled: cleanBoolean(raw.heroSliderEnabled, DEFAULT_HOME_SECTIONS.heroSliderEnabled),
      heroSliderAutoPlay: cleanBoolean(raw.heroSliderAutoPlay, DEFAULT_HOME_SECTIONS.heroSliderAutoPlay),
      heroSliderIntervalMs: Math.min(20000, Math.max(2000, Number(raw.heroSliderIntervalMs) || DEFAULT_HOME_SECTIONS.heroSliderIntervalMs)),
      heroSliderShowArrows: cleanBoolean(raw.heroSliderShowArrows, DEFAULT_HOME_SECTIONS.heroSliderShowArrows),
      heroSliderShowDots: cleanBoolean(raw.heroSliderShowDots, DEFAULT_HOME_SECTIONS.heroSliderShowDots),
      saleTitle: cleanString(raw.saleTitle, DEFAULT_HOME_SECTIONS.saleTitle),
      saleSubtitle: cleanString(raw.saleSubtitle, DEFAULT_HOME_SECTIONS.saleSubtitle),
      saleViewAllLabel: cleanString(raw.saleViewAllLabel, DEFAULT_HOME_SECTIONS.saleViewAllLabel),
      saleViewAllHref: cleanString(raw.saleViewAllHref, DEFAULT_HOME_SECTIONS.saleViewAllHref),
      categoryTitle: cleanString(raw.categoryTitle, DEFAULT_HOME_SECTIONS.categoryTitle),
      categorySubtitle: cleanString(raw.categorySubtitle, DEFAULT_HOME_SECTIONS.categorySubtitle),
      categoryViewAllLabel: cleanString(raw.categoryViewAllLabel, DEFAULT_HOME_SECTIONS.categoryViewAllLabel),
      categoryViewAllHref: cleanString(raw.categoryViewAllHref, DEFAULT_HOME_SECTIONS.categoryViewAllHref),
      categorySource: raw.categorySource === "manual" ? "manual" : "featured",
      categoryIds: Array.isArray(raw.categoryIds)
        ? raw.categoryIds.map(Number).filter((id: number) => Number.isInteger(id) && id > 0)
        : DEFAULT_HOME_SECTIONS.categoryIds,
      featuredTitle: cleanString(raw.featuredTitle, DEFAULT_HOME_SECTIONS.featuredTitle),
      featuredSubtitle: cleanString(raw.featuredSubtitle, DEFAULT_HOME_SECTIONS.featuredSubtitle),
      featuredTabs: cleanStringArray(raw.featuredTabs, DEFAULT_HOME_SECTIONS.featuredTabs),
      featuredSource: ["featured", "sale", "new", "manual"].includes(raw.featuredSource)
        ? raw.featuredSource
        : DEFAULT_HOME_SECTIONS.featuredSource,
      featuredLimit: Math.min(24, Math.max(1, Number(raw.featuredLimit) || DEFAULT_HOME_SECTIONS.featuredLimit)),
      featuredViewAllLabel: cleanString(raw.featuredViewAllLabel, DEFAULT_HOME_SECTIONS.featuredViewAllLabel),
      featuredViewAllHref: cleanString(raw.featuredViewAllHref, DEFAULT_HOME_SECTIONS.featuredViewAllHref),
      featuredProductIds: Array.isArray(raw.featuredProductIds)
        ? raw.featuredProductIds.map(Number).filter((id: number) => Number.isInteger(id) && id > 0)
        : DEFAULT_HOME_SECTIONS.featuredProductIds,
      showcaseEnabled: cleanBoolean(raw.showcaseEnabled, DEFAULT_HOME_SECTIONS.showcaseEnabled),
      showcaseEyebrow: cleanString(raw.showcaseEyebrow, DEFAULT_HOME_SECTIONS.showcaseEyebrow),
      showcaseTitle: cleanString(raw.showcaseTitle, DEFAULT_HOME_SECTIONS.showcaseTitle),
      showcaseSubtitle: cleanString(raw.showcaseSubtitle, DEFAULT_HOME_SECTIONS.showcaseSubtitle),
      editorialEnabled: cleanBoolean(raw.editorialEnabled, DEFAULT_HOME_SECTIONS.editorialEnabled),
      editorialEyebrow: cleanString(raw.editorialEyebrow, DEFAULT_HOME_SECTIONS.editorialEyebrow),
      editorialTitle: cleanString(raw.editorialTitle, DEFAULT_HOME_SECTIONS.editorialTitle),
      editorialBody: cleanString(raw.editorialBody, DEFAULT_HOME_SECTIONS.editorialBody),
      editorialImage: cleanString(raw.editorialImage, DEFAULT_HOME_SECTIONS.editorialImage),
      editorialImageAlt: cleanString(raw.editorialImageAlt, DEFAULT_HOME_SECTIONS.editorialImageAlt),
      editorialButtonLabel: cleanString(raw.editorialButtonLabel, DEFAULT_HOME_SECTIONS.editorialButtonLabel),
      editorialButtonHref: cleanString(raw.editorialButtonHref, DEFAULT_HOME_SECTIONS.editorialButtonHref),
      socialProofEnabled: cleanBoolean(raw.socialProofEnabled, DEFAULT_HOME_SECTIONS.socialProofEnabled),
      socialProofItems: cleanSocialItems(raw.socialProofItems, DEFAULT_HOME_SECTIONS.socialProofItems),
      reviewsEnabled: cleanBoolean(raw.reviewsEnabled, DEFAULT_HOME_SECTIONS.reviewsEnabled),
      reviewsBadge: cleanString(raw.reviewsBadge, DEFAULT_HOME_SECTIONS.reviewsBadge),
      reviewsTitle: cleanString(raw.reviewsTitle, DEFAULT_HOME_SECTIONS.reviewsTitle),
      reviewsSubtitle: cleanString(raw.reviewsSubtitle, DEFAULT_HOME_SECTIONS.reviewsSubtitle),
      reviewsLinkLabel: cleanString(raw.reviewsLinkLabel, DEFAULT_HOME_SECTIONS.reviewsLinkLabel),
      reviewsLinkHref: cleanString(raw.reviewsLinkHref, DEFAULT_HOME_SECTIONS.reviewsLinkHref),
      introBadge: cleanString(raw.introBadge, DEFAULT_HOME_SECTIONS.introBadge),
      faqLinkLabel: cleanString(raw.faqLinkLabel, DEFAULT_HOME_SECTIONS.faqLinkLabel),
      faqLinkHref: cleanString(raw.faqLinkHref, DEFAULT_HOME_SECTIONS.faqLinkHref),
    };
  } catch {
    return DEFAULT_HOME_SECTIONS;
  }
}
