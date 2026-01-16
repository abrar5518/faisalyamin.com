"use client";

import { useEffect, useMemo, useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ImageUploader from "@/components/admin/common/ImageUploader";
import RichEditor from "@/components/admin/common/RichEditor";
import { Fetch } from "@/lib/fetch";

const SHOP_SLUG = "shop";

type ShopForm = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  shortDescription: string;
  featureImage: string;
  featureImageAlt: string;
  contentHtml: string;
};

const EMPTY_FORM: ShopForm = {
  title: "Shop",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  shortDescription: "",
  featureImage: "",
  featureImageAlt: "",
  contentHtml: "",
};

const DEFAULT_PAYLOAD: ShopForm = {
  title: "Shop",
  metaTitle: "Shop",
  metaDescription:
    "Browse premium watches and accessories with secure checkout and fast delivery.",
  metaKeywords: "watches, accessories, luxury, shop",
  shortDescription: "Browse premium pieces. Use filters to find the perfect match.",
  featureImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  featureImageAlt: "Luxury watch showcase",
  contentHtml: `
    <h2>Shop the full collection</h2>
    <p>
      Use the filters above to narrow down your search by brand, price, and condition.
      Update this section from the backend with your own buying guide, FAQs, or warranty details.
    </p>
    <ul>
      <li>Verified products with detailed inspection notes</li>
      <li>Secure checkout and insured shipping</li>
      <li>Friendly support for pre and post-purchase questions</li>
    </ul>
  `,
};

export default function AdminShopPage() {
  const [form, setForm] = useState<ShopForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const payload = useMemo(() => ({ ...DEFAULT_PAYLOAD, ...form }), [form]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setMsg(null);
      const res = await Fetch(`/api/admin/pages?slug=${SHOP_SLUG}`, {
        auth: true,
        cache: "no-store",
      });

      if (!alive) return;

      if (res.ok && res.data) {
        const data: any = res.data;
        setForm({
          title: data.title ?? DEFAULT_PAYLOAD.title,
          metaTitle: data.metaTitle ?? DEFAULT_PAYLOAD.metaTitle,
          metaDescription: data.metaDescription ?? DEFAULT_PAYLOAD.metaDescription,
          metaKeywords: data.metaKeywords ?? DEFAULT_PAYLOAD.metaKeywords,
          shortDescription: data.shortDescription ?? DEFAULT_PAYLOAD.shortDescription,
          featureImage: data.featureImage ?? DEFAULT_PAYLOAD.featureImage,
          featureImageAlt: data.featureImageAlt ?? DEFAULT_PAYLOAD.featureImageAlt,
          contentHtml: data.contentHtml ?? DEFAULT_PAYLOAD.contentHtml,
        });
        setLoading(false);
        return;
      }

      if (res.status === 404) {
        const createRes = await Fetch("/api/admin/pages", {
          method: "POST",
          auth: true,
          data: { ...DEFAULT_PAYLOAD, slug: SHOP_SLUG },
        });
        if (createRes.ok && createRes.data) {
          setForm({
            title: DEFAULT_PAYLOAD.title,
            metaTitle: DEFAULT_PAYLOAD.metaTitle,
            metaDescription: DEFAULT_PAYLOAD.metaDescription,
            metaKeywords: DEFAULT_PAYLOAD.metaKeywords,
            shortDescription: DEFAULT_PAYLOAD.shortDescription,
            featureImage: DEFAULT_PAYLOAD.featureImage,
            featureImageAlt: DEFAULT_PAYLOAD.featureImageAlt,
            contentHtml: DEFAULT_PAYLOAD.contentHtml,
          });
          setLoading(false);
          return;
        }
      }

      setMsg(res.error || "Failed to load Shop page.");
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onSave = async () => {
    setSaving(true);
    setMsg(null);
    const res = await Fetch(`/api/admin/pages?slug=${SHOP_SLUG}`, {
      method: "PUT",
      auth: true,
      data: {
        title: payload.title,
        contentHtml: payload.contentHtml,
        metaTitle: payload.metaTitle,
        metaDescription: payload.metaDescription,
        metaKeywords: payload.metaKeywords,
        shortDescription: payload.shortDescription,
        featureImage: payload.featureImage,
        featureImageAlt: payload.featureImageAlt,
      },
    });
    if (!res.ok) {
      setMsg(res.error || "Failed to save Shop page.");
      setSaving(false);
      return;
    }
    setMsg("Shop page updated.");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-white">
        <AdminTopbar title="Shop" />
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12 py-10">
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <AdminTopbar title="Shop" />

      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Shop settings</p>
            <p className="mt-1 text-xs text-neutral-500">Slug: {SHOP_SLUG}</p>
          </div>
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-2xl bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        {msg ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            {msg}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Basics</p>
              <div className="mt-5 grid gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((x) => ({ ...x, title: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Short description</label>
                  <textarea
                    value={form.shortDescription}
                    onChange={(e) => setForm((x) => ({ ...x, shortDescription: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">SEO metadata</p>
              <div className="mt-5 grid gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Meta title</label>
                  <input
                    value={form.metaTitle}
                    onChange={(e) => setForm((x) => ({ ...x, metaTitle: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Meta description</label>
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) => setForm((x) => ({ ...x, metaDescription: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Meta keywords</label>
                  <input
                    value={form.metaKeywords}
                    onChange={(e) => setForm((x) => ({ ...x, metaKeywords: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Image</p>
              <div className="mt-5">
                <ImageUploader
                  title="Feature image"
                  hint="Used for the Shop header and SEO cards."
                  value={form.featureImage ? [{ url: form.featureImage, alt: form.featureImageAlt }] : []}
                  onChange={(imgs) =>
                    setForm((x) => ({
                      ...x,
                      featureImage: imgs[0]?.url || "",
                      featureImageAlt: imgs[0]?.alt || "",
                    }))
                  }
                  max={1}
                  kind="product"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Long description</p>
              <div className="mt-3">
                <RichEditor
                  value={form.contentHtml}
                  onChange={(html) => setForm((x) => ({ ...x, contentHtml: html }))}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
