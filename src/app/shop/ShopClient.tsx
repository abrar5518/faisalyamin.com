// src/app/shop/page.tsx
"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard, { Product } from "@/components/ProductCard";
import { Fetch } from "@/lib/fetch";

type FilterState = {
  q: string;
  sort: "relevance" | "price_asc" | "price_desc" | "rating_desc" | "newest";
  category: string[];
  brand: string[];
  condition: ("New" | "Pre-Owned")[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  inStockOnly: boolean;
};

const CATEGORIES = [
  "Luxury Watches",
  "Accessories",
  "Jewelry",
  "New Arrivals",
  "Best Sellers",
  "Pre-Owned",
];

const BRANDS = [
  "Rolex",
  "Patek Philippe",
  "Audemars Piguet",
  "Omega",
  "Cartier",
  "Jaeger-LeCoultre",
];

function parsePrice(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export type ShopProduct = Product & {
  category: string;
  brand: string;
  condition: "New" | "Pre-Owned";
  inStock: boolean;
  createdAt: string; // ISO
};

type ShopClientProps = {
  initialProducts: ShopProduct[];
  initialTotal: number;
  pageSize: number;
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
}: ShopClientProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    q: "",
    sort: "relevance",
    category: [],
    brand: [],
    condition: [],
    minPrice: 0,
    maxPrice: 400000,
    minRating: 0,
    inStockOnly: false,
  });

  const [products, setProducts] = useState<ShopProduct[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const hasMore = products.length < total;

  const mapApiProduct = (p: any): ShopProduct => {
    const img = p.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30";
    const slug = p.slug ?? String(p.id ?? "");
    const brand = p.name ? String(p.name).split(" ")[0] : "LuxStore";
    return {
      id: slug,
      name: p.name ?? "Untitled product",
      price: `PKR ${Number(p.price ?? 0).toLocaleString("en-PK")}`,
      compareAt: p.compareAt != null ? `PKR ${Number(p.compareAt).toLocaleString("en-PK")}` : undefined,
      badge: p.badge ?? undefined,
      rating: typeof p.rating === "number" ? p.rating : 0,
      reviews: typeof p.reviewsCount === "number" ? p.reviewsCount : 0,
      image: img,
      category: p.categorySlug ?? "Luxury Watches",
      brand,
      condition: p.isSale ? "Pre-Owned" : "New",
      inStock: true,
      createdAt: p.createdAt ?? "",
    };
  };

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
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
      const res = await Fetch(
        `/api/products?page=${nextPage}&pageSize=${pageSize}&sort=${sort}${
          q ? `&q=${encodeURIComponent(q)}` : ""
        }`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const items = Array.isArray(res.data) ? res.data : [];
      const nextItems = items.map(mapApiProduct);
      setProducts((prev) => {
        const merged = [...prev, ...nextItems];
        if (nextItems.length < pageSize) {
          setTotal(merged.length);
        }
        return merged;
      });
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  }

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; remove: () => void }[] = [];

    if (filters.q.trim()) {
      chips.push({
        key: "q",
        label: `Search: "${filters.q.trim()}"`,
        remove: () => setFilters((f) => ({ ...f, q: "" })),
      });
    }
    filters.category.forEach((c) =>
      chips.push({
        key: `cat:${c}`,
        label: c,
        remove: () =>
          setFilters((f) => ({ ...f, category: f.category.filter((x) => x !== c) })),
      })
    );
    filters.brand.forEach((b) =>
      chips.push({
        key: `brand:${b}`,
        label: b,
        remove: () =>
          setFilters((f) => ({ ...f, brand: f.brand.filter((x) => x !== b) })),
      })
    );
    filters.condition.forEach((c) =>
      chips.push({
        key: `cond:${c}`,
        label: c,
        remove: () =>
          setFilters((f) => ({ ...f, condition: f.condition.filter((x) => x !== c) })),
      })
    );

    if (filters.minRating > 0) {
      chips.push({
        key: "rating",
        label: `Rating ${filters.minRating}+`,
        remove: () => setFilters((f) => ({ ...f, minRating: 0 })),
      });
    }

    if (filters.inStockOnly) {
      chips.push({
        key: "stock",
        label: "In stock",
        remove: () => setFilters((f) => ({ ...f, inStockOnly: false })),
      });
    }

    // price chip only if changed from defaults
    if (filters.minPrice !== 0 || filters.maxPrice !== 400000) {
      chips.push({
        key: "price",
        label: `PKR ${filters.minPrice.toLocaleString()}-${filters.maxPrice.toLocaleString()}`,
        remove: () => setFilters((f) => ({ ...f, minPrice: 0, maxPrice: 400000 })),
      });
    }

    return chips;
  }, [filters, products]);

  const results = useMemo(() => {
    const q = filters.q.trim().toLowerCase();

    let list = products.filter((p) => {
      const price = parsePrice(p.price);

      const matchesQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesCat =
        filters.category.length === 0 || filters.category.includes(p.category);

      const matchesBrand =
        filters.brand.length === 0 || filters.brand.includes(p.brand);

      const matchesCondition =
        filters.condition.length === 0 || filters.condition.includes(p.condition);

      const matchesPrice = price >= filters.minPrice && price <= filters.maxPrice;

      const matchesRating = p.rating >= filters.minRating;

      const matchesStock = !filters.inStockOnly || p.inStock;

      return (
        matchesQ &&
        matchesCat &&
        matchesBrand &&
        matchesCondition &&
        matchesPrice &&
        matchesRating &&
        matchesStock
      );
    });

    // Sorting
    if (filters.sort === "price_asc") {
      list = [...list].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (filters.sort === "price_desc") {
      list = [...list].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    } else if (filters.sort === "rating_desc") {
      list = [...list].sort((a, b) => b.rating - a.rating);
    } else if (filters.sort === "newest") {
      list = [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    } // relevance leaves as-is

    return list;
  }, [filters]);

  function toggleInArray<T>(arr: T[], value: T) {
    return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
  }

  const FiltersPanel = (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
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
              category: [],
              brand: [],
              condition: [],
              minPrice: 0,
              maxPrice: 400000,
              minRating: 0,
              inStockOnly: false,
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const q = filters.q.trim();
                if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
              }
            }}
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
          {CATEGORIES.map((c) => (
            <CheckboxRow
              key={c}
              checked={filters.category.includes(c)}
              label={c}
              onChange={() => setFilters((f) => ({ ...f, category: toggleInArray(f.category, c) }))}
            />
          ))}
        </div>
      </div>

      {/* Brand */}
      <div className="mt-5">
        <SectionTitle>Brand</SectionTitle>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {BRANDS.map((b) => {
            const active = filters.brand.includes(b);
            return (
              <button
                key={b}
                type="button"
                onClick={() => setFilters((f) => ({ ...f, brand: toggleInArray(f.brand, b) }))}
                className={[
                  "rounded-2xl border px-3 py-2 text-xs font-medium transition",
                  active
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                ].join(" ")}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition */}
      <div className="mt-5">
        <SectionTitle>Condition</SectionTitle>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["New", "Pre-Owned"] as const).map((c) => (
            <TogglePill
              key={c}
              label={c}
              active={filters.condition.includes(c)}
              onClick={() =>
                setFilters((f) => ({ ...f, condition: toggleInArray(f.condition, c) }))
              }
            />
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="mt-5">
        <SectionTitle>Price range</SectionTitle>
        <div className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between text-xs text-neutral-600">
            <span>PKR {filters.minPrice.toLocaleString()}</span>
            <span>PKR {filters.maxPrice.toLocaleString()}</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-neutral-200 bg-white px-3 py-2">
              <p className="text-[11px] text-neutral-500">Min</p>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters((f) => ({ ...f, minPrice: Number(e.target.value || 0) }))}
                className="mt-1 w-full bg-transparent text-sm outline-none"
                min={0}
                step={100}
              />
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white px-3 py-2">
              <p className="text-[11px] text-neutral-500">Max</p>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, maxPrice: Number(e.target.value || 0) }))
                }
                className="mt-1 w-full bg-transparent text-sm outline-none"
                min={0}
                step={100}
              />
            </div>
          </div>

          <div className="mt-3 text-[11px] text-neutral-500">
            Tip: keep max under PKR 60,000 to see more options.
          </div>
        </div>
      </div>

      {/* Rating + Stock */}
      <div className="mt-5">
        <SectionTitle>Rating</SectionTitle>
        <div className="mt-2 flex flex-wrap gap-2">
          {[0, 4, 4.5, 4.8].map((r) => (
            <TogglePill
              key={r}
              label={r === 0 ? "Any" : `${r}+`}
              active={filters.minRating === r}
              onClick={() => setFilters((f) => ({ ...f, minRating: r }))}
            />
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-3">
          <button
            type="button"
            onClick={() => setFilters((f) => ({ ...f, inStockOnly: !f.inStockOnly }))}
            className="flex w-full items-center justify-between"
          >
            <span className="text-sm text-neutral-800">In stock only</span>
            <span
              className={[
                "h-6 w-11 rounded-full border p-1 transition",
                filters.inStockOnly ? "border-neutral-900 bg-neutral-900" : "border-neutral-300 bg-white",
              ].join(" ")}
            >
              <span
                className={[
                  "block h-4 w-4 rounded-full bg-white transition",
                  filters.inStockOnly ? "translate-x-5" : "translate-x-0",
                ].join(" ")}
              />
            </span>
          </button>
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
                Shop
              </h1>
              <p className="mt-2 text-sm text-neutral-600">
                Browse premium pieces. Use filters to find the perfect match.
              </p>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2">
              <TogglePill
                label="Watches"
                active={filters.category.includes("Luxury Watches")}
                onClick={() =>
                  setFilters((f) => ({ ...f, category: toggleInArray(f.category, "Luxury Watches") }))
                }
              />
              <TogglePill
                label="Accessories"
                active={filters.category.includes("Accessories")}
                onClick={() =>
                  setFilters((f) => ({ ...f, category: toggleInArray(f.category, "Accessories") }))
                }
              />
              <TogglePill
                label="Deals"
                active={filters.sort === "price_asc"}
                onClick={() => setFilters((f) => ({ ...f, sort: "price_asc" }))}
              />
            </div>
          </div>

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
                      <span className="font-semibold">{results.length}</span>{" "}
                      <span className="text-neutral-600">results</span>
                    </div>

                    <form
                      className="hidden sm:flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const q = filters.q.trim();
                        if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
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
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((p) => (
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
                  Showing <span className="font-semibold text-neutral-900">{Math.min(results.length, pageSize * page)}</span> of{" "}
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
                    disabled={!hasMore || loadingMore}
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

