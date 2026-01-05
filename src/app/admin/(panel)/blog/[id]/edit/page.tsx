"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ImageUploader from "@/components/admin/common/ImageUploader";
import RichEditor from "@/components/admin/common/RichEditor";
import type { AdminImage } from "@/types/adminProduct";
import { Fetch } from "@/lib/fetch";

type BlogEditModel = {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  excerpt: string;
  coverImage: AdminImage | null;
  html: string;

  seoTitle?: string;
  seoMetaDescription?: string;
  metaKeywords?: string;
};

function loadCache(slug: string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`adminBlog:${slug}`);
    if (!raw) return null;
    return JSON.parse(raw) as {
      seoTitle?: string;
      seoMetaDescription?: string;
      metaKeywords?: string;
      coverAlt?: string;
    };
  } catch {
    return null;
  }
}

function saveCache(slug: string, data: { seoTitle?: string; seoMetaDescription?: string; metaKeywords?: string; coverAlt?: string }) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`adminBlog:${slug}`, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

function removeCache(slug: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`adminBlog:${slug}`);
  } catch {
    // ignore storage errors
  }
}

export default function AdminBlogEditPage() {
  const params = useParams<{ id?: string }>();
  const id = params?.id ?? "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [p, setP] = useState<BlogEditModel | null>(null);

  const viewHref = useMemo(() => (p ? `/blog/${p.slug}` : "/blog"), [p]);

  useEffect(() => {
    if (!id) {
      setMsg("Missing blog slug.");
      setLoading(false);
      return;
    }

    const run = async () => {
      setLoading(true);
      setMsg(null);

      try {
        const res = await Fetch(`/api/admin/blogs?slug=${encodeURIComponent(id)}`, {
          auth: true,
          cache: "no-store",
        });
        if (res.status === 401) throw new Error("Unauthorized. Check admin token.");
        if (!res.ok) throw new Error(res.error || `Failed to load blog post (${res.status})`);
        const api = res.data as any;

        const cached = loadCache(api.slug ?? id);

        const base: BlogEditModel = {
          id: String(api.id ?? ""),
          title: api.title ?? "",
          slug: api.slug ?? id,
          status: api.isPublished ? "published" : "draft",
          excerpt: api.excerpt ?? "",
          coverImage: api.coverImage ? { url: api.coverImage, alt: api.coverAlt ?? cached?.coverAlt ?? "" } : null,
          html: api.contentHtml ?? "",
          seoTitle: cached?.seoTitle ?? "",
          seoMetaDescription: cached?.seoMetaDescription ?? "",
          metaKeywords: cached?.metaKeywords ?? "",
        };

        setP(base);
      } catch (err: any) {
        setMsg(err?.message || "Failed to load blog post.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  async function onSave() {
    if (!p) return;

    setMsg(null);
    if (!p.title.trim()) return setMsg("Title required.");
    if (!p.html.trim()) return setMsg("HTML content required.");

    setSaving(true);
    try {
      const payload = {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        coverImage: p.coverImage?.url || undefined,
        coverAlt: p.coverImage?.alt || undefined,
        contentHtml: p.html,
        isPublished: p.status === "published",
      };

      const res = await Fetch(`/api/admin/blogs?slug=${encodeURIComponent(id)}`, {
        method: "PUT",
        auth: true,
        data: payload,
      });

      if (res.status === 401) throw new Error("Unauthorized. Check admin token.");
      if (!res.ok) throw new Error(res.error || `Failed (${res.status})`);

      if (p.slug !== id) {
        removeCache(id);
      }
      saveCache(p.slug, {
        seoTitle: p.seoTitle,
        seoMetaDescription: p.seoMetaDescription,
        metaKeywords: p.metaKeywords,
        coverAlt: p.coverImage?.alt || "",
      });

      setMsg("Saved.");
    } catch (e: any) {
      setMsg(e?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !p) {
    return (
      <div className="bg-white">
        <AdminTopbar title="Edit Blog Post" />
        <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
            {msg || "Loading post..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <AdminTopbar title="Edit Blog Post" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Post details</p>
            <p className="mt-1 text-xs text-neutral-500">ID: {id}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/blog"
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Back
            </Link>

            <Link
              href={viewHref}
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              View
            </Link>

            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        {msg ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            {msg}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Content</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Title</label>
                  <input
                    value={p.title}
                    onChange={(e) => setP((x) => (x ? { ...x, title: e.target.value } : x))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Slug</label>
                  <input
                    value={p.slug}
                    onChange={(e) => setP((x) => (x ? { ...x, slug: e.target.value } : x))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Status</label>
                  <select
                    value={p.status}
                    onChange={(e) => setP((x) => (x ? { ...x, status: e.target.value as any } : x))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Excerpt</label>
                <textarea
                  value={p.excerpt}
                  onChange={(e) => setP((x) => (x ? { ...x, excerpt: e.target.value } : x))}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  rows={3}
                />
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">HTML content</label>
                <RichEditor value={p.html} onChange={(val) => setP((x) => (x ? { ...x, html: val } : x))} />
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <ImageUploader
              title="Cover image"
              hint="Upload a single cover image for the blog post."
              value={p.coverImage ? [p.coverImage] : []}
              onChange={(imgs) => setP((x) => (x ? { ...x, coverImage: imgs[0] ?? null } : x))}
              max={1}
              kind="blog"
            />

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">SEO meta</p>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">SEO title</label>
                <input
                  value={p.seoTitle ?? ""}
                  onChange={(e) => setP((x) => (x ? { ...x, seoTitle: e.target.value || undefined } : x))}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                />
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">SEO meta description</label>
                <textarea
                  value={p.seoMetaDescription ?? ""}
                  onChange={(e) => setP((x) => (x ? { ...x, seoMetaDescription: e.target.value || undefined } : x))}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  rows={3}
                />
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Meta keywords</label>
                <input
                  value={p.metaKeywords ?? ""}
                  onChange={(e) => setP((x) => (x ? { ...x, metaKeywords: e.target.value || undefined } : x))}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
