"use client";

import Link from "next/link";
import { useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ImageUploader from "@/components/admin/common/ImageUploader";
import RichEditor from "@/components/admin/common/RichEditor";
import FaqEditor, { cleanFaqItems, type AdminFaqItem } from "@/components/admin/common/FaqEditor";
import BlogProductSelector, { BlogProductSelection } from "@/components/admin/blog/BlogProductSelector";
import type { AdminImage } from "@/types/adminProduct";
import { Fetch } from "@/lib/fetch";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function saveCache(slug: string, data: { seoTitle?: string; seoMetaDescription?: string; metaKeywords?: string; coverAlt?: string }) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`adminBlog:${slug}`, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export default function AdminBlogCreatePage() {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const [excerpt, setExcerpt] = useState("Short excerpt for listing card...");
  const [coverImage, setCoverImage] = useState<AdminImage | null>(null);

  const [html, setHtml] = useState("<h2>Blog title</h2><p>Rich HTML content here...</p>");
  const [productSelections, setProductSelections] = useState<BlogProductSelection[]>([]);
  const [faqItems, setFaqItems] = useState<AdminFaqItem[]>([{ question: "", answer: "" }]);

  const [seoTitle, setSeoTitle] = useState("");
  const [seoMetaDescription, setSeoMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");

  async function onSave() {
    setMsg(null);
    if (!title.trim()) return setMsg("Title required.");
    if (!html.trim()) return setMsg("HTML content required.");

    setSaving(true);
    try {
      const finalSlug = slug || slugify(title);
      const payload = {
        title,
        slug: finalSlug,
        excerpt,
        coverImage: coverImage?.url || undefined,
        coverAlt: coverImage?.alt || undefined,
        contentHtml: html,
        isPublished: status === "published",
        metaTitle: seoTitle || undefined,
        metaDescription: seoMetaDescription || undefined,
        metaKeywords: metaKeywords || undefined,
        faqItems: cleanFaqItems(faqItems),
        productSelections: productSelections.map((p, idx) => ({
          ...p,
          sortOrder: idx,
        })),
      };

      const res = await Fetch("/api/admin/blogs", {
        method: "POST",
        auth: true,
        data: payload,
      });

      if (res.status === 401) throw new Error("Unauthorized. Check admin token.");
      if (!res.ok) throw new Error(res.error || `Failed (${res.status})`);

      saveCache(finalSlug, {
        seoTitle,
        seoMetaDescription,
        metaKeywords,
        coverAlt: coverImage?.alt || "",
      });

      setMsg("Blog post created.");
      setTitle("");
      setSlug("");
      setStatus("draft");
    } catch (e: any) {
      setMsg(e?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white">
      <AdminTopbar title="Create Blog Post" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">New blog post</p>
            <p className="mt-1 text-xs text-neutral-500">This will appear on blog listing and single post page.</p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/blog"
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Cancel
            </Link>
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save post"}
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
                    value={title}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTitle(v);
                      if (!slug) setSlug(slugify(v));
                    }}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="How to Buy Luxury Watches in Pakistan"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Slug (optional)</label>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="buy-luxury-watches-pakistan"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
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
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  rows={3}
                />
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">HTML content</label>
                <RichEditor value={html} onChange={setHtml} />
              </div>
            </div>

            <BlogProductSelector value={productSelections} onChange={setProductSelections} />

            <FaqEditor
              value={faqItems}
              onChange={setFaqItems}
              title="Blog FAQs"
              hint="Add post-specific FAQs that can appear below the blog content."
            />
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <ImageUploader
              title="Cover image"
              hint="Upload a single cover image for the blog post."
              value={coverImage ? [coverImage] : []}
              onChange={(imgs) => setCoverImage(imgs[0] ?? null)}
              max={1}
              kind="blog"
            />

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">SEO meta</p>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">SEO title</label>
                <input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                />
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">SEO meta description</label>
                <textarea
                  value={seoMetaDescription}
                  onChange={(e) => setSeoMetaDescription(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  rows={3}
                />
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Meta keywords</label>
                <input
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
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
