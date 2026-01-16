"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Fetch } from "@/lib/fetch";
import { defaultAboutHero } from "@/lib/aboutContent";

type AdminPage = {
  id: string;
  title: string;
  slug: string;
  updatedAt?: string;
};

const DEFAULT_PAGES = [
  { title: "Home", slug: "home" },
  { title: "Deals", slug: "deals" },
  { title: "About", slug: "about-us" },
];

function buildDefaultPayload(slug: string) {
  if (slug === "home") {
    return {
      title: "Home",
      slug: "home",
      metaTitle: "Home",
      metaDescription:
        "Premium products, curated for people who care about details. Shop best-selling luxury watches and accessories.",
      metaKeywords: "luxury watches, accessories, premium products, shop",
      heroBadge: "Trusted by 10,000+ customers worldwide",
      heroTitle: "Premium products, curated for people who care about details.",
      heroSubtitle:
        "Shop best-selling luxury watches and accessories with secure checkout, fast delivery, and authentic sourcing.",
      heroPrimaryLabel: "Shop Now",
      heroPrimaryHref: "/shop",
      heroSecondaryLabel: "Browse Categories",
      heroSecondaryHref: "/categories",
      heroImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      heroCardTitle: "Featured Drop",
      heroCardSubtitle: "Limited availability - Premium selection",
      heroCardPrimaryLabel: "Shop All",
      heroCardPrimaryHref: "/shop",
      heroCardSecondaryLabel: "View Deals",
      heroCardSecondaryHref: "/deals",
      heroHighlight1Title: "Authentic",
      heroHighlight1Desc: "Verified products",
      heroHighlight2Title: "Fast",
      heroHighlight2Desc: "Worldwide shipping",
      heroHighlight3Title: "Secure",
      heroHighlight3Desc: "Protected payments",
      homeIntroTitle: "Introducing our premium water bottles",
      homeIntroBody:
        "Discover the best water bottles designed for everyday hydration. Our premium water bottles blend sleek design, safe materials, and performance that lasts. Choose eco-friendly water bottles that keep drinks fresh and support a sustainable lifestyle.",
      homeBenefitsTitle: "Benefits you can feel every day",
      homeBenefitsIntro:
        "Built for people who care about quality, comfort, and the planet. These benefits keep you hydrated without compromise.",
      homeBenefitsItems: [
        {
          title: "Durable stainless steel build",
          desc: "Rugged, rust-resistant bodies that handle gym bags, travel days, and daily commutes with ease.",
        },
        {
          title: "Insulation that lasts",
          desc: "Vacuum insulation keeps water cold for hours and helps hot drinks stay warm on long days.",
        },
        {
          title: "Eco-friendly by design",
          desc: "Reusable, BPA-free materials reduce single-use plastic and fit a sustainable lifestyle.",
        },
      ],
      homeFaqTitle: "FAQs about our water bottles",
      homeFaqIntro:
        "Quick answers to help you choose the right bottle for your routine.",
      homeSaleLimit: 8,
      homeSaleVisibleCount: 4.5,
      homeSaleAutoMs: 4500,
      homeFaqItems: [
        {
          question: "Are these bottles BPA-free and safe for daily use?",
          answer:
            "Yes. Our premium water bottles are made with food-grade, BPA-free materials.",
        },
        {
          question: "How long does the insulation keep water cold?",
          answer:
            "Most bottles keep drinks cold for up to 24 hours, depending on size and usage.",
        },
        {
          question: "Do you offer sizes for travel or gym use?",
          answer:
            "We stock multiple sizes so you can choose a compact travel bottle or a larger fitness bottle.",
        },
      ],
      homeTestimonials: [
        {
          name: "Omar R.",
          title: "Dubai",
          quote:
            "Fast delivery and authentic product. The packaging felt premium and the support team was super responsive.",
          avatarUrl: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe",
          rating: 5,
        },
        {
          name: "Sarah K.",
          title: "London",
          quote:
            "The buying experience was smooth, and the watch condition was exactly as described. Highly recommended.",
          avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
          rating: 5,
        },
        {
          name: "Imran A.",
          title: "Chicago",
          quote:
            "Great selection and transparent pricing. I loved the secure checkout and the updates throughout shipping.",
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
          rating: 5,
        },
      ],
    };
  }

  if (slug === "about-us") {
    return {
      title: "About",
      slug: "about-us",
      metaTitle: "About",
      metaDescription:
        "Learn about LuxStore, our quality checks, and the premium shopping experience we build for Pakistan.",
      metaKeywords: "about, LuxStore, premium shopping, Pakistan",
      heroBadge: defaultAboutHero.badge,
      heroTitle: defaultAboutHero.title,
      heroSubtitle: defaultAboutHero.subtitle,
      heroPrimaryLabel: defaultAboutHero.primaryLabel,
      heroPrimaryHref: defaultAboutHero.primaryHref,
      heroSecondaryLabel: defaultAboutHero.secondaryLabel,
      heroSecondaryHref: defaultAboutHero.secondaryHref,
      heroImage: defaultAboutHero.image,
      heroImageAlt: defaultAboutHero.imageAlt,
    };
  }

  return {
    title: "Deals",
    slug: "deals",
    metaTitle: "Deals",
    metaDescription: "Limited-time deals on verified luxury watches and accessories.",
    metaKeywords: "deals, sale, watches, accessories",
    shortDescription: "Verified items at special prices. Grab the best offers while stock lasts.",
    featureImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  };
}

export default function AdminPagesPage() {
  const [rows, setRows] = useState<AdminPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setMsg(null);
      const res = await Fetch<AdminPage[]>("/api/admin/pages", { auth: true, cache: "no-store" });
      if (!alive) return;
      if (!res.ok) {
        setMsg(res.error || "Failed to load pages");
        setRows([]);
      } else {
        setRows((res.data as AdminPage[]) ?? []);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const existingSlugs = useMemo(
    () => new Set(rows.map((p) => String(p.slug || "").toLowerCase())),
    [rows]
  );
  const visibleRows = useMemo(
    () => rows.filter((p) => String(p.slug || "").toLowerCase() !== "shop"),
    [rows]
  );

  const createPage = async (slug: string) => {
    setCreating(slug);
    setMsg(null);
    const payload = buildDefaultPayload(slug);
    const res = await Fetch("/api/admin/pages", { method: "POST", auth: true, data: payload });
    if (!res.ok) {
      setMsg(res.error || "Failed to create page");
    } else {
      const listRes = await Fetch<AdminPage[]>("/api/admin/pages", { auth: true, cache: "no-store" });
      if (listRes.ok && listRes.data) setRows(listRes.data as AdminPage[]);
    }
    setCreating(null);
  };

  return (
    <div className="bg-white">
      <AdminTopbar title="Pages" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Pages</p>
            <p className="mt-1 text-xs text-neutral-500">
              Manage hero content and SEO metadata for static pages.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_PAGES.filter((p) => !existingSlugs.has(p.slug)).map((p) => (
              <button
                key={p.slug}
                onClick={() => createPage(p.slug)}
                disabled={creating === p.slug}
                className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
              >
                {creating === p.slug ? `Creating ${p.title}...` : `Create ${p.title}`}
              </button>
            ))}
            <Link
              href="/admin/pages/create"
              className="rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              New page
            </Link>
          </div>
        </div>

        {msg ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            {msg}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
            Loading pages...
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          <div className="divide-y divide-neutral-200">
            {visibleRows.map((p) => (
              <div key={p.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">{p.title}</p>
                  <p className="mt-1 text-xs text-neutral-500">Slug: {p.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/pages/${p.slug}/edit`}
                    className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
            {!visibleRows.length ? (
              <div className="p-6 text-sm text-neutral-600">No pages found.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
