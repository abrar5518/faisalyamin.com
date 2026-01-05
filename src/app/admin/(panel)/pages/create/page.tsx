"use client";

import { useState } from "react";
import Link from "next/link";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Fetch } from "@/lib/fetch";

export default function AdminPageCreate() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onSave = async () => {
    if (!title.trim() || !slug.trim()) {
      setMsg("Title and slug are required.");
      return;
    }
    setSaving(true);
    setMsg(null);
    const res = await Fetch("/api/admin/pages", {
      method: "POST",
      auth: true,
      data: { title: title.trim(), slug: slug.trim() },
    });
    if (!res.ok) {
      setMsg(res.error || "Failed to create page");
    } else {
      setMsg("Page created.");
    }
    setSaving(false);
  };

  return (
    <div className="bg-white">
      <AdminTopbar title="Create Page" />

      <div className="mx-auto w-full max-w-[960px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">New page</p>
            <p className="mt-1 text-xs text-neutral-500">Create a new static page entry.</p>
          </div>
          <Link
            href="/admin/pages"
            className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Back
          </Link>
        </div>

        {msg ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            {msg}
          </div>
        ) : null}

        <div className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-neutral-700">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-700">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Create page"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
