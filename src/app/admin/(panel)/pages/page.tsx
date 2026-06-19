"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Pencil, Plus, RefreshCcw, Search } from "lucide-react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { AdminPageHeader } from "@/components/admin/ui";
import { Fetch } from "@/lib/fetch";
import { defaultAboutHero } from "@/lib/aboutContent";

type AdminPage = {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  updatedAt?: string;
};

type PageGroup = "Core Storefront" | "Commerce" | "Content" | "Policies";
type PageGroupFilter = "all" | PageGroup | "Custom";
type StatusFilter = "all" | "ready" | "missing";

type SystemPage = {
  title: string;
  slug: string;
  group: PageGroup;
  route: string;
  purpose: string;
};

type PageTableRow = {
  key: string;
  title: string;
  slug: string;
  group: PageGroup | "Custom";
  route: string;
  purpose: string;
  status: "ready" | "missing";
  kind: "system" | "custom";
  updatedAt?: string;
};

const SYSTEM_PAGES: SystemPage[] = [
  {
    title: "Home",
    slug: "home",
    group: "Core Storefront",
    route: "/",
    purpose: "Main landing page, hero copy, intro content, homepage SEO.",
  },
  {
    title: "Shop",
    slug: "shop",
    group: "Commerce",
    route: "/shop",
    purpose: "Main catalog page title, intro, SEO, and long content.",
  },
  {
    title: "Deals",
    slug: "deals",
    group: "Commerce",
    route: "/deals",
    purpose: "Sale page copy, promotion explanation, SEO, and feature image.",
  },
  {
    title: "Categories",
    slug: "categories",
    group: "Commerce",
    route: "/categories",
    purpose: "Collections page heading, intro text, SEO, and long content.",
  },
  {
    title: "Blog",
    slug: "blog",
    group: "Content",
    route: "/blog",
    purpose: "Blog listing page title, intro, SEO, and supporting content.",
  },
  {
    title: "About",
    slug: "about-us",
    group: "Content",
    route: "/about-us",
    purpose: "Brand story, trust content, and About page SEO.",
  },
  {
    title: "Contact",
    slug: "contact",
    group: "Content",
    route: "/contact",
    purpose: "Contact page intro and SEO. Actual details come from Contact settings.",
  },
  {
    title: "FAQ",
    slug: "faq",
    group: "Content",
    route: "/faq",
    purpose: "Customer questions, buying help, and support guidance.",
  },
  {
    title: "Shipping",
    slug: "shipping",
    group: "Policies",
    route: "/shipping",
    purpose: "Delivery timelines, courier policy, and shipping SEO.",
  },
  {
    title: "Returns",
    slug: "returns",
    group: "Policies",
    route: "/returns",
    purpose: "Return policy, exchange guidance, and customer expectations.",
  },
  {
    title: "Privacy",
    slug: "privacy",
    group: "Policies",
    route: "/privacy",
    purpose: "Privacy policy content and legal SEO metadata.",
  },
  {
    title: "Terms",
    slug: "terms",
    group: "Policies",
    route: "/terms",
    purpose: "Terms and conditions for orders, payments, and usage.",
  },
  {
    title: "Reviews",
    slug: "reviews",
    group: "Content",
    route: "/reviews",
    purpose: "Reviews page intro and SEO. Approved reviews come from database.",
  },
];

const GROUPS: PageGroup[] = ["Core Storefront", "Commerce", "Content", "Policies"];
const GROUP_FILTERS: PageGroupFilter[] = ["all", ...GROUPS, "Custom"];

function genericRichContent(title: string) {
  return `<h2>${title}</h2><p>Update this page from admin with clear, helpful content for your customers.</p><h3>Frequently Asked Questions</h3><p><strong>Question:</strong> Add a customer question here.</p><p><strong>Answer:</strong> Add a clear answer here.</p>`;
}

function buildDefaultPayload(page: SystemPage) {
  const base = {
    title: page.title,
    slug: page.slug,
    metaTitle: page.title,
    metaDescription: page.purpose,
    metaKeywords: `${page.title.toLowerCase()}, ecommerce, online shopping`,
    shortDescription: page.purpose,
    contentHtml: genericRichContent(page.title),
    featureImage: "",
    featureImageAlt: page.title,
  };

  if (page.slug === "home") {
    return {
      ...base,
      metaDescription: "Quality products, clear prices, secure checkout, and reliable delivery.",
      shortDescription: "Shop best-selling products with secure checkout and reliable delivery.",
      heroBadge: "Trusted by customers",
      heroTitle: base.title,
      heroSubtitle: "Shop best-selling products with secure checkout, clear support, and reliable delivery.",
      heroPrimaryLabel: "Shop Now",
      heroPrimaryHref: "/shop",
      heroSecondaryLabel: "Browse Categories",
      heroSecondaryHref: "/categories",
      heroImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      heroImageAlt: "Featured products",
      heroCardTitle: "Featured products",
      heroCardSubtitle: "Explore popular picks from this store.",
      heroCardPrimaryLabel: "Shop All",
      heroCardPrimaryHref: "/shop",
      heroCardSecondaryLabel: "View Deals",
      heroCardSecondaryHref: "/deals",
      heroHighlight1Title: "Quality",
      heroHighlight1Desc: "Checked products",
      heroHighlight2Title: "Fast",
      heroHighlight2Desc: "Reliable dispatch",
      heroHighlight3Title: "Secure",
      heroHighlight3Desc: "Protected checkout",
    };
  }

  if (page.slug === "about-us") {
    return {
      ...base,
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

  if (page.slug === "deals") {
    return {
      ...base,
      shortDescription: "Verified items at special prices. Grab the best offers while stock lasts.",
      contentHtml:
        "<h2>Limited-time deals</h2><p>Use this area to explain current promotions, delivery terms, return rules, and stock limits.</p><h3>Frequently Asked Questions</h3><p><strong>Are deals limited?</strong></p><p>Yes, offers may depend on available stock.</p>",
      featureImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      featureImageAlt: "Deals",
    };
  }

  return base;
}

function formatDate(value?: string) {
  if (!value) return "Not updated yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not updated yet";
  return date.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusClass(status: PageTableRow["status"]) {
  return status === "ready"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-700";
}

function filterLabel(filter: PageGroupFilter) {
  return filter === "all" ? "All groups" : filter;
}

export default function AdminPagesPage() {
  const [rows, setRows] = useState<AdminPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<PageGroupFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  async function loadPages() {
    setLoading(true);
    setMsg(null);
    const res = await Fetch<AdminPage[]>("/api/admin/pages", { auth: true, cache: "no-store" });
    if (!res.ok) {
      setMsg(res.error || "Failed to load pages");
      setRows([]);
    } else {
      setRows((res.data as AdminPage[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      await loadPages();
      if (!alive) return;
    })();
    return () => {
      alive = false;
    };
  }, []);

  const rowBySlug = useMemo(() => {
    const map = new Map<string, AdminPage>();
    for (const row of rows) map.set(String(row.slug || "").toLowerCase(), row);
    return map;
  }, [rows]);

  const missingPages = useMemo(
    () => SYSTEM_PAGES.filter((page) => !rowBySlug.has(page.slug.toLowerCase())),
    [rowBySlug]
  );

  const tableRows = useMemo<PageTableRow[]>(() => {
    const systemSlugs = new Set(SYSTEM_PAGES.map((page) => page.slug.toLowerCase()));
    const systemRows = SYSTEM_PAGES.map((page) => {
      const existing = rowBySlug.get(page.slug.toLowerCase());
      return {
        key: `system:${page.slug}`,
        title: existing?.title || page.title,
        slug: page.slug,
        group: page.group,
        route: page.route,
        purpose: page.purpose,
        status: existing ? "ready" : "missing",
        kind: "system",
        updatedAt: existing?.updatedAt,
      } satisfies PageTableRow;
    });

    const customRows = rows
      .filter((row) => !systemSlugs.has(String(row.slug || "").toLowerCase()))
      .map((row) => ({
        key: `custom:${row.id}`,
        title: row.title,
        slug: row.slug,
        group: "Custom" as const,
        route: `/${row.slug}`,
        purpose: row.shortDescription || "Custom freestyle content page.",
        status: "ready" as const,
        kind: "custom" as const,
        updatedAt: row.updatedAt,
      }));

    const term = query.trim().toLowerCase();
    return [...systemRows, ...customRows]
      .filter((row) => {
        if (!term) return true;
        return [row.title, row.slug, row.group, row.route, row.purpose].some((value) =>
          String(value || "").toLowerCase().includes(term)
        );
      })
      .filter((row) => (groupFilter === "all" ? true : row.group === groupFilter))
      .filter((row) => (statusFilter === "all" ? true : row.status === statusFilter));
  }, [groupFilter, query, rowBySlug, rows, statusFilter]);

  const readyCount = tableRows.filter((row) => row.status === "ready").length;

  async function createMissingPages() {
    if (!missingPages.length) return;
    setCreating(true);
    setMsg(null);

    for (const page of missingPages) {
      const res = await Fetch("/api/admin/pages", {
        method: "POST",
        auth: true,
        data: buildDefaultPayload(page),
      });

      if (!res.ok) {
        setMsg(res.error || `Failed to create ${page.title}`);
        setCreating(false);
        return;
      }
    }

    await loadPages();
    setMsg("Missing system pages created.");
    setCreating(false);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminTopbar title="Pages" />

      <div className="mx-auto w-full max-w-[1360px] px-5 py-8 sm:px-8 lg:px-12">
        <AdminPageHeader
          eyebrow="Content management"
          title="Pages"
          description="Manage storefront pages from one clean table. Each edit screen follows the same pattern for content, FAQs, media, and SEO."
          actions={
            <>
              <Link
                href="/admin/blog"
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
              >
                Blog posts
              </Link>
              <Link
                href="/admin/pages/create"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
              >
                <Plus className="h-4 w-4" />
                Custom page
              </Link>
              <button
                type="button"
                onClick={createMissingPages}
                disabled={creating || !missingPages.length}
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCcw className={`h-4 w-4 ${creating ? "animate-spin" : ""}`} />
                {missingPages.length ? `Create missing (${missingPages.length})` : "All system pages ready"}
              </button>
            </>
          }
        />

        {msg ? (
          <div className="mt-5 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm">
            {msg}
          </div>
        ) : null}

        <section className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-white p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px]">
              <label className="flex min-h-11 items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4">
                <Search className="h-4 w-4 text-neutral-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by page, slug, group, route, or purpose"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                />
              </label>

              <select
                value={groupFilter}
                onChange={(event) => setGroupFilter(event.target.value as PageGroupFilter)}
                className="min-h-11 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-800 outline-none"
              >
                {GROUP_FILTERS.map((filter) => (
                  <option key={filter} value={filter}>
                    {filterLabel(filter)}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="min-h-11 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-800 outline-none"
              >
                <option value="all">All statuses</option>
                <option value="ready">Ready</option>
                <option value="missing">Missing</option>
              </select>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <span>{tableRows.length} shown</span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" />
              <span>{readyCount} ready</span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" />
              <span>{missingPages.length} missing system pages</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] divide-y divide-neutral-200 text-left">
              <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-5 py-3">Page</th>
                  <th className="px-5 py-3">Group</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Route</th>
                  <th className="px-5 py-3">Last updated</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {loading ? (
                  <tr>
                    <td className="px-5 py-8 text-sm text-neutral-500" colSpan={6}>
                      Loading pages...
                    </td>
                  </tr>
                ) : null}

                {!loading && tableRows.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-sm text-neutral-500" colSpan={6}>
                      No pages match your filters.
                    </td>
                  </tr>
                ) : null}

                {!loading
                  ? tableRows.map((row) => (
                      <tr key={row.key} className="transition hover:bg-neutral-50/80">
                        <td className="px-5 py-4 align-top">
                          <div className="max-w-md">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-neutral-950">{row.title}</p>
                              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                                {row.kind === "system" ? "System" : "Custom"}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-neutral-500">/{row.slug}</p>
                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-600">
                              {row.purpose}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-neutral-700">{row.group}</td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(
                              row.status
                            )}`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <Link
                            href={row.route}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-800 hover:underline"
                          >
                            {row.route}
                            <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
                          </Link>
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-neutral-600">
                          {formatDate(row.updatedAt)}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="flex justify-end gap-2">
                            {row.status === "ready" ? (
                              <Link
                                href={`/admin/pages/${row.slug}/edit`}
                                className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Link>
                            ) : (
                              <button
                                type="button"
                                onClick={createMissingPages}
                                disabled={creating}
                                className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
                              >
                                <RefreshCcw className={`h-4 w-4 ${creating ? "animate-spin" : ""}`} />
                                Create
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
