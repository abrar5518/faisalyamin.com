// src/app/shop/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import ProductCard, { Product } from "@/components/ProductCard";

type FilterState = {
  q: string;
  sort: "relevance" | "price_asc" | "price_desc" | "rating_desc" | "newest";
  categorySlug: string | null;
  subcategorySlug: string | null;
  isSale: boolean;
};

export type ShopProduct = Product & {
  createdAt: string; // ISO
};

type ShopClientProps = {
  initialProducts: ShopProduct[];
  initialTotal: number;
  pageSize: number;
  categories: Array<{
    name: string;
    slug: string;
    subcategories: Array<{ name: string; slug: string }>;
  }>;
  richHtml: string;
  title: string;
  shortDescription: string;
  featureImage?: string;
  featureImageAlt?: string;
};

function Container({ children }: { children: ReactNode }) {
  // Balanced width + padding (your latest preference)
  return <div className="mx-auto w-full max-w-340 px-5 sm:px-8 lg:px-12">{children}</div>;
}

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
    >
      <span>{label}</span>
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] text-white">
        Ã—
      </span>
    </button>
  );
}

function TogglePill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-4 py-2 text-sm transition",
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center justify-between rounded-2xl px-2 py-2 hover:bg-neutral-50"
    >
      <span className="text-sm text-neutral-800">{label}</span>
      <span
        className={[
          "h-5 w-5 rounded-md border",
          checked ? "border-neutral-900 bg-neutral-900" : "border-neutral-300 bg-white",
        ].join(" ")}
      />
    </button>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold text-neutral-900">{children}</p>;
}

export default function ShopClient({
  initialProducts,
  initialTotal,
  pageSize,
  categories,
  richHtml,
  title,
  shortDescription,
  featureImage,
  featureImageAlt,
}: ShopClientProps) {
  const [filters, setFilters] = useState<FilterState>({
    q: "",
    sort: "relevance",
    categorySlug: null,
    subcategorySlug: null,
    isSale: false,
  });

  const [products, setProducts] = useState<ShopProduct[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const hasMore = products.length < total;

  const mapApiProduct = (p: any): ShopProduct => {
    const img = p.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30";
    const slug = p.slug ?? String(p.id ?? "");
    return {
      id: slug,
      name: p.name ?? "Untitled product",
      price: `PKR ${Number(p.price ?? 0).toLocaleString("en-PK")}`,
      compareAt: p.compareAt != null ? `PKR ${Number(p.compareAt).toLocaleString("en-PK")}` : undefined,
      badge: p.badge ?? undefined,
      rating: typeof p.rating === "number" ? p.rating : 0,
      reviews: typeof p.reviewsCount === "number" ? p.reviewsCount : 0,
      image: img,
      createdAt: p.createdAt ?? "",
    };
  };

  async function fetchProducts(nextPage: number, append: boolean) {
    const sort =
      filters.sort === "price_asc"
        ? "price_asc"
        : filters.sort === "price_desc"
        ? "price_desc"
        : filters.sort === "rating_desc"
        ? "rating_desc"
        : filters.sort === "newest"
        ? "createdAt_desc"
        : "createdAt_desc";
    const q = filters.q.trim();
    const params = new URLSearchParams({
      page: String(nextPage),
      pageSize: String(pageSize),
      sort,
      isActive: "1",
    });
    if (q) params.set("q", q);
    if (filters.categorySlug) params.set("categorySlug", filters.categorySlug);
    if (filters.subcategorySlug) params.set("subcategorySlug", filters.subcategorySlug);
    if (filters.isSale) params.set("isSale", "1");

    const res = await fetch(`/api/products?${params.toString()}`, { cache: "no-store" });
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.ok) return null;
    const items = Array.isArray(payload.data) ? payload.data : [];
    const nextItems = items.map(mapApiProduct);
    const totalCount = payload.meta?.total ?? (append ? total : items.length);

    setProducts((prev) => (append ? [...prev, ...nextItems] : nextItems));
    setTotal(totalCount);
    setPage(nextPage);
    return nextItems;
  }

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      await fetchProducts(nextPage, true);
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    let active = true;
    const delay = setTimeout(async () => {
      if (!active) return;
      setLoading(true);
      try {
        await fetchProducts(1, false);
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(delay);
    };
  }, [filters, pageSize]);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; remove: () => void }[] = [];

    if (filters.q.trim()) {
      chips.push({
        key: "q",
        label: `Search: "${filters.q.trim()}"`,
        remove: () => setFilters((f) => ({ ...f, q: "" })),
      });
    }

    if (filters.categorySlug) {
      const category = categories.find((c) => c.slug === filters.categorySlug);
      chips.push({
        key: `cat:${filters.categorySlug}`,
        label: category?.name || "Category",
        remove: () => setFilters((f) => ({ ...f, categorySlug: null, subcategorySlug: null })),
      });
    }

    if (filters.subcategorySlug) {
      const category = categories.find((c) => c.slug === filters.categorySlug);
      const sub = category?.subcategories.find((s) => s.slug === filters.subcategorySlug);
      chips.push({
        key: `sub:${filters.subcategorySlug}`,
        label: sub?.name || "Subcategory",
        remove: () => setFilters((f) => ({ ...f, subcategorySlug: null })),
      });
    }

    if (filters.isSale) {
      chips.push({
        key: "sale",
        label: "On sale",
        remove: () => setFilters((f) => ({ ...f, isSale: false })),
      });
    }

    return chips;
  }, [filters, categories]);

  const FiltersPanel = (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm lg:sticky lg:top-20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Filters</h2>
          <p className="mt-1 text-xs text-neutral-500">Refine your search.</p>
        </div>

        <button
          type="button"
          onClick={() =>
            setFilters({
              q: "",
              sort: "relevance",
              categorySlug: null,
              subcategorySlug: null,
              isSale: false,
            })
          }
          className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium hover:bg-neutral-50"
        >
          Reset
        </button>
      </div>

      {/* Search */}
      <div className="mt-5">
        <SectionTitle>Search</SectionTitle>
        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-neutral-900" />
          <input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
            placeholder="Rolex, Nautilus, strap..."
          />
        </div>
      </div>

      {/* Sort */}
      <div className="mt-5">
        <SectionTitle>Sort</SectionTitle>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as FilterState["sort"] }))}
          className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none hover:bg-neutral-50"
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating_desc">Top Rated</option>
        </select>
      </div>

      {/* Category */}
      <div className="mt-5">
        <SectionTitle>Category</SectionTitle>
        <div className="mt-2 space-y-1">
          {categories.map((c) => (
            <CheckboxRow
              key={c.slug}
              checked={filters.categorySlug === c.slug}
              label={c.name}
              onChange={() =>
                setFilters((f) => ({
                  ...f,
                  categorySlug: f.categorySlug === c.slug ? null : c.slug,
                  subcategorySlug: null,
                }))
              }
            />
          ))}
        </div>
      </div>
      {filters.categorySlug ? (
        <div className="mt-5">
          <SectionTitle>Subcategory</SectionTitle>
          <div className="mt-2 space-y-1">
            {(categories.find((c) => c.slug === filters.categorySlug)?.subcategories || []).map(
              (s) => (
                <CheckboxRow
                  key={s.slug}
                  checked={filters.subcategorySlug === s.slug}
                  label={s.name}
                  onChange={() =>
                    setFilters((f) => ({
                      ...f,
                      subcategorySlug: f.subcategorySlug === s.slug ? null : s.slug,
                    }))
                  }
                />
              )
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <SectionTitle>Deals</SectionTitle>
        <div className="mt-2 flex flex-wrap gap-2">
          <TogglePill
            label="On sale"
            active={filters.isSale}
            onClick={() => setFilters((f) => ({ ...f, isSale: !f.isSale }))}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Page */}
      <main className="py-10">
        <Container>
          {/* Title row */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {title}
              </h1>
              <p className="mt-2 text-sm text-neutral-600">
                {shortDescription}
              </p>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 2).map((c) => (
                <TogglePill
                  key={c.slug}
                  label={c.name}
                  active={filters.categorySlug === c.slug}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      categorySlug: f.categorySlug === c.slug ? null : c.slug,
                      subcategorySlug: null,
                    }))
                  }
                />
              ))}
              <TogglePill
                label="Deals"
                active={filters.isSale}
                onClick={() => setFilters((f) => ({ ...f, isSale: !f.isSale }))}
              />
            </div>
          </div>

          {featureImage ? (
            <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
              <img
                src={featureImage}
                alt={featureImageAlt || title}
                className="h-56 w-full object-contain sm:h-64"
                loading="lazy"
              />
            </div>
          ) : null}

          {/* Layout */}
          <div className="mt-8 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            {/* Sidebar (desktop) */}
            <aside className="hidden lg:block">{FiltersPanel}</aside>

            {/* Results */}
            <section>
              {/* Results header */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-neutral-100 px-3 py-2 text-sm">
                      <span className="font-semibold">{products.length}</span>{" "}
                      <span className="text-neutral-600">results</span>
                    </div>

                    <form
                      className="hidden sm:flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <span className="h-2 w-2 rounded-full bg-neutral-900" />
                      <input
                        value={filters.q}
                        onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                        className="w-72 bg-transparent text-sm outline-none placeholder:text-neutral-400"
                        placeholder="Search inside results..."
                      />
                    </form>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(true)}
                      className="inline-flex items-center rounded-xl border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50 lg:hidden"
                    >
                      Filters
                    </button>
                    <select
                      value={filters.sort}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, sort: e.target.value as FilterState["sort"] }))
                      }
                      className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none hover:bg-neutral-50 sm:w-auto"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="newest">Newest</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating_desc">Top Rated</option>
                    </select>
                  </div>
                </div>

                {/* Active chips */}
                {activeChips.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeChips.map((c) => (
                      <Chip key={c.key} label={c.label} onRemove={c.remove} />
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Grid */}
              <div className="mt-6 grid gap-3 max-[420px]:grid-cols-1 min-[421px]:grid-cols-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    p={{
                      id: p.id,
                      name: p.name,
                      price: p.price,
                      compareAt: p.compareAt,
                      badge: p.badge,
                      rating: p.rating,
                      reviews: p.reviews,
                      image: p.image,
                      href: `/product/${p.id}`,
                    }}
                    variant="compact"
                  />
                ))}
              </div>

              {/* Footer / pagination placeholder */}
              <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-3xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600 shadow-sm sm:flex-row">
                <p>
                  Showing <span className="font-semibold text-neutral-900">{Math.min(products.length, pageSize * page)}</span> of{" "}
                  <span className="font-semibold text-neutral-900">{total}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-xl border border-neutral-200 px-4 py-2 hover:bg-neutral-50 disabled:opacity-50"
                    disabled={page <= 1}
                  >
                    Previous
                  </button>
                  <button
                    onClick={loadMore}
                    disabled={!hasMore || loadingMore || loading}
                    className="rounded-xl bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800 disabled:opacity-60"
                  >
                    {loadingMore ? "Loading..." : "Next"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </Container>
      </main>

      <section className="border-t border-neutral-200 bg-neutral-50 py-14">
        <Container>
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <div className="rt-content" dangerouslySetInnerHTML={{ __html: richHtml }} />
          </div>
        </Container>
      </section>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
            aria-label="Close filters overlay"
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-105 bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Filters</p>
              <button
                className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium hover:bg-neutral-50"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="mt-4">{FiltersPanel}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
