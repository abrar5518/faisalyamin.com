"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ImageUploader from "@/components/admin/common/ImageUploader";
import RichEditor from "@/components/admin/common/RichEditor";
import { AdminCard, AdminPageHeader } from "@/components/admin/ui";
import { Fetch } from "@/lib/fetch";
import type { AdminImage } from "@/types/adminProduct";

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
};

const PAGE_FAQ_TEMPLATE =
  '<h3>Frequently Asked Questions</h3><p><strong>Question:</strong> Add the customer question here.</p><p><strong>Answer:</strong> Add a clear, helpful answer here.</p>';

function imageToUploaderValue(form: PageForm): AdminImage[] {
  return form.featureImage ? [{ url: form.featureImage, alt: form.featureImageAlt }] : [];
}

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
    let active = true;

    async function loadPage() {
      if (!slug) {
        setMsg("Missing page slug.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setMsg(null);
      const res = await Fetch(`/api/admin/pages?slug=${encodeURIComponent(slug)}`, {
        auth: true,
        cache: "no-store",
      });

      if (!active) return;

      if (!res.ok || !res.data) {
        setMsg(res.error || "Failed to load page.");
        setLoading(false);
        return;
      }

      const data = res.data as Partial<PageForm>;
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
      });
      setLoading(false);
    }

    loadPage();
    return () => {
      active = false;
    };
  }, [slug]);

  async function onSave() {
    if (!originalSlug) return;
    if (!form.title.trim() || !form.slug.trim()) {
      setMsg("Title and slug are required.");
      return;
    }

    setSaving(true);
    setMsg(null);

    const res = await Fetch(`/api/admin/pages?slug=${encodeURIComponent(originalSlug)}`, {
      method: "PUT",
      auth: true,
      data: {
        title: form.title.trim(),
        slug: form.slug.trim(),
        contentHtml: form.contentHtml,
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
        metaKeywords: form.metaKeywords.trim(),
        shortDescription: form.shortDescription.trim(),
        featureImage: form.featureImage.trim(),
        featureImageAlt: form.featureImageAlt.trim(),
        heroTitle: form.title.trim(),
        heroSubtitle: form.shortDescription.trim(),
        heroImage: form.featureImage.trim(),
        heroImageAlt: form.featureImageAlt.trim(),
      },
    });

    if (!res.ok) {
      setMsg(res.error || "Failed to save page.");
      setSaving(false);
      return;
    }

    setMsg("Page updated.");
    setSaving(false);
  }

  function insertFaqTemplate() {
    setForm((current) => {
      if (current.contentHtml.toLowerCase().includes("frequently asked questions")) {
        return current;
      }

      const separator = current.contentHtml.trim() ? "<hr />" : "";
      return {
        ...current,
        contentHtml: `${current.contentHtml}${separator}${PAGE_FAQ_TEMPLATE}`,
      };
    });
  }

  if (loading) {
    return (
      <div className="bg-white">
        <AdminTopbar title="Edit Page" />
        <div className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8 lg:px-12">
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminTopbar title="Edit Page" />

      <div className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8 lg:px-12">
        <AdminPageHeader
          eyebrow="Page editor"
          title={form.title || "Edit page"}
          description="Use the same clean pattern for every storefront page: basics, long description, FAQs, media, and SEO."
          actions={
            <>
            <Link
              href="/admin/pages"
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
            >
              Back
            </Link>
              <Link
                href={form.slug === "home" ? "/" : `/${form.slug}`}
                target="_blank"
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
              >
                View
              </Link>
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-2xl bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            </>
          }
        />

        {msg ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
            {msg}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <AdminCard
              title="Basics"
              description="This controls the page identity, public heading, short intro, and routing."
              contentClassName="p-6"
            >
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
              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Short description</label>
                <textarea
                  value={form.shortDescription}
                  onChange={(e) => setForm((x) => ({ ...x, shortDescription: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                />
              </div>
            </AdminCard>

            <AdminCard
              title="Long description / page content"
              description="Add the main freestyle content here. Keep headings, policy text, and supporting copy in this editor."
              contentClassName="p-6"
            >
              <div className="mt-5">
                <RichEditor
                  value={form.contentHtml}
                  onChange={(contentHtml) => setForm((x) => ({ ...x, contentHtml }))}
                  minHeight={420}
                />
              </div>
            </AdminCard>

            <AdminCard
              title="FAQs"
              description="Keep customer questions in the same location for all pages. Add them inside the page content so the public page stays simple."
              actions={
                <button
                  type="button"
                  onClick={insertFaqTemplate}
                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-xs font-medium hover:bg-neutral-50"
                >
                  Insert FAQ template
                </button>
              }
            >
              <div className="rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
                Use 3-5 short questions customers actually ask before buying: delivery time,
                payment method, returns, support, and product details.
              </div>
            </AdminCard>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <ImageUploader
              title="Feature image"
              kind="page"
              max={1}
              value={imageToUploaderValue(form)}
              onChange={(images) =>
                setForm((x) => ({
                  ...x,
                  featureImage: images[0]?.url || "",
                  featureImageAlt: images[0]?.alt || "",
                }))
              }
              hint="Optional image used for previews and Open Graph."
            />

            <AdminCard
              title="SEO metadata"
              description="Use a search-friendly title and description for Google previews."
              contentClassName="p-6"
            >
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
                    rows={4}
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
            </AdminCard>
          </aside>
        </div>
      </div>
    </div>
  );
}
