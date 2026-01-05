"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Fetch } from "@/lib/fetch";

type BlogRow = {
  id: number;
  title: string;
  slug: string;
  isPublished: boolean;
  updatedAt: string;
  publishedAt?: string | null;
};

function clampInt(v: any, fallback: number, min: number, max: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function readToken() {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem("adminToken");
    if (saved) return saved;
  }
  return process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "";
}

export default function AdminBlogPage() {
  const [items, setItems] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setAdminToken(readToken());
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setMsg(null);
      try {
        const res = await Fetch("/api/admin/blogs", { auth: true, cache: "no-store" });
        if (res.status === 401) {
          throw new Error("Unauthorized. Set admin token in .env or localStorage.");
        }
        if (!res.ok) throw new Error(res.error || `Failed to load blog posts (${res.status})`);
        if (!cancelled) setItems((res.data as BlogRow[]) ?? []);
      } catch (err: any) {
        if (!cancelled) setMsg(err?.message || "Failed to load blog posts.");
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
    const needle = q.trim().toLowerCase();
    return items.filter((x) => {
      const okQ = !needle || x.title.toLowerCase().includes(needle) || x.slug.toLowerCase().includes(needle);
      const okS = status === "all" ? true : status === "published" ? x.isPublished : !x.isPublished;
      return okQ && okS;
    });
  }, [items, q, status]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = clampInt(page, 1, 1, totalPages);

  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const rows = filtered.slice(start, end);

  return (
    <div className="bg-white">
      <AdminTopbar title="Blog Posts" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Blog posts</p>
            <p className="mt-1 text-xs text-neutral-500">These power your frontend blog listing and single blog pages.</p>
          </div>

          <Link
            href="/admin/blog/create"
            className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            + Create post
          </Link>
        </div>

        {!adminToken ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Admin token missing. Set `NEXT_PUBLIC_ADMIN_TOKEN` in `.env` and restart, or run in console:
            <span className="ml-2 rounded bg-white px-2 py-1 text-xs text-amber-800">
              localStorage.setItem("adminToken", "YOUR_TOKEN")
            </span>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 rounded-3xl border border-neutral-200 bg-white p-4 sm:grid-cols-12">
          <div className="sm:col-span-8">
            <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-neutral-900" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                placeholder="Search title or slug"
                type="search"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as any);
                setPage(1);
              }}
              className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
            >
              <option value="all">Status: All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-4">
            <p className="text-sm font-semibold">
              Showing <span className="text-neutral-600">{total ? start + 1 : 0}-{Math.min(end, total)}</span> of{" "}
              <span className="text-neutral-600">{total}</span>
            </p>
            <p className="text-xs text-neutral-500">Page {safePage} of {totalPages}</p>
          </div>

          {loading ? (
            <div className="p-5 text-sm text-neutral-600">Loading blog posts...</div>
          ) : msg ? (
            <div className="p-5 text-sm text-neutral-700">{msg}</div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {rows.map((x) => (
                <div key={x.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{x.title}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      /blog/{x.slug} - Admin - Updated: {new Date(x.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs",
                        x.isPublished ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-800",
                      ].join(" ")}
                    >
                      {x.isPublished ? "published" : "draft"}
                    </span>

                    <Link
                      href={`/admin/blog/${x.slug}/edit`}
                      className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50"
                    >
                      Edit
                    </Link>

                    <Link
                      href={`/blog/${x.slug}`}
                      className="rounded-2xl bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
                    >
                      View
                    </Link>

                    <button
                      onClick={async () => {
                        if (!confirm(`Delete post "${x.title}"?`)) return;
                        try {
                          const res = await Fetch(`/api/admin/blogs?slug=${encodeURIComponent(x.slug)}`, {
                            method: "DELETE",
                            auth: true,
                          });
                          if (res.status === 401) throw new Error("Unauthorized. Check admin token.");
                          if (!res.ok) throw new Error(res.error || `Delete failed (${res.status})`);
                          setItems((prev) => prev.filter((r) => r.slug !== x.slug));
                        } catch (err: any) {
                          setMsg(err?.message || "Failed to delete post.");
                        }
                      }}
                      className="rounded-2xl border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-4 border-t border-neutral-200 bg-white px-5 py-4">
            <p className="text-xs text-neutral-500">Tip: Add internal links to categories/subcategories inside content.</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className={[
                  "rounded-xl border px-4 py-2 text-sm",
                  safePage === 1 ? "border-neutral-200 text-neutral-400" : "border-neutral-200 hover:bg-neutral-50",
                ].join(" ")}
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className={[
                  "rounded-xl border px-4 py-2 text-sm",
                  safePage === totalPages ? "border-neutral-200 text-neutral-400" : "border-neutral-200 hover:bg-neutral-50",
                ].join(" ")}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
