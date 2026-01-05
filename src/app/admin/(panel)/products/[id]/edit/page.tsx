"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ImageUploader from "@/components/admin/common/ImageUploader";
import RichEditor from "@/components/admin/common/RichEditor";
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

function loadCache(slug: string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`adminProduct:${slug}`);
    if (!raw) return null;
    return JSON.parse(raw) as AdminProduct;
  } catch {
    return null;
  }
}

function saveCache(slug: string, product: AdminProduct) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`adminProduct:${slug}`, JSON.stringify(product));
  } catch {
    // ignore storage errors
  }
}

export default function AdminProductEditPage() {
  const params = useParams<{ id?: string }>();
  const id = params?.id ?? "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [p, setP] = useState<AdminProduct | null>(null);

  useEffect(() => {
    if (!id) {
      setMsg("Missing product slug.");
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setMsg(null);

      try {
        const res = await Fetch(`/api/admin/products?slug=${encodeURIComponent(id)}`, {
          auth: true,
          cache: "no-store",
        });
        if (res.status === 401) throw new Error("Unauthorized. Check admin token.");
        if (!res.ok) throw new Error(res.error || `Failed to load product (${res.status})`);
        const api = res.data as any;

        const cached = loadCache(api.slug ?? id);
        const images = Array.isArray(api.images) ? api.images : [];

        const defaults: AdminProduct = {
          id: String(api.id ?? ""),
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
          categoryId: "",
          subcategoryId: "",
          sizes: [],
          heroImage: undefined,
          gallery: [],
          variants: [],
          status: "draft",
          stock: 0,
          isFeatured: false,
          ratingAvg: 0,
          reviewsCount: 0,
        };

        const apiSizes = Array.isArray(api.sizes) ? api.sizes.filter((s: any) => typeof s === "string") : [];
        const apiVariants = Array.isArray(api.variants)
          ? api.variants.map((v: any, idx: number) => ({
              id: v?.id ? String(v.id) : `${cleanSlug(v?.label || "variant")}-${idx + 1}`,
              label: v?.label || `Variant ${idx + 1}`,
              colorCode: v?.colorCode || "#111827",
              images: Array.isArray(v?.images)
                ? v.images
                    .map((img: any) =>
                      typeof img === "string"
                        ? { url: img }
                        : { url: img?.url, alt: img?.alt }
                    )
                    .filter((img: any) => img.url)
                : [],
              isActive: true,
            }))
          : [];

        const apiFields: Partial<AdminProduct> = {
          id: String(api.id ?? ""),
          name: api.name ?? "",
          slug: api.slug ?? id,
          badge: api.badge ?? "",
          price: api.price != null ? String(api.price) : "",
          compareAt: api.compareAt != null ? String(api.compareAt) : "",
          shortDescription: api.shortDesc ?? "",
          seoDescriptionHtml: api.descriptionHtml ?? "",
          metaTitle: api.metaTitle ?? "",
          metaDescription: api.metaDescription ?? "",
          metaKeywords: api.metaKeywords ?? "",
          categoryId: api.categorySlug ?? "",
          subcategoryId: api.subcategorySlug ?? "",
          status: api.isActive ? "active" : "draft",
          isFeatured: Boolean(api.isFeatured),
          ratingAvg: api.rating ?? 0,
          reviewsCount: api.reviewsCount ?? 0,
          sizes: apiSizes,
          variants: apiVariants,
        };

        const imageFields =
          images.length > 0
            ? {
                heroImage: images[0]?.url ? { url: images[0].url, alt: images[0].alt ?? "" } : undefined,
                gallery: images.slice(1).map((img: any) => ({ url: img.url, alt: img.alt ?? "" })),
              }
            : {};

        const merged = cached
          ? { ...defaults, ...cached, ...apiFields, ...imageFields }
          : { ...defaults, ...apiFields, ...imageFields };
        setP(merged as AdminProduct);
      } catch (err: any) {
        setMsg(err?.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const previewHref = useMemo(() => (p?.slug ? `/product/${p.slug}` : "/"), [p?.slug]);

  const validate = () => {
    if (!p) return "Missing product.";
    if (!p.brand.trim()) return "Brand required";
    if (!p.name.trim()) return "Name required";
    if (!p.slug.trim()) return "Slug required";
    if (!p.price.trim()) return "Price required";
    if (!p.shortDescription.trim()) return "Short description required";
    if (!p.seoDescriptionHtml.trim()) return "Long description (HTML) required";
    if (!p.categoryId) return "Category required";
    if (!p.heroImage) return "Hero image required";
    for (const v of p.variants) {
      if (!v.label.trim()) return "Each variant needs a name";
      if (!v.colorCode.trim()) return "Each variant needs a color";
      if (!v.images.length) return `Variant "${v.label}" needs at least 1 image`;
    }
    return null;
  };

  async function onSave() {
    if (!p) return;
    setMsg(null);
    const err = validate();
    if (err) return setMsg(err);

    setSaving(true);
    try {
      const price = parseMoney(p.price);
      if (price === null) throw new Error("Price is invalid.");
      const compareAt = p.compareAt ? parseMoney(p.compareAt) : null;

      const payload = {
        categorySlug: p.categoryId,
        subcategorySlug: p.subcategoryId || null,
        name: p.name,
        slug: p.slug,
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
        indexable: true,
        sizes: p.sizes,
        variants: buildVariants(p),
        images: buildImages(p),
      };

      const res = await Fetch(`/api/admin/products?slug=${encodeURIComponent(id)}`, {
        method: "PUT",
        auth: true,
        data: payload,
      });

      if (res.status === 401) throw new Error("Unauthorized. Check admin token.");
      if (!res.ok) throw new Error(res.error || `Failed (${res.status})`);

      const savedSlug = (res.data as any)?.slug ?? p.slug;
      saveCache(savedSlug, p);
      setMsg("Product saved.");
    } catch (e: any) {
      setMsg(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white">
        <AdminTopbar title="Edit Product" />
        <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="bg-white">
        <AdminTopbar title="Edit Product" />
        <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
            {msg || "Failed to load product."}
          </div>
          <div className="mt-4">
            <Link
              href="/admin/products"
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <AdminTopbar title="Edit Product" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Edit product</p>
            <p className="mt-1 text-xs text-neutral-500">ID: {p.id}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/products"
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Back
            </Link>

            <Link
              href={previewHref}
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
              <p className="text-sm font-semibold">Basics</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Brand</label>
                  <input
                    value={p.brand}
                    onChange={(e) => setP((x) => (x ? { ...x, brand: e.target.value } : x))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Name</label>
                  <input
                    value={p.name}
                    onChange={(e) => setP((x) => (x ? { ...x, name: e.target.value } : x))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Slug</label>
                  <input
                    value={p.slug}
                    onChange={(e) => setP((x) => (x ? { ...x, slug: cleanSlug(e.target.value) } : x))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Badge (optional)</label>
                  <input
                    value={p.badge ?? ""}
                    onChange={(e) => setP((x) => (x ? { ...x, badge: e.target.value } : x))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Price</label>
                  <input
                    value={p.price}
                    onChange={(e) => setP((x) => (x ? { ...x, price: e.target.value } : x))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Compare at</label>
                  <input
                    value={p.compareAt ?? ""}
                    onChange={(e) => setP((x) => (x ? { ...x, compareAt: e.target.value } : x))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Currency</label>
                  <select
                    value={p.currency}
                    onChange={(e) => setP((x) => (x ? { ...x, currency: e.target.value as any } : x))}
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
                  onChange={(e) => setP((x) => (x ? { ...x, shortDescription: e.target.value } : x))}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  rows={3}
                />
              </div>
            </div>

            <VariantsEditor value={p.variants} onChange={(variants) => setP((x) => (x ? { ...x, variants } : x))} />

            <SizesPicker value={p.sizes} onChange={(sizes) => setP((x) => (x ? { ...x, sizes } : x))} />

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Long description (HTML)</p>
              <div className="mt-4">
                <RichEditor
                  value={p.seoDescriptionHtml}
                  onChange={(html) => setP((x) => (x ? { ...x, seoDescriptionHtml: html } : x))}
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
                    onChange={(e) => setP((x) => (x ? { ...x, metaTitle: e.target.value } : x))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Meta description</label>
                  <textarea
                    value={p.metaDescription ?? ""}
                    onChange={(e) => setP((x) => (x ? { ...x, metaDescription: e.target.value } : x))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Meta keywords</label>
                  <input
                    value={p.metaKeywords ?? ""}
                    onChange={(e) => setP((x) => (x ? { ...x, metaKeywords: e.target.value } : x))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <CategorySelector
              categoryId={p.categoryId}
              subcategoryId={p.subcategoryId}
              onChange={({ categoryId, subcategoryId }) => setP((x) => (x ? { ...x, categoryId, subcategoryId } : x))}
            />

            <ImageUploader
              title="Hero image (main)"
              hint="Upload 1 main image."
              value={p.heroImage ? [p.heroImage] : []}
              onChange={(imgs) => setP((x) => (x ? { ...x, heroImage: imgs[0] } : x))}
              max={1}
            />

            <ImageUploader
              title="Product gallery (optional)"
              hint="Extra images not tied to a variant."
              value={p.gallery}
              onChange={(gallery) => setP((x) => (x ? { ...x, gallery } : x))}
              max={12}
            />

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Status & stock</p>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Status</label>
                <select
                  value={p.status}
                  onChange={(e) => setP((x) => (x ? { ...x, status: e.target.value as any } : x))}
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
                  onChange={(e) => setP((x) => (x ? { ...x, stock: Math.max(0, Number(e.target.value) || 0) } : x))}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                />
              </div>

              <label className="mt-4 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={p.isFeatured}
                  onChange={(e) => setP((x) => (x ? { ...x, isFeatured: e.target.checked } : x))}
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
                      onChange={(e) => setP((x) => (x ? { ...x, ratingAvg: Number(e.target.value) || 0 } : x))}
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
                      onChange={(e) =>
                        setP((x) => (x ? { ...x, reviewsCount: Math.max(0, Number(e.target.value) || 0) } : x))
                      }
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
