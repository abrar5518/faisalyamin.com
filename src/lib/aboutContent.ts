export type AboutContent = {
  breadcrumbLabel: string;
  heroExtras: {
    chips: string[];
    noteHtml: string;
    infoCards: Array<{
      title: string;
      bodyHtml: string;
    }>;
  };
  stats: Array<{
    label: string;
    value: string;
  }>;
  story: {
    title: string;
    intro: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    bodyHtml: string;
  };
  values: {
    title: string;
    intro: string;
    assistTitle: string;
    assistDesc: string;
    assistCtaLabel: string;
    assistCtaHref: string;
    items: Array<{
      title: string;
      desc: string;
    }>;
  };
  verification: {
    title: string;
    intro: string;
    supportLabel: string;
    supportHref: string;
    steps: Array<{
      n: string;
      title: string;
      desc: string;
    }>;
    moreHtml: string;
  };
  support: {
    title: string;
    intro: string;
    linkLabel: string;
    linkHref: string;
    links: Array<{
      href: string;
      title: string;
      desc: string;
    }>;
    cards: Array<{
      title: string;
      bodyHtml: string;
    }>;
  };
  faq: {
    title: string;
    intro: string;
    linkLabel: string;
    linkHref: string;
    items: Array<{
      q: string;
      a: string;
    }>;
    footerHtml: string;
  };
  finalCta: {
    title: string;
    desc: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    footerLinks: Array<{
      label: string;
      href: string;
    }>;
  };
};

export type AboutPageDb = {
  breadcrumbLabel?: string | null;
  heroNoteHtml?: string | null;
  storyTitle?: string | null;
  storyIntro?: string | null;
  storyPrimaryLabel?: string | null;
  storyPrimaryHref?: string | null;
  storySecondaryLabel?: string | null;
  storySecondaryHref?: string | null;
  storyBodyHtml?: string | null;
  valuesTitle?: string | null;
  valuesIntro?: string | null;
  valuesAssistTitle?: string | null;
  valuesAssistDesc?: string | null;
  valuesAssistCtaLabel?: string | null;
  valuesAssistCtaHref?: string | null;
  verificationTitle?: string | null;
  verificationIntro?: string | null;
  verificationSupportLabel?: string | null;
  verificationSupportHref?: string | null;
  verificationMoreHtml?: string | null;
  supportTitle?: string | null;
  supportIntro?: string | null;
  supportLinkLabel?: string | null;
  supportLinkHref?: string | null;
  faqTitle?: string | null;
  faqIntro?: string | null;
  faqLinkLabel?: string | null;
  faqLinkHref?: string | null;
  faqFooterHtml?: string | null;
  finalCtaTitle?: string | null;
  finalCtaDesc?: string | null;
  finalCtaPrimaryLabel?: string | null;
  finalCtaPrimaryHref?: string | null;
  finalCtaSecondaryLabel?: string | null;
  finalCtaSecondaryHref?: string | null;
  stats?: Array<{ label?: string | null; value?: string | null }>;
  heroChips?: Array<{ label?: string | null }>;
  heroInfoCards?: Array<{ title?: string | null; bodyHtml?: string | null }>;
  valuesItems?: Array<{ title?: string | null; desc?: string | null }>;
  verificationSteps?: Array<{ stepLabel?: string | null; title?: string | null; desc?: string | null }>;
  supportLinks?: Array<{ href?: string | null; title?: string | null; desc?: string | null }>;
  supportCards?: Array<{ title?: string | null; bodyHtml?: string | null }>;
  faqItems?: Array<{ question?: string | null; answer?: string | null }>;
  finalCtaLinks?: Array<{ label?: string | null; href?: string | null }>;
};

export const defaultAboutHero = {
  badge: "Online store in Pakistan",
  title: "About our store",
  subtitle:
    "This store is built for buyers who want clear product details, secure checkout, reliable delivery, and helpful support. Update this content from admin to match your brand story.",
  primaryLabel: "Explore products",
  primaryHref: "/shop",
  secondaryLabel: "Contact us",
  secondaryHref: "/contact",
  image:
    "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1600&q=85",
  imageAlt: "Online shopping products",
};

export const defaultAboutContent: AboutContent = {
  breadcrumbLabel: "About",
  heroExtras: {
    chips: [
      "Clear product details",
      "Secure checkout",
      "Fast dispatch",
      "Pakistan delivery coverage",
    ],
    noteHtml:
      "Browse <a href=\"/categories\" class=\"text-neutral-900 hover:underline\">Categories</a>, check <a href=\"/deals\" class=\"text-neutral-900 hover:underline\">Deals</a>, or visit the full <a href=\"/shop\" class=\"text-neutral-900 hover:underline\">Shop</a>.",
    infoCards: [
      {
        title: "Support-first",
        bodyHtml:
          "Need help selecting? Use our <a href=\"/contact\" class=\"text-neutral-900 hover:underline\">Contact</a> page for fast response.",
      },
      {
        title: "Clear policies",
        bodyHtml:
          "Read <a href=\"/shipping\" class=\"text-neutral-900 hover:underline\">Shipping</a>, <a href=\"/returns\" class=\"text-neutral-900 hover:underline\">Returns</a>, and <a href=\"/privacy\" class=\"text-neutral-900 hover:underline\">Privacy Policy</a> anytime.",
      },
    ],
  },
  stats: [
    { label: "Dispatch time", value: "24-48 hours" },
    { label: "Coverage", value: "Pakistan (major cities)" },
    { label: "Support", value: "WhatsApp + Email" },
    { label: "Checkout", value: "Secure payments" },
  ],
  story: {
    title: "Our story",
    intro:
      "This store started with a simple goal: make online shopping reliable, clear, and easy.",
    primaryLabel: "Browse categories",
    primaryHref: "/categories",
    secondaryLabel: "Contact us",
    secondaryHref: "/contact",
    bodyHtml:
      "<h3>Built for confident shopping</h3><p>Customers need clear listings, transparent prices, reliable delivery, and easy support. This store is designed to keep product details, shipping, and returns simple to understand.</p><h3>Clear product details</h3><p>For every product, share accurate information, clear photos, and delivery expectations. If customers need help, the <a href=\"/contact\" class=\"text-neutral-900 hover:underline\">Contact</a> page is the fastest route.</p><h3>We care about long-term trust</h3><p>Instead of vague claims, focus on consistent quality, reliable support, and a smooth experience from browsing to delivery.</p><p>Check <a href=\"/deals\" class=\"text-neutral-900 hover:underline\">Deals</a> or browse the full <a href=\"/shop\" class=\"text-neutral-900 hover:underline\">Shop</a>.</p>",
  },
  values: {
    title: "What we stand for",
    intro:
      "These values guide product listings, pricing clarity, packaging, delivery, and after-sales support.",
    assistTitle: "Need help choosing?",
    assistDesc: "Tell us your budget and preferences. We will recommend the best options.",
    assistCtaLabel: "Contact support",
    assistCtaHref: "/contact",
    items: [
      {
        title: "Quality first",
        desc: "We focus on trust and long-term customer satisfaction. Clear details, checked products, and honest listings.",
      },
      {
        title: "Clean shopping experience",
        desc: "Clear packaging, fast communication, and a UI built for confidence. Shopping should feel simple.",
      },
      {
        title: "Secure payments",
        desc: "Checkout is protected with order checks. Cash on Delivery orders may require phone confirmation.",
      },
      {
        title: "Fast delivery in Pakistan",
        desc: "We prioritize quick dispatch and reliable couriers, with tracking updates so you always know where your order is.",
      },
    ],
  },
  verification: {
    title: "How we ensure quality",
    intro: "Our process is designed to reduce surprises and increase confidence.",
    supportLabel: "Support center",
    supportHref: "/contact",
    steps: [
      {
        n: "1",
        title: "Listing review",
        desc: "We ensure product details, pricing, and photos match what we are selling. No vague listings.",
      },
      {
        n: "2",
        title: "Condition checks",
        desc: "We check product details, packaging, included items, and accessories where applicable.",
      },
      {
        n: "3",
        title: "Final dispatch verification",
        desc: "Before shipping, we re-check the order items and pack securely for safe transit.",
      },
      {
        n: "4",
        title: "Support + tracking",
        desc: "After dispatch, tracking is shared and support stays available for delivery updates or return requests.",
      },
    ],
    moreHtml:
      "Read our <a href=\"/shipping\" class=\"text-neutral-900 hover:underline\">Shipping</a>, <a href=\"/returns\" class=\"text-neutral-900 hover:underline\">Returns</a>, and <a href=\"/privacy\" class=\"text-neutral-900 hover:underline\">Privacy Policy</a>. For order-specific questions, use <a href=\"/contact\" class=\"text-neutral-900 hover:underline\">Contact</a>.",
  },
  support: {
    title: "Support hub",
    intro: "All support resources in one place. For direct help, use Contact.",
    linkLabel: "Contact us",
    linkHref: "/contact",
    links: [
      {
        href: "/contact",
        title: "Contact us",
        desc: "The fastest way to reach us. For orders, refunds, returns, partnerships, or product inquiries.",
      },
      {
        href: "/contact",
        title: "Support center",
        desc: "Find help topics, policies, and quick answers for common questions.",
      },
      {
        href: "/account/orders",
        title: "Track order",
        desc: "Check the status of your delivery using your order information.",
      },
      {
        href: "/shipping",
        title: "Shipping policy",
        desc: "Delivery timelines, courier coverage, and how insured shipping works.",
      },
      {
        href: "/returns",
        title: "Returns & refunds",
        desc: "Return window, eligibility rules, and refund processing steps.",
      },
      {
        href: "/privacy",
        title: "Privacy policy",
        desc: "How we handle customer information, order data and support messages.",
      },
      {
        href: "/faq",
        title: "FAQ",
        desc: "Quick answers: payments, COD availability, product condition, and order issues.",
      },
    ],
    cards: [
      {
        title: "Order issues?",
        bodyHtml:
          "Start from <a href=\"/account/orders\" class=\"text-neutral-900 hover:underline\">Track Order</a>, and if you need help, contact us via <a href=\"/contact\" class=\"text-neutral-900 hover:underline\">Contact</a>.",
      },
      {
        title: "Returns & refunds",
        bodyHtml:
          "Read <a href=\"/returns\" class=\"text-neutral-900 hover:underline\">Returns</a> first, then use <a href=\"/contact\" class=\"text-neutral-900 hover:underline\">Contact</a> to initiate your request.",
      },
    ],
  },
  faq: {
    title: "Frequently asked questions",
    intro: "Quick answers for faster decisions.",
    linkLabel: "View full FAQ",
    linkHref: "/faq",
    items: [
      {
        q: "Do you sell original products only?",
        a: "Yes. We aim to keep Sahoolat a trust-based platform with careful checks, clear listing details, and reliable support.",
      },
      {
        q: "Do you have both in-stock and dropship items?",
        a: "Yes. Some products are stocked by us, and some are fulfilled via partners. The goal is the same: clear delivery expectations and reliable support.",
      },
      {
        q: "How fast do you ship in Pakistan?",
        a: "Many orders dispatch within 24-48 hours depending on product availability and verification. Delivery time varies by city and courier coverage.",
      },
      {
        q: "Can I pay cash on delivery (COD)?",
        a: "If COD is available, it appears at checkout. For high-value items, we may require advance payment or confirmation for security reasons.",
      },
      {
        q: "How do returns work?",
        a: "Returns depend on product eligibility. Please review our Returns page, and contact support to start a return request within the allowed window.",
      },
      {
        q: "Do you offer customer support on WhatsApp?",
        a: "Yes. Use the Contact page for the fastest response. You can also use Support Center for policy questions.",
      },
    ],
    footerHtml:
      "Use <a href=\"/contact\" class=\"text-neutral-900 hover:underline\">Contact</a> for direct support. For policies, check <a href=\"/shipping\" class=\"text-neutral-900 hover:underline\">Shipping</a>, <a href=\"/returns\" class=\"text-neutral-900 hover:underline\">Returns</a>, and <a href=\"/privacy\" class=\"text-neutral-900 hover:underline\">Privacy Policy</a>.",
  },
  finalCta: {
    title: "Ready to explore Sahoolat?",
    desc: "Browse categories, compare products, and checkout securely. For help, reach us from the Contact page.",
    primaryLabel: "Browse categories",
    primaryHref: "/categories",
    secondaryLabel: "Contact us",
    secondaryHref: "/contact",
    footerLinks: [
      { label: "Shop", href: "/shop" },
      { label: "Deals", href: "/deals" },
      { label: "Reviews", href: "/reviews" },
      { label: "Contact", href: "/contact" },
    ],
  },
};

function mergeDeep<T>(fallback: T, value: unknown): T {
  if (Array.isArray(fallback)) {
    return (Array.isArray(value) ? value : fallback) as T;
  }
  if (fallback && typeof fallback === "object") {
    if (!value || typeof value !== "object") return fallback;
    const result: any = { ...(fallback as any) };
    for (const key of Object.keys(result)) {
      result[key] = mergeDeep(result[key], (value as any)[key]);
    }
    return result as T;
  }
  return (typeof value === typeof fallback ? value : fallback) as T;
}

export function applyAboutDefaults(partial?: Partial<AboutContent>): AboutContent {
  return mergeDeep(defaultAboutContent, partial ?? {});
}

export function parseAboutContent(raw?: string | null): AboutContent {
  if (!raw) return defaultAboutContent;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaultAboutContent;
    return applyAboutDefaults(parsed as Partial<AboutContent>);
  } catch {
    return defaultAboutContent;
  }
}

export function aboutContentFromDb(row: AboutPageDb | null, fallback?: AboutContent): AboutContent {
  const base = fallback ?? defaultAboutContent;
  if (!row) return base;

  const chips = row.heroChips?.map((c) => c.label || "").filter(Boolean) || [];
  const infoCards =
    row.heroInfoCards?.map((c) => ({
      title: c.title || "",
      bodyHtml: c.bodyHtml || "",
    })) || [];
  const stats =
    row.stats?.map((s) => ({
      label: s.label || "",
      value: s.value || "",
    })) || [];
  const valuesItems =
    row.valuesItems?.map((v) => ({
      title: v.title || "",
      desc: v.desc || "",
    })) || [];
  const steps =
    row.verificationSteps?.map((s) => ({
      n: s.stepLabel || "",
      title: s.title || "",
      desc: s.desc || "",
    })) || [];
  const supportLinks =
    row.supportLinks?.map((s) => ({
      href: s.href || "",
      title: s.title || "",
      desc: s.desc || "",
    })) || [];
  const supportCards =
    row.supportCards?.map((s) => ({
      title: s.title || "",
      bodyHtml: s.bodyHtml || "",
    })) || [];
  const faqItems =
    row.faqItems?.map((f) => ({
      q: f.question || "",
      a: f.answer || "",
    })) || [];
  const footerLinks =
    row.finalCtaLinks?.map((l) => ({
      label: l.label || "",
      href: l.href || "",
    })) || [];

  return {
    breadcrumbLabel: row.breadcrumbLabel ?? base.breadcrumbLabel,
    heroExtras: {
      chips,
      noteHtml: row.heroNoteHtml ?? base.heroExtras.noteHtml,
      infoCards,
    },
    stats,
    story: {
      title: row.storyTitle ?? base.story.title,
      intro: row.storyIntro ?? base.story.intro,
      primaryLabel: row.storyPrimaryLabel ?? base.story.primaryLabel,
      primaryHref: row.storyPrimaryHref ?? base.story.primaryHref,
      secondaryLabel: row.storySecondaryLabel ?? base.story.secondaryLabel,
      secondaryHref: row.storySecondaryHref ?? base.story.secondaryHref,
      bodyHtml: row.storyBodyHtml ?? base.story.bodyHtml,
    },
    values: {
      title: row.valuesTitle ?? base.values.title,
      intro: row.valuesIntro ?? base.values.intro,
      assistTitle: row.valuesAssistTitle ?? base.values.assistTitle,
      assistDesc: row.valuesAssistDesc ?? base.values.assistDesc,
      assistCtaLabel: row.valuesAssistCtaLabel ?? base.values.assistCtaLabel,
      assistCtaHref: row.valuesAssistCtaHref ?? base.values.assistCtaHref,
      items: valuesItems,
    },
    verification: {
      title: row.verificationTitle ?? base.verification.title,
      intro: row.verificationIntro ?? base.verification.intro,
      supportLabel: row.verificationSupportLabel ?? base.verification.supportLabel,
      supportHref: row.verificationSupportHref ?? base.verification.supportHref,
      steps,
      moreHtml: row.verificationMoreHtml ?? base.verification.moreHtml,
    },
    support: {
      title: row.supportTitle ?? base.support.title,
      intro: row.supportIntro ?? base.support.intro,
      linkLabel: row.supportLinkLabel ?? base.support.linkLabel,
      linkHref: row.supportLinkHref ?? base.support.linkHref,
      links: supportLinks,
      cards: supportCards,
    },
    faq: {
      title: row.faqTitle ?? base.faq.title,
      intro: row.faqIntro ?? base.faq.intro,
      linkLabel: row.faqLinkLabel ?? base.faq.linkLabel,
      linkHref: row.faqLinkHref ?? base.faq.linkHref,
      items: faqItems,
      footerHtml: row.faqFooterHtml ?? base.faq.footerHtml,
    },
    finalCta: {
      title: row.finalCtaTitle ?? base.finalCta.title,
      desc: row.finalCtaDesc ?? base.finalCta.desc,
      primaryLabel: row.finalCtaPrimaryLabel ?? base.finalCta.primaryLabel,
      primaryHref: row.finalCtaPrimaryHref ?? base.finalCta.primaryHref,
      secondaryLabel: row.finalCtaSecondaryLabel ?? base.finalCta.secondaryLabel,
      secondaryHref: row.finalCtaSecondaryHref ?? base.finalCta.secondaryHref,
      footerLinks,
    },
  };
}
