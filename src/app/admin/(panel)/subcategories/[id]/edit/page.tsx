// src/app/admin/(panel)/subcategories/[id]/edit/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ImageUploader from "@/components/admin/common/ImageUploader";
import RichEditor from "@/components/admin/common/RichEditor";
import FaqEditor, { cleanFaqItems, type AdminFaqItem } from "@/components/admin/common/FaqEditor";
import { Fetch } from "@/lib/fetch";
import type { AdminImage } from "@/types/adminProduct";

type CategoryOption = { slug: string; name: string };

type AdminSubcategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  descriptionHtml?: string | null;
  image?: string | null;
  imageAlt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  category?: { slug: string; name: string } | null;
  faqItems?: Array<{ question?: string | null; answer?: string | null }>;
  updatedAt?: string | null;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminSubcategoryEditPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [categorySlug, setCategorySlug] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [descriptionHtml, setDescriptionHtml] = useState<string>("");
  const [image, setImage] = useState<AdminImage | null>(null);
  const [metaTitle, setMetaTitle] = useState<string>("");
  const [metaDescription, setMetaDescription] = useState<string>("");
  const [metaKeywords, setMetaKeywords] = useState<string>("");
  const [faqItems, setFaqItems] = useState<AdminFaqItem[]>([{ question: "", answer: "" }]);
  const [initialSlug, setInitialSlug] = useState<string>("");

  const previewUrl = useMemo(() => {
    const c = categorySlug || "category";
    const s = slug || "sub";
    return `/categories/${c}/${s}`;
  }, [categorySlug, slug]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await Fetch("/api/admin/categories", { auth: true, cache: "no-store" });
        if (!res.ok) throw new Error(res.error || `Failed to load categories (${res.status})`);
        const items = (res.data ?? []).map((c: any) => ({ slug: c.slug, name: c.name }));
        if (!cancelled) setCategoryOptions(items);
      } catch (e: any) {
        if (!cancelled) setMsg(e?.message || "Failed to load categories.");
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setMsg(null);

    const run = async () => {
      try {
        const res = await Fetch(`/api/admin/subcategories?slug=${encodeURIComponent(id)}`, {
          auth: true,
          cache: "no-store",
        });

        if (res.status === 401) throw new Error("Unauthorized. Check admin token.");
        if (!res.ok) throw new Error(res.error || `Failed to load subcategory (${res.status})`);
        const data: AdminSubcategory = res.data as AdminSubcategory;

        setCategorySlug(data.category?.slug ?? "");
        setName(data.name ?? "");
        setSlug(data.slug ?? "");
        setInitialSlug(data.slug ?? "");
        setDescription(data.description ?? "");
        setDescriptionHtml(
          data.descriptionHtml ?? "<h2>Subcategory details</h2><p>Add long description content here.</p>"
        );
        setImage(data.image ? { url: data.image, alt: data.imageAlt ?? "" } : null);
        setMetaTitle(data.metaTitle ?? "");
        setMetaDescription(data.metaDescription ?? "");
        setMetaKeywords(data.metaKeywords ?? "");
        setFaqItems(
          data.faqItems?.length
            ? data.faqItems.map((item) => ({
                question: item.question ?? "",
                answer: item.answer ?? "",
              }))
            : [{ question: "", answer: "" }]
        );

        setLoading(false);
      } catch (e: any) {
        setMsg(e?.message || "Failed to load subcategory.");
        setLoading(false);
      }
    };

    run();
  }, [id]);

  async function onSave() {
    setMsg(null);

    if (!categorySlug?.trim()) return setMsg("Parent category is required.");
    if (!name.trim()) return setMsg("Name is required.");
    if (!slug.trim()) return setMsg("Slug is required.");
    if (!descriptionHtml.trim()) return setMsg("Long description is required.");

    const slugToUpdate = initialSlug || id;
    if (!slugToUpdate) return setMsg("Missing subcategory slug.");

    setSaving(true);
    try {
      const res = await Fetch(`/api/admin/subcategories?slug=${encodeURIComponent(slugToUpdate)}`, {
        method: "PUT",
        auth: true,
        data: {
          categorySlug,
          name,
          slug,
          description: description || undefined,
          descriptionHtml: descriptionHtml || undefined,
          image: image?.url || undefined,
          imageAlt: image?.alt || undefined,
          metaTitle: metaTitle || undefined,
          metaDescription: metaDescription || undefined,
          metaKeywords: metaKeywords || undefined,
          faqItems: cleanFaqItems(faqItems),
        },
      });

      if (res.status === 401) throw new Error("Unauthorized. Check admin token.");
      if (!res.ok) throw new Error(res.error || `Failed to save (${res.status})`);

      setMsg("Saved successfully.");
      if (initialSlug && initialSlug !== slug) {
        router.replace(`/admin/subcategories/${slug}/edit`);
      }
    } catch (e: any) {
      setMsg(e?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white">
        <AdminTopbar title="Edit Subcategory" />
        <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
            Loading subcategory...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <AdminTopbar title="Edit Subcategory" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Subcategory details</p>
            <p className="mt-1 text-xs text-neutral-500">
              Frontend route: <span className="text-neutral-700">/categories/[slug]/[sub]</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/subcategories"
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Back
            </Link>
            <Link
              href={previewUrl}
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Preview
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
              <p className="text-sm font-semibold">Subcategory basics</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Parent category</label>
                  <select
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name} ({c.slug})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Slug</label>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="new-arrivals"
                  />
                  <p className="mt-2 text-xs text-neutral-500">
                    Preview: <span className="text-neutral-700">{previewUrl}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Name</label>
                <input
                  value={name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setName(v);
                    if (!slug) setSlug(slugify(v));
                  }}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  placeholder="New Arrivals"
                />
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  rows={3}
                  placeholder="Short description shown in listings"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Long description (HTML)</p>
              <p className="mt-1 text-xs text-neutral-500">
                Same as category page: this renders in the SEO section under products.
              </p>

              <div className="mt-4">
                <RichEditor value={descriptionHtml} onChange={setDescriptionHtml} />
              </div>
            </div>

            <FaqEditor
              value={faqItems}
              onChange={setFaqItems}
              title="Subcategory FAQs"
              hint="These FAQs will be saved with this subcategory for frontend SEO rendering."
            />
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <ImageUploader
              title="Image"
              hint="Upload a single subcategory image."
              value={image ? [image] : []}
              onChange={(imgs) => setImage(imgs[0] ?? null)}
              max={1}
              kind="subcategory"
            />

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">SEO</p>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Meta title</label>
                <input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  placeholder="New Arrivals in Pakistan"
                />
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Meta description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  rows={3}
                  placeholder="Explore selected products with clear details..."
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
                  placeholder="products, category, online shopping"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
