"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ImageUploader from "@/components/admin/common/ImageUploader";
import RichEditor from "@/components/admin/common/RichEditor";
import { Fetch } from "@/lib/fetch";

type PageForm = {
  title: string;
  slug: string;
  contentHtml: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  shortDescription: string;
  featureImage: string;
  featureImageAlt: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  heroImage: string;
  heroImageAlt: string;
  heroCardTitle: string;
  heroCardSubtitle: string;
  heroCardPrimaryLabel: string;
  heroCardPrimaryHref: string;
  heroCardSecondaryLabel: string;
  heroCardSecondaryHref: string;
  heroHighlight1Title: string;
  heroHighlight1Desc: string;
  heroHighlight2Title: string;
  heroHighlight2Desc: string;
  heroHighlight3Title: string;
  heroHighlight3Desc: string;
};

const EMPTY_FORM: PageForm = {
  title: "",
  slug: "",
  contentHtml: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  shortDescription: "",
  featureImage: "",
  featureImageAlt: "",
  heroBadge: "",
  heroTitle: "",
  heroSubtitle: "",
  heroPrimaryLabel: "",
  heroPrimaryHref: "",
  heroSecondaryLabel: "",
  heroSecondaryHref: "",
  heroImage: "",
  heroImageAlt: "",
  heroCardTitle: "",
  heroCardSubtitle: "",
  heroCardPrimaryLabel: "",
  heroCardPrimaryHref: "",
  heroCardSecondaryLabel: "",
  heroCardSecondaryHref: "",
  heroHighlight1Title: "",
  heroHighlight1Desc: "",
  heroHighlight2Title: "",
  heroHighlight2Desc: "",
  heroHighlight3Title: "",
  heroHighlight3Desc: "",
};

export default function AdminPageEdit() {
  const params = useParams<{ slug?: string | string[] }>();
  const slugParam = Array.isArray(params?.slug) ? params?.slug[0] : params?.slug;
  const slug = slugParam ?? "";

  const [form, setForm] = useState<PageForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const originalSlug = useMemo(() => slug, [slug]);

  useEffect(() => {
    if (!slug) {
      setMsg("Missing page slug.");
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setMsg(null);
      const res = await Fetch(`/api/admin/pages?slug=${encodeURIComponent(slug)}`, {
        auth: true,
        cache: "no-store",
      });
      if (!res.ok || !res.data) {
        setMsg(res.error || "Failed to load page.");
        setLoading(false);
        return;
      }
      const data: any = res.data;
      setForm({
        title: data.title ?? "",
        slug: data.slug ?? slug,
        contentHtml: data.contentHtml ?? "",
        metaTitle: data.metaTitle ?? "",
        metaDescription: data.metaDescription ?? "",
        metaKeywords: data.metaKeywords ?? "",
        shortDescription: data.shortDescription ?? "",
        featureImage: data.featureImage ?? "",
        featureImageAlt: data.featureImageAlt ?? "",
        heroBadge: data.heroBadge ?? "",
        heroTitle: data.heroTitle ?? "",
        heroSubtitle: data.heroSubtitle ?? "",
        heroPrimaryLabel: data.heroPrimaryLabel ?? "",
        heroPrimaryHref: data.heroPrimaryHref ?? "",
        heroSecondaryLabel: data.heroSecondaryLabel ?? "",
        heroSecondaryHref: data.heroSecondaryHref ?? "",
        heroImage: data.heroImage ?? "",
        heroImageAlt: data.heroImageAlt ?? "",
        heroCardTitle: data.heroCardTitle ?? "",
        heroCardSubtitle: data.heroCardSubtitle ?? "",
        heroCardPrimaryLabel: data.heroCardPrimaryLabel ?? "",
        heroCardPrimaryHref: data.heroCardPrimaryHref ?? "",
        heroCardSecondaryLabel: data.heroCardSecondaryLabel ?? "",
        heroCardSecondaryHref: data.heroCardSecondaryHref ?? "",
        heroHighlight1Title: data.heroHighlight1Title ?? "",
        heroHighlight1Desc: data.heroHighlight1Desc ?? "",
        heroHighlight2Title: data.heroHighlight2Title ?? "",
        heroHighlight2Desc: data.heroHighlight2Desc ?? "",
        heroHighlight3Title: data.heroHighlight3Title ?? "",
        heroHighlight3Desc: data.heroHighlight3Desc ?? "",
      });
      setLoading(false);
    })();
  }, [slug]);

  const onSave = async () => {
    if (!originalSlug) return;
    setSaving(true);
    setMsg(null);
    const res = await Fetch(`/api/admin/pages?slug=${encodeURIComponent(originalSlug)}`, {
      method: "PUT",
      auth: true,
      data: form,
    });
    if (!res.ok) {
      setMsg(res.error || "Failed to save page.");
    } else {
      setMsg("Page updated.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-white">
        <AdminTopbar title="Edit Page" />
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
      <AdminTopbar title="Edit Page" />

      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Edit page</p>
            <p className="mt-1 text-xs text-neutral-500">Slug: {form.slug || "-"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/pages"
              className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50"
            >
              Back
            </Link>
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-2xl bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
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

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Basics</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((x) => ({ ...x, title: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((x) => ({ ...x, slug: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
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

            {form.slug !== "deals" ? (
              <>
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold">Hero (left column)</p>
                  <div className="mt-5 grid gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-700">Badge text</label>
                      <input
                        value={form.heroBadge}
                        onChange={(e) => setForm((x) => ({ ...x, heroBadge: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700">Headline</label>
                      <textarea
                        value={form.heroTitle}
                        onChange={(e) => setForm((x) => ({ ...x, heroTitle: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700">Subtitle</label>
                      <textarea
                        value={form.heroSubtitle}
                        onChange={(e) => setForm((x) => ({ ...x, heroSubtitle: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Primary button label</label>
                        <input
                          value={form.heroPrimaryLabel}
                          onChange={(e) => setForm((x) => ({ ...x, heroPrimaryLabel: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Primary button link</label>
                        <input
                          value={form.heroPrimaryHref}
                          onChange={(e) => setForm((x) => ({ ...x, heroPrimaryHref: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Secondary button label</label>
                        <input
                          value={form.heroSecondaryLabel}
                          onChange={(e) => setForm((x) => ({ ...x, heroSecondaryLabel: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Secondary button link</label>
                        <input
                          value={form.heroSecondaryHref}
                          onChange={(e) => setForm((x) => ({ ...x, heroSecondaryHref: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold">Hero highlights (3 cards)</p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-neutral-700">Highlight 1 title</label>
                      <input
                        value={form.heroHighlight1Title}
                        onChange={(e) => setForm((x) => ({ ...x, heroHighlight1Title: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700">Highlight 1 description</label>
                      <input
                        value={form.heroHighlight1Desc}
                        onChange={(e) => setForm((x) => ({ ...x, heroHighlight1Desc: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700">Highlight 2 title</label>
                      <input
                        value={form.heroHighlight2Title}
                        onChange={(e) => setForm((x) => ({ ...x, heroHighlight2Title: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700">Highlight 2 description</label>
                      <input
                        value={form.heroHighlight2Desc}
                        onChange={(e) => setForm((x) => ({ ...x, heroHighlight2Desc: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700">Highlight 3 title</label>
                      <input
                        value={form.heroHighlight3Title}
                        onChange={(e) => setForm((x) => ({ ...x, heroHighlight3Title: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700">Highlight 3 description</label>
                      <input
                        value={form.heroHighlight3Desc}
                        onChange={(e) => setForm((x) => ({ ...x, heroHighlight3Desc: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold">Deals summary</p>
                  <div className="mt-5 grid gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-700">Short description</label>
                      <textarea
                        value={form.shortDescription}
                        onChange={(e) => setForm((x) => ({ ...x, shortDescription: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        rows={3}
                      />
                    </div>
                    <div>
                      <ImageUploader
                        title="Feature image"
                        hint="Upload a single image for the deals hero."
                        value={
                          form.featureImage
                            ? [{ url: form.featureImage, alt: form.featureImageAlt }]
                            : []
                        }
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
              </>
            )}
          </div>

          <aside className="lg:col-span-5 space-y-6">
            {form.slug !== "deals" ? (
              <>
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold">Hero (right card)</p>
                  <div className="mt-5 grid gap-4">
                    <div>
                      <ImageUploader
                        title="Hero image"
                        hint="Upload a single image for the right-side hero card."
                        value={form.heroImage ? [{ url: form.heroImage, alt: form.heroImageAlt }] : []}
                        onChange={(imgs) =>
                          setForm((x) => ({
                            ...x,
                            heroImage: imgs[0]?.url || "",
                            heroImageAlt: imgs[0]?.alt || "",
                          }))
                        }
                        max={1}
                        kind="product"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700">Card title</label>
                      <input
                        value={form.heroCardTitle}
                        onChange={(e) => setForm((x) => ({ ...x, heroCardTitle: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700">Card subtitle</label>
                      <textarea
                        value={form.heroCardSubtitle}
                        onChange={(e) => setForm((x) => ({ ...x, heroCardSubtitle: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Card primary label</label>
                        <input
                          value={form.heroCardPrimaryLabel}
                          onChange={(e) => setForm((x) => ({ ...x, heroCardPrimaryLabel: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Card primary link</label>
                        <input
                          value={form.heroCardPrimaryHref}
                          onChange={(e) => setForm((x) => ({ ...x, heroCardPrimaryHref: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Card secondary label</label>
                        <input
                          value={form.heroCardSecondaryLabel}
                          onChange={(e) => setForm((x) => ({ ...x, heroCardSecondaryLabel: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700">Card secondary link</label>
                        <input
                          value={form.heroCardSecondaryHref}
                          onChange={(e) => setForm((x) => ({ ...x, heroCardSecondaryHref: e.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold">Page content (optional)</p>
                  <div className="mt-3">
                    <RichEditor
                      value={form.contentHtml}
                      onChange={(html) => setForm((x) => ({ ...x, contentHtml: html }))}
                    />
                  </div>
                </div>
              </>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
