"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Fetch } from "@/lib/fetch";

type RedirectRule = {
  id: number;
  source: string;
  destination: string;
  permanent: boolean;
  isActive: boolean;
  note?: string | null;
  updatedAt?: string;
};

type RedirectForm = {
  source: string;
  destination: string;
  permanent: boolean;
  isActive: boolean;
  note: string;
};

const EMPTY_FORM: RedirectForm = {
  source: "",
  destination: "/",
  permanent: true,
  isActive: true,
  note: "",
};

function toForm(rule: RedirectRule): RedirectForm {
  return {
    source: rule.source,
    destination: rule.destination,
    permanent: rule.permanent,
    isActive: rule.isActive,
    note: rule.note || "",
  };
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminRedirectsPage() {
  const [rows, setRows] = useState<RedirectRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RedirectForm>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<RedirectForm>(EMPTY_FORM);
  const [msg, setMsg] = useState<string | null>(null);

  async function loadRedirects() {
    setLoading(true);
    setMsg(null);
    const res = await Fetch<RedirectRule[]>("/api/admin/redirects", {
      auth: true,
      cache: "no-store",
    });
    if (!res.ok) {
      setMsg(res.error || "Failed to load redirects.");
      setRows([]);
    } else {
      setRows((res.data as RedirectRule[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRedirects();
  }, []);

  const activeCount = useMemo(() => rows.filter((row) => row.isActive).length, [rows]);

  async function createRedirect() {
    setSaving(true);
    setMsg(null);
    const res = await Fetch("/api/admin/redirects", {
      method: "POST",
      auth: true,
      data: form,
    });
    if (!res.ok) {
      setMsg(res.error || "Failed to create redirect.");
    } else {
      setForm(EMPTY_FORM);
      await loadRedirects();
    }
    setSaving(false);
  }

  function startEdit(rule: RedirectRule) {
    setEditingId(rule.id);
    setEditForm(toForm(rule));
    setMsg(null);
  }

  async function saveEdit(id: number) {
    setBusyId(id);
    setMsg(null);
    const res = await Fetch(`/api/admin/redirects?id=${id}`, {
      method: "PUT",
      auth: true,
      data: editForm,
    });
    if (!res.ok) {
      setMsg(res.error || "Failed to save redirect.");
    } else {
      setEditingId(null);
      await loadRedirects();
    }
    setBusyId(null);
  }

  async function toggleActive(rule: RedirectRule) {
    setBusyId(rule.id);
    setMsg(null);
    const res = await Fetch(`/api/admin/redirects?id=${rule.id}`, {
      method: "PUT",
      auth: true,
      data: { ...toForm(rule), isActive: !rule.isActive },
    });
    if (!res.ok) {
      setMsg(res.error || "Failed to update redirect.");
    } else {
      await loadRedirects();
    }
    setBusyId(null);
  }

  async function deleteRedirect(rule: RedirectRule) {
    if (!confirm(`Delete redirect from "${rule.source}"?`)) return;
    setBusyId(rule.id);
    setMsg(null);
    const res = await Fetch(`/api/admin/redirects?id=${rule.id}`, {
      method: "DELETE",
      auth: true,
    });
    if (!res.ok) {
      setMsg(res.error || "Failed to delete redirect.");
    } else {
      await loadRedirects();
    }
    setBusyId(null);
  }

  const updateForm = (patch: Partial<RedirectForm>) => setForm((current) => ({ ...current, ...patch }));
  const updateEditForm = (patch: Partial<RedirectForm>) =>
    setEditForm((current) => ({ ...current, ...patch }));

  return (
    <div className="bg-white">
      <AdminTopbar title="Redirects" />

      <div className="mx-auto w-full max-w-[1360px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Redirect manager</p>
            <p className="mt-1 text-xs text-neutral-500">
              Manage old URLs, campaign links, and deleted product URLs without editing code.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm text-neutral-700">
            <span className="font-semibold text-neutral-950">{activeCount}</span> active / {rows.length} total
          </div>
        </div>

        {msg ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {msg}
          </div>
        ) : null}

        <section className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1.1fr_auto_auto] lg:items-end">
            <div>
              <label className="text-xs font-medium text-neutral-700">Source URL</label>
              <input
                value={form.source}
                onChange={(event) => updateForm({ source: event.target.value })}
                className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                placeholder="/old-product-url or full URL"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-700">Destination URL</label>
              <input
                value={form.destination}
                onChange={(event) => updateForm({ destination: event.target.value })}
                className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                placeholder="/"
              />
            </div>
            <label className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={form.permanent}
                onChange={(event) => updateForm({ permanent: event.target.checked })}
              />
              Permanent
            </label>
            <button
              type="button"
              onClick={createRedirect}
              disabled={saving || !form.source.trim() || !form.destination.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              <Plus className="h-4 w-4" />
              {saving ? "Saving..." : "Add"}
            </button>
          </div>
          <div className="mt-4">
            <label className="text-xs font-medium text-neutral-700">Note</label>
            <input
              value={form.note}
              onChange={(event) => updateForm({ note: event.target.value })}
              className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
              placeholder="Optional reason, campaign, or ticket reference"
            />
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          {loading ? (
            <div className="p-6 text-sm text-neutral-600">Loading redirects...</div>
          ) : rows.length ? (
            <div className="divide-y divide-neutral-200">
              {rows.map((rule) => {
                const isEditing = editingId === rule.id;
                return (
                  <div key={rule.id} className="p-5">
                    {isEditing ? (
                      <div className="grid gap-3 lg:grid-cols-[1.3fr_1.1fr_auto_auto_auto] lg:items-end">
                        <div>
                          <label className="text-xs font-medium text-neutral-700">Source</label>
                          <input
                            value={editForm.source}
                            onChange={(event) => updateEditForm({ source: event.target.value })}
                            className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-neutral-700">Destination</label>
                          <input
                            value={editForm.destination}
                            onChange={(event) => updateEditForm({ destination: event.target.value })}
                            className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          />
                        </div>
                        <label className="flex items-center gap-2 rounded-2xl border border-neutral-200 px-4 py-3 text-sm">
                          <input
                            type="checkbox"
                            checked={editForm.permanent}
                            onChange={(event) => updateEditForm({ permanent: event.target.checked })}
                          />
                          Permanent
                        </label>
                        <label className="flex items-center gap-2 rounded-2xl border border-neutral-200 px-4 py-3 text-sm">
                          <input
                            type="checkbox"
                            checked={editForm.isActive}
                            onChange={(event) => updateEditForm({ isActive: event.target.checked })}
                          />
                          Active
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(rule.id)}
                            disabled={busyId === rule.id}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white hover:bg-neutral-800 disabled:bg-neutral-300"
                            aria-label="Save redirect"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 hover:bg-neutral-50"
                            aria-label="Cancel editing"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="lg:col-span-5">
                          <label className="text-xs font-medium text-neutral-700">Note</label>
                          <input
                            value={editForm.note}
                            onChange={(event) => updateEditForm({ note: event.target.value })}
                            className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                rule.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-neutral-100 text-neutral-500"
                              }`}
                            >
                              {rule.isActive ? "Active" : "Paused"}
                            </span>
                            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                              {rule.permanent ? "Permanent" : "Temporary"}
                            </span>
                            {rule.updatedAt ? (
                              <span className="text-xs text-neutral-400">
                                Updated {formatDate(rule.updatedAt)}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-3 break-all text-sm font-semibold text-neutral-950">
                            {rule.source}
                          </p>
                          <p className="mt-1 break-all text-sm text-neutral-600">
                            to {rule.destination}
                          </p>
                          {rule.note ? (
                            <p className="mt-2 text-xs text-neutral-500">{rule.note}</p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => toggleActive(rule)}
                            disabled={busyId === rule.id}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
                            aria-label={rule.isActive ? "Pause redirect" : "Activate redirect"}
                          >
                            {rule.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(rule)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200 hover:bg-neutral-50"
                            aria-label="Edit redirect"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRedirect(rule)}
                            disabled={busyId === rule.id}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            aria-label="Delete redirect"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-sm text-neutral-600">No redirects added yet.</div>
          )}
        </section>
      </div>
    </div>
  );
}
