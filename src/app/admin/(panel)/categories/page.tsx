// src/app/admin/(panel)/categories/page.tsx
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
  return `/admin/categories${s ? `?${s}` : ""}`;
}

type AdminCategoryRow = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  metaKeywords?: string | null;
  updatedAt?: string | null;
};

export default function AdminCategoriesPage() {
  const searchParams = useSearchParams();
  const q = (searchParams?.get("q") ?? "").toString();
  const page = clampInt(searchParams?.get("page"), 1, 1, 999);
  const [items, setItems] = useState<AdminCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setMsg(null);
      try {
        const res = await Fetch("/api/admin/categories", { auth: true, cache: "no-store" });
        if (!res.ok) {
          throw new Error(res.error || `Failed to load categories (${res.status})`);
        }
        if (!cancelled) setItems(res.data ?? []);
      } catch (err: any) {
        if (!cancelled) setMsg(err?.message || "Failed to load categories.");
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
    () =>
      q
        ? items.filter((x) => (x.name + " " + x.slug).toLowerCase().includes(q.toLowerCase()))
        : items,
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
      <AdminTopbar title="Categories" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              {total} categories{" "}
              <span className="ml-2 text-xs text-neutral-500">
                (page {safePage} of {totalPages})
              </span>
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              These power: <span className="text-neutral-700">/categories/[slug]</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-neutral-900" />
              <input
                name="q"
                defaultValue={q}
                className="w-60 bg-transparent text-sm outline-none placeholder:text-neutral-400"
                placeholder="Search categories..."
              />
              <button className="btn-primary px-4 py-2 text-xs">Search</button>
            </form>

            <Link href="/admin/categories/create" className="btn-primary px-4 py-2 text-sm">
              + Add category
            </Link>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
              Loading categories...
            </div>
          ) : msg ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
              {msg}
            </div>
          ) : (
            <Table
              headers={["Name", "Slug", "Meta keywords", "Updated", "Actions"]}
              rows={pageItems.map((c) => [
                <div key={c.id} className="min-w-0">
                  <p className="truncate font-medium">{c.name}</p>
                  <p className="text-xs text-neutral-500 line-clamp-1">{c.description ?? "-"}</p>
                </div>,
                <span key={c.slug} className="text-sm text-neutral-700">
                  {c.slug}
                </span>,
                <span key={`${c.id}-m`} className="text-xs text-neutral-500 line-clamp-1">
                  {c.metaKeywords || "-"}
                </span>,
                <span key={`${c.id}-u`} className="text-xs text-neutral-500">
                  {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : "-"}
                </span>,
                <div key={`${c.id}-a`} className="flex gap-2">
                  <Link
                    href={`/categories/${c.slug}`}
                    className="rounded-xl border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/categories/${c.slug}/edit`}
                    className="rounded-xl bg-neutral-900 px-3 py-2 text-xs text-white hover:bg-neutral-800"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete category "${c.name}"?`)) return;
                      try {
                        const res = await Fetch(
                          `/api/admin/categories?slug=${encodeURIComponent(c.slug)}`,
                          { method: "DELETE", auth: true }
                        );
                        if (!res.ok) throw new Error(res.error || `Delete failed (${res.status})`);
                        setItems((prev) => prev.filter((x) => x.slug !== c.slug));
                      } catch (err: any) {
                        setMsg(err?.message || "Failed to delete category.");
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
          <p className="text-xs text-neutral-500">Tip: Use clear category names for navigation and SEO.</p>

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
