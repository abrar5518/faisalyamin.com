"use client";

import { useEffect, useMemo, useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { AdminCard, AdminField, AdminPageHeader } from "@/components/admin/ui";
import { Fetch } from "@/lib/fetch";
import {
  normalizeReusableBlockSlug,
  REUSABLE_BLOCK_PLACEMENTS,
  REUSABLE_BLOCK_TYPES,
  type ReusableBlockItem,
  type ReusableBlockViewModel,
} from "@/lib/reusableBlocks";

type FormState = {
  title: string;
  slug: string;
  type: string;
  placement: string;
  eyebrow: string;
  bodyHtml: string;
  icon: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  items: ReusableBlockItem[];
  isEnabled: boolean;
  sortOrder: number;
};

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  type: "trust",
  placement: "general",
  eyebrow: "",
  bodyHtml: "",
  icon: "",
  primaryLabel: "",
  primaryHref: "",
  secondaryLabel: "",
  secondaryHref: "",
  items: [
    { title: "Cash on Delivery", text: "Pay when your parcel arrives." },
    { title: "Delivery Across Pakistan", text: "Courier delivery available across supported cities." },
  ],
  isEnabled: true,
  sortOrder: 0,
};

function toForm(block: ReusableBlockViewModel): FormState {
  return {
    title: block.title,
    slug: block.slug,
    type: block.type,
    placement: block.placement,
    eyebrow: block.eyebrow || "",
    bodyHtml: block.bodyHtml || "",
    icon: block.icon || "",
    primaryLabel: block.primaryLabel || "",
    primaryHref: block.primaryHref || "",
    secondaryLabel: block.secondaryLabel || "",
    secondaryHref: block.secondaryHref || "",
    items: block.items.length ? block.items : [{ title: "", text: "" }],
    isEnabled: block.isEnabled,
    sortOrder: block.sortOrder,
  };
}

export default function ReusableBlocksAdminPage() {
  const [items, setItems] = useState<ReusableBlockViewModel[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () => items.filter((item) => (filter === "all" ? true : item.placement === filter)),
    [filter, items]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const res = await Fetch<ReusableBlockViewModel[]>("/api/admin/reusable-blocks", {
        auth: true,
        cache: "no-store",
      });
      if (!active) return;
      if (res.ok) {
        setItems(res.data || []);
        setMsg(null);
      } else {
        setMsg(res.error || "Failed to load reusable blocks.");
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function refreshAfterMutation() {
    setLoading(true);
    const res = await Fetch<ReusableBlockViewModel[]>("/api/admin/reusable-blocks", {
      auth: true,
      cache: "no-store",
    });
    if (res.ok) {
      setItems(res.data || []);
      setMsg(null);
    } else {
      setMsg(res.error || "Failed to load reusable blocks.");
    }
    setLoading(false);
  }

  function updateItem(index: number, patch: Partial<ReusableBlockItem>) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const slug = normalizeReusableBlockSlug(form.slug || form.title);
    const payload = { ...form, slug };
    const res = await Fetch<ReusableBlockViewModel>(
      editingSlug ? `/api/admin/reusable-blocks?slug=${encodeURIComponent(editingSlug)}` : "/api/admin/reusable-blocks",
      {
        method: editingSlug ? "PUT" : "POST",
        auth: true,
        data: payload,
      }
    );
    if (res.ok) {
      setMsg(editingSlug ? "Reusable block updated." : "Reusable block created.");
      setForm(EMPTY_FORM);
      setEditingSlug(null);
      await refreshAfterMutation();
    } else {
      setMsg(res.error || "Failed to save reusable block.");
    }
    setSaving(false);
  }

  async function remove(slug: string) {
    if (!confirm("Delete this reusable block?")) return;
    const res = await Fetch(`/api/admin/reusable-blocks?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
      auth: true,
    });
    if (res.ok) {
      setMsg("Reusable block deleted.");
      await refreshAfterMutation();
    } else {
      setMsg(res.error || "Failed to delete reusable block.");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminTopbar title="Reusable Blocks" />
      <main className="mx-auto max-w-7xl px-5 py-8">
        <AdminPageHeader
          eyebrow="Content"
          title="Reusable Blocks"
          description="Create once, reuse across pages, cart, checkout, product pages, and support sections."
        />

        {msg ? (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
            {msg}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <AdminCard
              title={editingSlug ? "Edit reusable block" : "Create reusable block"}
              description="Use generic reusable copy so the same platform can fit different clients."
              actions={
                <button
                  type="button"
                  onClick={save}
                  disabled={saving || !form.title.trim()}
                  className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingSlug ? "Update block" : "Create block"}
                </button>
              }
            >
              <div className="space-y-4">
                <AdminField label="Title" required>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                        slug: current.slug || normalizeReusableBlockSlug(event.target.value),
                      }))
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="Checkout reassurance"
                  />
                </AdminField>
                <AdminField label="Slug" description="Used by page builder and integrations.">
                  <input
                    value={form.slug}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        slug: normalizeReusableBlockSlug(event.target.value),
                      }))
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 font-mono text-sm outline-none focus:border-neutral-900"
                  />
                </AdminField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Type">
                    <select
                      value={form.type}
                      onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                      className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    >
                      {REUSABLE_BLOCK_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </AdminField>
                  <AdminField label="Placement">
                    <select
                      value={form.placement}
                      onChange={(event) => setForm((current) => ({ ...current, placement: event.target.value }))}
                      className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    >
                      {REUSABLE_BLOCK_PLACEMENTS.map((placement) => (
                        <option key={placement.value} value={placement.value}>{placement.label}</option>
                      ))}
                    </select>
                  </AdminField>
                </div>
                <AdminField label="Eyebrow">
                  <input
                    value={form.eyebrow}
                    onChange={(event) => setForm((current) => ({ ...current, eyebrow: event.target.value }))}
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </AdminField>
                <AdminField label="Body HTML">
                  <textarea
                    value={form.bodyHtml}
                    onChange={(event) => setForm((current) => ({ ...current, bodyHtml: event.target.value }))}
                    rows={5}
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="<p>Reusable support text...</p>"
                  />
                </AdminField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Primary label">
                    <input value={form.primaryLabel} onChange={(event) => setForm((current) => ({ ...current, primaryLabel: event.target.value }))} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900" />
                  </AdminField>
                  <AdminField label="Primary URL">
                    <input value={form.primaryHref} onChange={(event) => setForm((current) => ({ ...current, primaryHref: event.target.value }))} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900" />
                  </AdminField>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Enabled">
                    <button
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, isEnabled: !current.isEnabled }))}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium ${form.isEnabled ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-neutral-200 bg-white text-neutral-600"}`}
                    >
                      {form.isEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </AdminField>
                  <AdminField label="Sort order">
                    <input type="number" value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) || 0 }))} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900" />
                  </AdminField>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-neutral-700">Items</p>
                  {form.items.map((item, index) => (
                    <div key={index} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                      <input
                        value={item.title}
                        onChange={(event) => updateItem(index, { title: event.target.value })}
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                        placeholder="Item title"
                      />
                      <textarea
                        value={item.text}
                        onChange={(event) => updateItem(index, { text: event.target.value })}
                        className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                        rows={2}
                        placeholder="Item text"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, items: [...current.items, { title: "", text: "" }] }))}
                    className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-xs hover:bg-neutral-50"
                  >
                    Add item
                  </button>
                </div>
              </div>
            </AdminCard>
          </div>

          <div className="xl:col-span-3">
            <AdminCard title="Reusable block library" description="Blocks can be used by placement on cart, checkout, product, footer, and general content areas.">
              <div className="mb-4 flex flex-wrap gap-2">
                <button onClick={() => setFilter("all")} className={`rounded-2xl border px-4 py-2 text-xs ${filter === "all" ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white"}`}>All</button>
                {REUSABLE_BLOCK_PLACEMENTS.map((placement) => (
                  <button key={placement.value} onClick={() => setFilter(placement.value)} className={`rounded-2xl border px-4 py-2 text-xs ${filter === placement.value ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white"}`}>{placement.label}</button>
                ))}
              </div>

              {loading ? <p className="text-sm text-neutral-500">Loading reusable blocks...</p> : null}
              <div className="space-y-3">
                {filtered.map((block) => (
                  <div key={block.slug} className="rounded-3xl border border-neutral-200 bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-neutral-950">{block.title}</p>
                          <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] text-neutral-600">{block.placement}</span>
                          <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] text-neutral-600">{block.type}</span>
                          {!block.isEnabled ? <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] text-red-700">Disabled</span> : null}
                        </div>
                        <p className="mt-1 font-mono text-xs text-neutral-500">{block.slug}</p>
                        {block.items.length ? (
                          <p className="mt-2 text-xs text-neutral-500">{block.items.length} reusable item(s)</p>
                        ) : null}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSlug(block.slug);
                            setForm(toForm(block));
                          }}
                          className="rounded-2xl border border-neutral-200 px-4 py-2 text-xs hover:bg-neutral-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(block.slug)}
                          className="rounded-2xl border border-red-200 px-4 py-2 text-xs text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {!loading && !filtered.length ? (
                  <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
                    No reusable blocks found.
                  </div>
                ) : null}
              </div>
            </AdminCard>
          </div>
        </div>
      </main>
    </div>
  );
}
