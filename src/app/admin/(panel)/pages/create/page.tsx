"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ImageUploader from "@/components/admin/common/ImageUploader";
import RichEditor from "@/components/admin/common/RichEditor";
import { AdminCard, AdminPageHeader } from "@/components/admin/ui";
import { Fetch } from "@/lib/fetch";
import type { AdminImage } from "@/types/adminProduct";

type PageCreateForm = {
  title: string;
  slug: string;
  shortDescription: string;
  contentHtml: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  featureImage: string;
  featureImageAlt: string;
};

const EMPTY_FORM: PageCreateForm = {
  title: "",
  slug: "",
  shortDescription: "",
  contentHtml: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  featureImage: "",
  featureImageAlt: "",
};

const PAGE_FAQ_TEMPLATE =
  '<h3>Frequently Asked Questions</h3><p><strong>Question:</strong> Add the customer question here.</p><p><strong>Answer:</strong> Add a clear, helpful answer here.</p>';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function imageToUploaderValue(form: PageCreateForm): AdminImage[] {
  return form.featureImage ? [{ url: form.featureImage, alt: form.featureImageAlt }] : [];
}

export default function AdminPageCreate() {
  const router = useRouter();
  const [form, setForm] = useState<PageCreateForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onSave = async () => {
    const finalSlug = form.slug.trim() || slugify(form.title);
    if (!form.title.trim() || !finalSlug) {
      setMsg("Title and slug are required.");
      return;
    }

    setSaving(true);
    setMsg(null);
    const res = await Fetch("/api/admin/pages", {
      method: "POST",
      auth: true,
      data: {
        title: form.title.trim(),
        slug: finalSlug,
        shortDescription: form.shortDescription.trim(),
        contentHtml: form.contentHtml,
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
        metaKeywords: form.metaKeywords.trim(),
        featureImage: form.featureImage.trim(),
        featureImageAlt: form.featureImageAlt.trim(),
        heroTitle: form.title.trim(),
        heroSubtitle: form.shortDescription.trim(),
        heroImage: form.featureImage.trim(),
        heroImageAlt: form.featureImageAlt.trim(),
      },
    });

    if (!res.ok) {
      setMsg(res.error || "Failed to create page");
      setSaving(false);
      return;
    }

    setMsg("Page created.");
    setSaving(false);
    router.push(`/admin/pages/${encodeURIComponent(finalSlug)}/edit`);
  };

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

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminTopbar title="Create Page" />

      <div className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8 lg:px-12">
        <AdminPageHeader
          eyebrow="Page editor"
          title="Create custom page"
          description="Create reusable storefront pages with the same professional structure used across system pages."
          actions={
            <>
              <Link
                href="/admin/pages"
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
              >
                Back
              </Link>
              <button
                onClick={onSave}
                disabled={saving}
                className="rounded-2xl bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create page"}
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
              description="Set the page name, URL, and short intro first."
              contentClassName="p-6"
            >
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Title</label>
                  <input
                    value={form.title}
                    onChange={(event) => {
                      const value = event.target.value;
                      setForm((current) => ({
                        ...current,
                        title: value,
                        slug: current.slug ? current.slug : slugify(value),
                      }));
                    }}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="Buying Guide"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, slug: slugify(event.target.value) }))
                    }
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="buying-guide"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Short description</label>
                <textarea
                  value={form.shortDescription}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, shortDescription: event.target.value }))
                  }
                  rows={3}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  placeholder="Brief intro shown near the top of the page."
                />
              </div>
            </AdminCard>

            <AdminCard
              title="Long description / page content"
              description="Write the main page content here using the freestyle editor."
              contentClassName="p-6"
            >
              <div className="mt-5">
                <RichEditor
                  value={form.contentHtml}
                  onChange={(contentHtml) => setForm((current) => ({ ...current, contentHtml }))}
                  minHeight={420}
                />
              </div>
            </AdminCard>

            <AdminCard
              title="FAQs"
              description="Keep FAQs in the same location on every page."
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
                Add customer questions about delivery, payment, returns, support, and product
                details when this page needs extra buying help.
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
                setForm((current) => ({
                  ...current,
                  featureImage: images[0]?.url || "",
                  featureImageAlt: images[0]?.alt || "",
                }))
              }
              hint="Optional image used for previews and Open Graph."
            />

            <AdminCard
              title="SEO metadata"
              description="Search title, description, and optional keywords."
              contentClassName="p-6"
            >
              <div className="mt-5 grid gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Meta title</label>
                  <input
                    value={form.metaTitle}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, metaTitle: event.target.value }))
                    }
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Meta description</label>
                  <textarea
                    value={form.metaDescription}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, metaDescription: event.target.value }))
                    }
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Meta keywords</label>
                  <input
                    value={form.metaKeywords}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, metaKeywords: event.target.value }))
                    }
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
