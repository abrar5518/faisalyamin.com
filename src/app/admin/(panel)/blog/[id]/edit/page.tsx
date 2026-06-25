"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ImageUploader from "@/components/admin/common/ImageUploader";
import RichEditor from "@/components/admin/common/RichEditor";
import FaqEditor, { cleanFaqItems, type AdminFaqItem } from "@/components/admin/common/FaqEditor";
import BlogProductSelector, { BlogProductSelection } from "@/components/admin/blog/BlogProductSelector";
import type { AdminImage } from "@/types/adminProduct";
import { Fetch } from "@/lib/fetch";

type AuthorOption = {
  id?: number;
  name: string;
  slug: string;
  role?: string | null;
};

type BlogEditModel = {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  excerpt: string;
  coverImage: AdminImage | null;
  html: string;
  category: string;
  tags: string;
  authorId: number | "";
  productSelections: BlogProductSelection[];
  faqItems: AdminFaqItem[];

  seoTitle?: string;
  seoMetaDescription?: string;
  metaKeywords?: string;
};

export default function AdminBlogEditPage() {
  const params = useParams<{ id?: string }>();
  const id = params?.id ?? "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [p, setP] = useState<BlogEditModel | null>(null);
  const [author, setAuthor] = useState<AuthorOption | null>(null);

  const viewHref = useMemo(() => (p ? `/blog/${p.slug}` : "/blog"), [p]);
  const seoPreview = useMemo(
    () => ({
      title: p?.seoTitle?.trim() || p?.title.trim() || "Untitled blog post",
      description:
        p?.seoMetaDescription?.trim() ||
        p?.excerpt.trim() ||
        "Add a meta description so searchers understand this article.",
      url: `/blog/${p?.slug || "post-slug"}`,
    }),
    [p?.excerpt, p?.seoMetaDescription, p?.seoTitle, p?.slug, p?.title]
  );

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

        const base: BlogEditModel = {
          id: String(api.id ?? ""),
          title: api.title ?? "",
          slug: api.slug ?? id,
          status: api.isPublished ? "published" : "draft",
          excerpt: api.excerpt ?? "",
          coverImage: api.coverImage ? { url: api.coverImage, alt: api.coverAlt ?? "" } : null,
          html: api.contentHtml ?? "",
          category: api.category ?? "",
          tags: api.tags ?? "",
          authorId: api.authorId ?? "",
          faqItems: Array.isArray(api.faqItems) && api.faqItems.length
            ? api.faqItems.map((item: any) => ({
                question: item?.question ?? "",
                answer: item?.answer ?? "",
              }))
            : [{ question: "", answer: "" }],
          productSelections: Array.isArray(api.productSelections)
            ? api.productSelections.map((p: any) => ({
                productId: Number(p.productId),
                placement: p.placement,
                sortOrder: p.sortOrder,
              }))
            : [],
          seoTitle: api.metaTitle ?? "",
          seoMetaDescription: api.metaDescription ?? "",
          metaKeywords: api.metaKeywords ?? "",
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await Fetch("/api/admin/blog-author", { auth: true, cache: "no-store" });
        if (!cancelled && res.ok && res.data) {
          setAuthor(res.data as AuthorOption);
        }
      } catch {
        // Author is optional.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
        category: p.category || undefined,
        tags: p.tags,
        authorId: p.authorId || null,
        isPublished: p.status === "published",
        metaTitle: p.seoTitle || undefined,
        metaDescription: p.seoMetaDescription || undefined,
        metaKeywords: p.metaKeywords || undefined,
        faqItems: cleanFaqItems(p.faqItems),
        productSelections: p.productSelections.map((item, idx) => ({
          ...item,
          sortOrder: idx,
        })),
      };

      const res = await Fetch(`/api/admin/blogs?slug=${encodeURIComponent(id)}`, {
        method: "PUT",
        auth: true,
        data: payload,
      });

      if (res.status === 401) throw new Error("Unauthorized. Check admin token.");
      if (!res.ok) throw new Error(res.error || `Failed (${res.status})`);

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
              <p className="text-sm font-semibold">Basics</p>
              <p className="mt-1 text-xs text-neutral-500">
                Same pattern as pages: basics first, then long content, FAQs, products, media, and SEO.
              </p>

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
                <div>
                  <label className="text-xs font-medium text-neutral-700">Author</label>
                  <select
                    value={p.authorId}
                    onChange={(e) =>
                      setP((x) =>
                        x ? { ...x, authorId: e.target.value ? Number(e.target.value) : "" } : x
                      )
                    }
                    className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  >
                    <option value="">No author selected</option>
                    {author?.id ? (
                      <option value={author.id}>
                        {author.name}
                        {author.role ? ` - ${author.role}` : ""}
                      </option>
                    ) : null}
                  </select>
                  <p className="mt-1 text-xs text-neutral-500">
                    Manage the profile from Blog &gt; Author profile.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Category</label>
                  <input
                    value={p.category}
                    onChange={(e) => setP((x) => (x ? { ...x, category: e.target.value } : x))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="Buying Guide"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Tags</label>
                  <input
                    value={p.tags}
                    onChange={(e) => setP((x) => (x ? { ...x, tags: e.target.value } : x))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="COD, Delivery, Product Tips"
                  />
                  <p className="mt-1 text-xs text-neutral-500">Separate tags with commas.</p>
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
                <label className="text-xs font-medium text-neutral-700">
                  Long description / article content
                </label>
                <RichEditor value={p.html} onChange={(val) => setP((x) => (x ? { ...x, html: val } : x))} />
              </div>
            </div>

            <FaqEditor
              value={p.faqItems}
              onChange={(faqItems) => setP((x) => (x ? { ...x, faqItems } : x))}
              title="Blog FAQs"
              hint="Add post-specific FAQs that can appear below the blog content."
            />

            <BlogProductSelector
              value={p.productSelections}
              onChange={(next) => setP((x) => (x ? { ...x, productSelections: next } : x))}
            />
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
              <p className="text-sm font-semibold">SEO metadata</p>
              <p className="mt-1 text-xs text-neutral-500">
                Preview how this post may appear in search results.
              </p>

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

              <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold text-neutral-700">Search preview</p>
                <p className="mt-2 line-clamp-1 text-sm font-semibold text-blue-700">
                  {seoPreview.title}
                </p>
                <p className="mt-1 text-xs text-emerald-700">{seoPreview.url}</p>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-neutral-600">
                  {seoPreview.description}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
