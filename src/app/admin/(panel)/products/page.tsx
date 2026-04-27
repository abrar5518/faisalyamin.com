// src/app/admin/(panel)/products/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Table } from "@/components/admin/Table";
import { Fetch } from "@/lib/fetch";

function clampInt(v: any, fallback: number, min: number, max: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function buildHref(page: number, q: string) {
  const qs = new URLSearchParams();
  if (page > 1) qs.set("page", String(page));
  if (q) qs.set("q", q);
  const s = qs.toString();
  return `/admin/products${s ? `?${s}` : ""}`;
}

type AdminProductRow = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  price: string | number;
  categoryName?: string | null;
  categorySlug?: string | null;
  categoryNames?: string[] | null;
  categorySlugs?: string[] | null;
  updatedAt?: string | null;
};

function formatPrice(value: string | number) {
  const num = Number(value);
  if (Number.isFinite(num)) {
    return `PKR ${num.toLocaleString("en-PK")}`;
  }
  return String(value ?? "");
}

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const q = (searchParams?.get("q") ?? "").toString();
  const page = clampInt(searchParams?.get("page"), 1, 1, 999);

  const [items, setItems] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setMsg(null);
      try {
        const res = await Fetch("/api/admin/products", { auth: true, cache: "no-store" });
        if (res.status === 401) {
          throw new Error("Unauthorized. Please sign in again.");
        }
        if (!res.ok) throw new Error(res.error || `Failed to load products (${res.status})`);
        if (!cancelled) setItems((res.data as AdminProductRow[]) ?? []);
      } catch (err: any) {
        if (!cancelled) setMsg(err?.message || "Failed to load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => (q ? items.filter((x) => x.name.toLowerCase().includes(q.toLowerCase())) : items),
    [items, q]
  );

  const pageSize = 12;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  return (
    <div className="bg-white">
      <AdminTopbar title="Products" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              {total} products
              <span className="ml-2 text-xs text-neutral-500">
                (page {safePage} of {totalPages})
              </span>
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Manage stock, pricing, status and SEO fields.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-neutral-900" />
              <input
                name="q"
                defaultValue={q}
                className="w-60 bg-transparent text-sm outline-none placeholder:text-neutral-400"
                placeholder="Search products..."
              />
              <button className="btn-primary px-4 py-2 text-xs">Search</button>
            </form>

            <Link href="/admin/products/create" className="btn-primary px-4 py-2 text-sm">
              + Add product
            </Link>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
              Loading products...
            </div>
          ) : msg ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
              {msg}
            </div>
          ) : (
            <Table
              headers={["Product", "Status", "Price", "Stock", "Category", "Updated", "Actions"]}
              rows={pageItems.map((p) => {
                const status = p.isActive ? "published" : "draft";
                const category =
                  p.categoryNames?.length
                    ? p.categoryNames.join(", ")
                    : p.categoryName || p.categorySlug || "-";
                const displayName = p.name.length > 20 ? `${p.name.slice(0, 20)}...` : p.name;
                return [
                  <div key={p.id} className="min-w-0">
                    <p className="truncate font-medium">{displayName}</p>
                    <p className="text-xs text-neutral-500">{p.slug}</p>
                  </div>,
                  <span
                    key={status}
                    className={[
                      "inline-flex rounded-full px-3 py-1 text-xs",
                      status === "published"
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-900",
                    ].join(" ")}
                  >
                    {status}
                  </span>,
                  <span key={`${p.slug}-price`}>{formatPrice(p.price)}</span>,
                  <span key={`${p.slug}-stock`}>-</span>,
                  <span key={`${p.slug}-cat`}>{category}</span>,
                  <span key={`${p.slug}-updated`} className="text-xs text-neutral-500">
                    {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "-"}
                  </span>,
                  <div key={`${p.slug}-a`} className="flex gap-2">
                    <Link
                      href={`/product/${p.slug}`}
                      className="rounded-xl border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/products/${p.slug}/edit`}
                      className="rounded-xl bg-neutral-900 px-3 py-2 text-xs text-white hover:bg-neutral-800"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete product "${p.name}"?`)) return;
                        try {
                          const res = await Fetch(
                            `/api/admin/products?slug=${encodeURIComponent(p.slug)}`,
                            { method: "DELETE", auth: true }
                          );
                          if (res.status === 401) {
                            throw new Error("Unauthorized. Please sign in again.");
                          }
                          if (!res.ok) throw new Error(res.error || `Delete failed (${res.status})`);
                          setItems((prev) => prev.filter((x) => x.slug !== p.slug));
                        } catch (err: any) {
                          setMsg(err?.message || "Failed to delete product.");
                        }
                      }}
                      className="rounded-xl border border-red-200 px-3 py-2 text-xs text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>,
                ];
              })}
            />
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-5">
          <p className="text-xs text-neutral-500">Tip: Keep only published items visible on store.</p>

          <div className="flex items-center gap-2">
            <Link
              href={buildHref(Math.max(1, safePage - 1), q)}
              aria-disabled={safePage === 1}
              className={[
                "rounded-xl border px-4 py-2 text-sm",
                safePage === 1
                  ? "pointer-events-none border-neutral-200 text-neutral-400"
                  : "border-neutral-200 hover:bg-neutral-50",
              ].join(" ")}
            >
              Prev
            </Link>

            <span className="rounded-xl border border-neutral-200 px-4 py-2 text-sm">{safePage}</span>

            <Link
              href={buildHref(Math.min(totalPages, safePage + 1), q)}
              aria-disabled={safePage === totalPages}
              className={[
                "rounded-xl border px-4 py-2 text-sm",
                safePage === totalPages
                  ? "pointer-events-none border-neutral-200 text-neutral-400"
                  : "border-neutral-200 hover:bg-neutral-50",
              ].join(" ")}
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
