"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ImageUploader from "@/components/admin/common/ImageUploader";
import RichEditor from "@/components/admin/common/RichEditor";
import type { AdminImage } from "@/types/adminProduct";
import { Fetch } from "@/lib/fetch";

type AuthorForm = {
  name: string;
  slug: string;
  role: string;
  avatar: AdminImage | null;
  bioHtml: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
};

const EMPTY_AUTHOR: AuthorForm = {
  name: "",
  slug: "",
  role: "",
  avatar: null,
  bioHtml: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

export default function AdminBlogAuthorPage() {
  const [form, setForm] = useState<AuthorForm>(EMPTY_AUTHOR);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setMsg(null);
      const res = await Fetch("/api/admin/blog-author", { auth: true, cache: "no-store" });
      if (!alive) return;
      if (!res.ok || !res.data) {
        setMsg(res.error || "Failed to load author.");
        setLoading(false);
        return;
      }
      const data: any = res.data;
      setForm({
        name: data.name ?? "",
        slug: data.slug ?? "",
        role: data.role ?? "",
        avatar: data.avatar ? { url: data.avatar, alt: data.name ?? "" } : null,
        bioHtml: data.bioHtml ?? "",
        metaTitle: data.metaTitle ?? "",
        metaDescription: data.metaDescription ?? "",
        metaKeywords: data.metaKeywords ?? "",
      });
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onSave = async () => {
    if (!form.name.trim()) return setMsg("Name is required.");
    if (!form.slug.trim()) return setMsg("Slug is required.");
    setSaving(true);
    setMsg(null);

    const payload = {
      name: form.name,
      slug: form.slug,
      role: form.role || undefined,
      avatar: form.avatar?.url || undefined,
      bioHtml: form.bioHtml || undefined,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      metaKeywords: form.metaKeywords || undefined,
    };

    const res = await Fetch("/api/admin/blog-author", { method: "PUT", auth: true, data: payload });
    if (!res.ok) {
      setMsg(res.error || "Failed to save author.");
      setSaving(false);
      return;
    }
    setMsg("Author saved.");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-white">
        <AdminTopbar title="Blog Author" />
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
      <AdminTopbar title="Blog Author" />

      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Author profile</p>
            <p className="mt-1 text-xs text-neutral-500">This author is shown on all blog posts.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/blog"
              className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50"
            >
              Back
            </Link>
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-2xl bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
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
                  <label className="text-xs font-medium text-neutral-700">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((x) => ({ ...x, name: e.target.value }))}
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
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-neutral-700">Role</label>
                  <input
                    value={form.role}
                    onChange={(e) => setForm((x) => ({ ...x, role: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Bio</p>
              <div className="mt-4">
                <RichEditor
                  value={form.bioHtml}
                  onChange={(html) => setForm((x) => ({ ...x, bioHtml: html }))}
                />
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-6">
            <ImageUploader
              title="Avatar"
              hint="Upload a square profile photo for the author."
              value={form.avatar ? [form.avatar] : []}
              onChange={(imgs) => setForm((x) => ({ ...x, avatar: imgs[0] ?? null }))}
              max={1}
              kind="blog"
            />

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">SEO meta</p>
              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Meta title</label>
                <input
                  value={form.metaTitle}
                  onChange={(e) => setForm((x) => ({ ...x, metaTitle: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                />
              </div>
              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Meta description</label>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) => setForm((x) => ({ ...x, metaDescription: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  rows={3}
                />
              </div>
              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Meta keywords</label>
                <input
                  value={form.metaKeywords}
                  onChange={(e) => setForm((x) => ({ ...x, metaKeywords: e.target.value }))}
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
