// src/app/admin/(panel)/subcategories/page.tsx
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
function buildHref(page: number, q: string, categorySlug: string) {
  const qs = new URLSearchParams();
  if (page > 1) qs.set("page", String(page));
  if (q) qs.set("q", q);
  if (categorySlug) qs.set("categorySlug", categorySlug);
  const s = qs.toString();
  return `/admin/subcategories${s ? `?${s}` : ""}`;
}

type AdminSubcategoryRow = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  metaKeywords?: string | null;
  category?: { slug: string; name: string } | null;
  updatedAt?: string | null;
};

export default function AdminSubcategoriesPage() {
  const searchParams = useSearchParams();
  const q = (searchParams?.get("q") ?? "").toString();
  const categorySlug = (searchParams?.get("categorySlug") ?? "").toString();
  const page = clampInt(searchParams?.get("page"), 1, 1, 999);
  const [items, setItems] = useState<AdminSubcategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setMsg(null);
      try {
        const res = await Fetch("/api/admin/subcategories", { auth: true, cache: "no-store" });
        if (!res.ok) {
          throw new Error(res.error || `Failed to load subcategories (${res.status})`);
        }
        if (!cancelled) setItems(res.data ?? []);
      } catch (err: any) {
        if (!cancelled) setMsg(err?.message || "Failed to load subcategories.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return items
      .filter((x) => (categorySlug ? x.category?.slug === categorySlug : true))
      .filter((x) =>
        q ? (x.name + " " + x.slug + " " + (x.category?.slug || "")).toLowerCase().includes(q.toLowerCase()) : true
      );
  }, [items, q, categorySlug]);

  const pageSize = 12;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  return (
    <div className="bg-white">
      <AdminTopbar title="Subcategories" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              {total} subcategories{" "}
              <span className="ml-2 text-xs text-neutral-500">
                (page {safePage} of {totalPages})
              </span>
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              These power: <span className="text-neutral-700">/categories/[slug]/[sub]</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-neutral-900" />
              <input
                name="q"
                defaultValue={q}
                className="w-56 bg-transparent text-sm outline-none placeholder:text-neutral-400"
                placeholder="Search subcategories..."
              />
              <input
                name="categorySlug"
                defaultValue={categorySlug}
                className="w-44 bg-transparent text-sm outline-none placeholder:text-neutral-400"
                placeholder="Filter by category slug..."
              />
              <button className="btn-primary px-4 py-2 text-xs">Search</button>
            </form>

            <Link href="/admin/subcategories/create" className="btn-primary px-4 py-2 text-sm">
              + Add subcategory
            </Link>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
              Loading subcategories...
            </div>
          ) : msg ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
              {msg}
            </div>
          ) : (
            <Table
              headers={["Name", "Category", "Slug", "Meta keywords", "Updated", "Actions"]}
              rows={pageItems.map((s) => [
                <div key={s.id} className="min-w-0">
                  <p className="truncate font-medium">{s.name}</p>
                  <p className="text-xs text-neutral-500 line-clamp-1">{s.description ?? "-"}</p>
                </div>,
                <span key={`${s.id}-c`} className="text-sm">
                  {s.category?.slug ?? "-"}
                </span>,
                <span key={`${s.id}-ss`} className="text-sm">
                  {s.slug}
                </span>,
                <span key={`${s.id}-m`} className="text-xs text-neutral-500 line-clamp-1">
                  {s.metaKeywords || "-"}
                </span>,
                <span key={`${s.id}-u`} className="text-xs text-neutral-500">
                  {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : "-"}
                </span>,
                <div key={`${s.id}-a`} className="flex gap-2">
                  {s.category?.slug ? (
                    <Link
                      href={`/categories/${s.category.slug}/${s.slug}`}
                      className="rounded-xl border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50"
                    >
                      View
                    </Link>
                  ) : null}
                  <Link
                    href={`/admin/subcategories/${s.slug}/edit`}
                    className="rounded-xl bg-neutral-900 px-3 py-2 text-xs text-white hover:bg-neutral-800"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete subcategory "${s.name}"?`)) return;
                      try {
                        const res = await Fetch(
                          `/api/admin/subcategories?slug=${encodeURIComponent(s.slug)}`,
                          { method: "DELETE", auth: true }
                        );
                        if (!res.ok) throw new Error(res.error || `Delete failed (${res.status})`);
                        setItems((prev) => prev.filter((x) => x.slug !== s.slug));
                      } catch (err: any) {
                        setMsg(err?.message || "Failed to delete subcategory.");
                      }
                    }}
                    className="rounded-xl border border-red-200 px-3 py-2 text-xs text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>,
              ])}
            />
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-5">
          <p className="text-xs text-neutral-500">Tip: Subcategory pages help SEO and internal linking.</p>

          <div className="flex items-center gap-2">
            <Link
              href={buildHref(Math.max(1, safePage - 1), q, categorySlug)}
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
              href={buildHref(Math.min(totalPages, safePage + 1), q, categorySlug)}
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
