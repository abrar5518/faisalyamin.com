"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ImageUploader from "@/components/admin/common/ImageUploader";
import RichEditor from "@/components/admin/common/RichEditor";
import FaqEditor, { cleanFaqItems } from "@/components/admin/common/FaqEditor";
import CategorySelector from "@/components/admin/products/CategorySelector";
import SizesPicker from "@/components/admin/products/SizesPicker";
import VariantsEditor from "@/components/admin/products/VariantEditor";
import type { AdminProduct } from "@/types/adminProduct";
import { Fetch } from "@/lib/fetch";

function cleanSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseMoney(input: string) {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function buildImages(p: AdminProduct) {
  const images: { url: string; alt?: string; sortOrder: number }[] = [];
  let sortOrder = 0;

  if (p.heroImage?.url) {
    images.push({ url: p.heroImage.url, alt: p.heroImage.alt, sortOrder: sortOrder++ });
  }

  for (const img of p.gallery) {
    if (img.url) images.push({ url: img.url, alt: img.alt, sortOrder: sortOrder++ });
  }

  for (const variant of p.variants) {
    for (const img of variant.images) {
      if (img.url) images.push({ url: img.url, alt: img.alt, sortOrder: sortOrder++ });
    }
  }

  return images;
}

function buildVariants(p: AdminProduct) {
  return p.variants.map((v, idx) => ({
    id: v.id || `${cleanSlug(v.label || "variant")}-${idx + 1}`,
    label: v.label,
    colorCode: v.colorCode,
    images: v.images
      .map((img) => ({
        url: img.url,
        alt: img.alt,
      }))
      .filter((img) => img.url),
  }));
}

function saveCache(slug: string, product: AdminProduct) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`adminProduct:${slug}`, JSON.stringify(product));
  } catch {
    // ignore storage errors
  }
}

export default function AdminProductCreatePage() {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [p, setP] = useState<AdminProduct>({
    brand: "",
    name: "",
    slug: "",
    badge: "",
    price: "",
    compareAt: "",
    currency: "PKR",
    shortDescription: "",
    seoDescriptionHtml: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    faqItems: [{ question: "", answer: "" }],
    categoryId: "",
    subcategoryId: "",
    categoryIds: [],
    subcategoryIds: [],
    sizes: [],
    heroImage: undefined,
    gallery: [],
    variants: [],
    status: "draft",
    stock: 0,
    isFeatured: false,
    ratingAvg: 0,
    reviewsCount: 0,
  });

  const previewOk = useMemo(() => p.slug?.trim()?.length > 0, [p.slug]);

  const validate = () => {
    if (!p.brand.trim()) return "Brand required";
    if (!p.name.trim()) return "Name required";
    if (!p.slug.trim()) return "Slug required";
    if (!p.price.trim()) return "Price required";
    if (!p.shortDescription.trim()) return "Short description required";
    if (!p.seoDescriptionHtml.trim()) return "Long description (HTML) required";
    if (!(p.categoryIds?.length || p.categoryId)) return "Category required";
    if (!p.heroImage) return "Hero image required";
    for (const v of p.variants) {
      if (!v.label.trim()) return "Each variant needs a name";
      if (!v.colorCode.trim()) return "Each variant needs a color";
      if (!v.images.length) return `Variant "${v.label}" needs at least 1 image`;
    }
    return null;
  };

  async function onSave() {
    setMsg(null);
    const err = validate();
    if (err) return setMsg(err);

    setSaving(true);
    try {
      const price = parseMoney(p.price);
      if (price === null) throw new Error("Price is invalid.");
      const compareAt = p.compareAt ? parseMoney(p.compareAt) : null;

      const payload = {
        categorySlug: p.categoryIds?.[0] || p.categoryId,
        subcategorySlug: p.subcategoryIds?.[0] || p.subcategoryId || undefined,
        categorySlugs: p.categoryIds?.length ? p.categoryIds : p.categoryId ? [p.categoryId] : [],
        subcategorySlugs: p.subcategoryIds?.length ? p.subcategoryIds : p.subcategoryId ? [p.subcategoryId] : [],
        name: p.name,
        slug: p.slug,
        brand: p.brand.trim(),
        price,
        compareAt: compareAt ?? undefined,
        badge: p.badge || undefined,
        rating: p.ratingAvg ?? undefined,
        reviewsCount: p.reviewsCount ?? undefined,
        shortDesc: p.shortDescription || undefined,
        descriptionHtml: p.seoDescriptionHtml,
        isActive: p.status === "active",
        isFeatured: p.isFeatured,
        metaTitle: p.metaTitle || undefined,
        metaDescription: p.metaDescription || undefined,
        metaKeywords: p.metaKeywords || undefined,
        faqItems: cleanFaqItems(p.faqItems ?? []),
        indexable: true,
        sizes: p.sizes,
        variants: buildVariants(p),
        images: buildImages(p),
      };

      const res = await Fetch("/api/admin/products", {
        method: "POST",
        auth: true,
        data: payload,
      });

      if (res.status === 401) throw new Error("Unauthorized. Check admin token.");
      if (!res.ok) throw new Error(res.error || `Failed (${res.status})`);

      const saved = res.data as any;
      saveCache(saved.slug ?? p.slug, { ...p, id: String(saved.id ?? "") });
      setMsg("Product created.");
    } catch (e: any) {
      setMsg(e?.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white">
      <AdminTopbar title="Create Product" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">New product</p>
            <p className="mt-1 text-xs text-neutral-500">Images upload + variants + sizes + SEO metadata.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/products"
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Back
            </Link>

            {previewOk ? (
              <Link
                href={`/product/${p.slug}`}
                className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
              >
                Preview
              </Link>
            ) : null}

            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Create product"}
            </button>
          </div>
        </div>

        {msg ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            {msg}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Basics</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Brand</label>
                  <input
                    value={p.brand}
                    onChange={(e) => setP((x) => ({ ...x, brand: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="Rolex"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Name</label>
                  <input
                    value={p.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setP((x) => ({ ...x, name, slug: x.slug ? x.slug : cleanSlug(name) }));
                    }}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="Rolex Datejust 41 Oystersteel"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Slug</label>
                  <input
                    value={p.slug}
                    onChange={(e) => setP((x) => ({ ...x, slug: cleanSlug(e.target.value) }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="rolex-datejust-41"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Badge (optional)</label>
                  <input
                    value={p.badge ?? ""}
                    onChange={(e) => setP((x) => ({ ...x, badge: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="Hot / New / -12%"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Price</label>
                  <input
                    value={p.price}
                    onChange={(e) => setP((x) => ({ ...x, price: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="PKR 410,000"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Compare at (optional)</label>
                  <input
                    value={p.compareAt ?? ""}
                    onChange={(e) => setP((x) => ({ ...x, compareAt: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="PKR 450,000"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Currency</label>
                  <select
                    value={p.currency}
                    onChange={(e) => setP((x) => ({ ...x, currency: e.target.value as any }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  >
                    <option value="PKR">PKR</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Short description</label>
                <textarea
                  value={p.shortDescription}
                  onChange={(e) => setP((x) => ({ ...x, shortDescription: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  rows={3}
                />
              </div>
            </div>

            <VariantsEditor value={p.variants} onChange={(variants) => setP((x) => ({ ...x, variants }))} />

            <SizesPicker value={p.sizes} onChange={(sizes) => setP((x) => ({ ...x, sizes }))} />

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Long description (HTML from editor)</p>
              <div className="mt-4">
                <RichEditor
                  value={p.seoDescriptionHtml}
                  onChange={(html) => setP((x) => ({ ...x, seoDescriptionHtml: html }))}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">SEO metadata</p>

              <div className="mt-5 grid gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Meta title</label>
                  <input
                    value={p.metaTitle ?? ""}
                    onChange={(e) => setP((x) => ({ ...x, metaTitle: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Meta description</label>
                  <textarea
                    value={p.metaDescription ?? ""}
                    onChange={(e) => setP((x) => ({ ...x, metaDescription: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Meta keywords</label>
                  <input
                    value={p.metaKeywords ?? ""}
                    onChange={(e) => setP((x) => ({ ...x, metaKeywords: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="rolex,datejust,watch,pakistan,luxury watches"
                  />
                </div>
              </div>
            </div>

            <FaqEditor
              value={p.faqItems ?? [{ question: "", answer: "" }]}
              onChange={(faqItems) => setP((x) => ({ ...x, faqItems }))}
              title="Product FAQs"
              hint="Add product-specific questions for SEO and customer support."
            />
          </div>

          {/* RIGHT */}
          <aside className="lg:col-span-4 space-y-6">
            <CategorySelector
              categoryIds={p.categoryIds?.length ? p.categoryIds : p.categoryId ? [p.categoryId] : []}
              subcategoryIds={p.subcategoryIds?.length ? p.subcategoryIds : p.subcategoryId ? [p.subcategoryId] : []}
              onChange={({ categoryIds, subcategoryIds }) =>
                setP((x) => ({
                  ...x,
                  categoryIds,
                  subcategoryIds,
                  categoryId: categoryIds[0] ?? "",
                  subcategoryId: subcategoryIds[0] ?? "",
                }))
              }
            />

            <ImageUploader
              title="Hero image (main)"
              hint="Upload 1 main image used as category listing preview and product header."
              value={p.heroImage ? [p.heroImage] : []}
              onChange={(imgs) => setP((x) => ({ ...x, heroImage: imgs[0] }))}
              max={1}
            />

            <ImageUploader
              title="Product gallery (optional)"
              hint="Extra images not tied to a variant. Optional."
              value={p.gallery}
              onChange={(gallery) => setP((x) => ({ ...x, gallery }))}
              max={12}
            />

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Status & stock</p>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Status</label>
                <select
                  value={p.status}
                  onChange={(e) => setP((x) => ({ ...x, status: e.target.value as any }))}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Stock</label>
                <input
                  value={String(p.stock)}
                  onChange={(e) => setP((x) => ({ ...x, stock: Math.max(0, Number(e.target.value) || 0) }))}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                />
              </div>

              <label className="mt-4 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={p.isFeatured}
                  onChange={(e) => setP((x) => ({ ...x, isFeatured: e.target.checked }))}
                  className="h-4 w-4"
                />
                <span className="text-neutral-700">Featured product</span>
              </label>

              <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold text-neutral-700">Rating & reviews</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-neutral-700">Rating (0-5)</label>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      step="0.1"
                      value={Number.isFinite(Number(p.ratingAvg)) ? String(p.ratingAvg) : "0"}
                      onChange={(e) => setP((x) => ({ ...x, ratingAvg: Number(e.target.value) || 0 }))}
                      className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700">Reviews count</label>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={String(p.reviewsCount ?? 0)}
                      onChange={(e) => setP((x) => ({ ...x, reviewsCount: Math.max(0, Number(e.target.value) || 0) }))}
                      className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
