// src/app/admin/(panel)/categories/create/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ImageUploader from "@/components/admin/common/ImageUploader";
import RichEditor from "@/components/admin/common/RichEditor";
import FaqEditor, { cleanFaqItems, type AdminFaqItem } from "@/components/admin/common/FaqEditor";
import { Fetch } from "@/lib/fetch";
import type { AdminImage } from "@/types/adminProduct";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategoryCreatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState(
    "<h2>Category details</h2><p>Add long description content here.</p>"
  );
  const [image, setImage] = useState<AdminImage | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [faqItems, setFaqItems] = useState<AdminFaqItem[]>([{ question: "", answer: "" }]);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSave() {
    setMsg(null);

    if (!name.trim()) return setMsg("Name is required.");
    if (!slug.trim()) return setMsg("Slug is required.");
    if (!descriptionHtml.trim()) return setMsg("Long description is required.");

    setSaving(true);
    try {
      const res = await Fetch("/api/admin/categories", {
        method: "POST",
        auth: true,
        data: {
          name,
          slug,
          description: description || undefined,
          descriptionHtml: descriptionHtml || undefined,
          image: image?.url || undefined,
          imageAlt: image?.alt || undefined,
          isFeatured,
          metaTitle: metaTitle || undefined,
          metaDescription: metaDescription || undefined,
          metaKeywords: metaKeywords || undefined,
          faqItems: cleanFaqItems(faqItems),
        },
      });

      if (!res.ok) {
        throw new Error(res.error || `Failed to save (${res.status})`);
      }

      setMsg("Saved successfully.");
      router.push("/admin/categories");
    } catch (e: any) {
      setMsg(e?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white">
      <AdminTopbar title="Create Category" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">New category</p>
            <p className="mt-1 text-xs text-neutral-500">
              Frontend route: <span className="text-neutral-700">/categories/[slug]</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/categories"
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Cancel
            </Link>
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save category"}
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
              <p className="text-sm font-semibold">Category basics</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Name</label>
                  <input
                    value={name}
                    onChange={(e) => {
                      const v = e.target.value;
                      setName(v);
                      if (!slug) setSlug(slugify(v));
                    }}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="Featured Products"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Slug</label>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="featured-products"
                  />
                  <p className="mt-2 text-xs text-neutral-500">
                    Preview: <span className="text-neutral-700">/categories/{slug || "..."}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  rows={4}
                  placeholder="Short description for this category"
                />
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3">
                <input
                  id="featured"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300"
                />
                <label htmlFor="featured" className="text-sm text-neutral-700">
                  Featured on home page
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Long description (HTML)</p>
              <p className="mt-1 text-xs text-neutral-500">Use this for SEO-rich content.</p>

              <div className="mt-4">
                <RichEditor value={descriptionHtml} onChange={setDescriptionHtml} />
              </div>
            </div>

            <FaqEditor
              value={faqItems}
              onChange={setFaqItems}
              title="Category FAQs"
              hint="These FAQs will be saved with this category for frontend SEO rendering."
            />
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <ImageUploader
              title="Image"
              hint="Upload a single category image."
              value={image ? [image] : []}
              onChange={(imgs) => setImage(imgs[0] ?? null)}
              max={1}
              kind="category"
            />

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">SEO</p>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Meta title</label>
                <input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  placeholder="Featured Products in Pakistan"
                />
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Meta description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  rows={3}
                  placeholder="Discover selected products with secure checkout and reliable delivery."
                />
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Meta keywords</label>
                <p className="mt-1 text-xs text-neutral-500">Comma separated keywords</p>
                <textarea
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  className="mt-3 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  rows={3}
                  placeholder="products, offers, online shopping"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
