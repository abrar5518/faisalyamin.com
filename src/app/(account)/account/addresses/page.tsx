// src/app/(account)/account/addresses/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Address = {
  id: number;
  label: "Home" | "Office" | "Other";
  isDefault?: boolean;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  country: string;
  notes?: string;
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-neutral-700">
        {label} {required ? <span className="text-neutral-400">*</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900/10"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-neutral-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="mt-2 w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900/10"
      />
    </label>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] text-neutral-700">
      {children}
    </span>
  );
}

function AddressCard({
  a,
  onSetDefault,
  onEdit,
  onDelete,
}: {
  a: Address;
  onSetDefault: (id: number) => void;
  onEdit: (a: Address) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{a.label}</p>
            {a.isDefault ? <Badge>Default</Badge> : null}
          </div>
          <p className="mt-3 text-sm font-medium text-neutral-900">{a.name}</p>
          <p className="mt-1 text-sm text-neutral-600">{a.phone}</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(a)}
            className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(a.id)}
            className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
        <p className="text-sm text-neutral-700">{a.line1}</p>
        {a.line2 ? <p className="mt-1 text-sm text-neutral-600">{a.line2}</p> : null}
        <p className="mt-2 text-sm text-neutral-600">
          {a.city}, {a.country}
        </p>
        {a.notes ? (
          <p className="mt-3 text-xs text-neutral-500">Note: {a.notes}</p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-neutral-500">
          Used as default in checkout if selected.
        </p>

        {!a.isDefault ? (
          <button
            type="button"
            onClick={() => onSetDefault(a.id)}
            className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Set as default
          </button>
        ) : (
          <span className="text-xs font-medium text-neutral-600">Default address</span>
        )}
      </div>
    </div>
  );
}

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const [label, setLabel] = useState<Address["label"]>("Home");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [notes, setNotes] = useState("");
  const [makeDefault, setMakeDefault] = useState(false);

  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      phone.trim().length >= 7 &&
      line1.trim().length >= 4 &&
      city.trim().length >= 2 &&
      country.trim().length >= 2
    );
  }, [name, phone, line1, city, country]);

  function resetForm() {
    setEditing(null);
    setLabel("Home");
    setName("");
    setPhone("");
    setLine1("");
    setLine2("");
    setCity("");
    setCountry("");
    setNotes("");
    setMakeDefault(false);
  }

  function openNew() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(a: Address) {
    setEditing(a);
    setLabel(a.label);
    setName(a.name);
    setPhone(a.phone);
    setLine1(a.line1);
    setLine2(a.line2 ?? "");
    setCity(a.city);
    setCountry(a.country);
    setNotes(a.notes ?? "");
    setMakeDefault(Boolean(a.isDefault));
    setShowForm(true);
  }

  async function setDefault(id: number) {
    const target = addresses.find((a) => a.id === id);
    if (!target) return;

    await fetch("/api/account/addresses", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        label: target.label,
        fullName: target.name,
        phone: target.phone,
        address1: target.line1,
        address2: target.line2,
        city: target.city,
        country: target.country,
        notes: target.notes,
        isDefault: true,
      }),
    });

    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }

  async function remove(id: number) {
    await fetch("/api/account/addresses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    try {
      const payload = {
        label,
        fullName: name,
        phone,
        address1: line1,
        address2: line2.trim() ? line2.trim() : undefined,
        city,
        country,
        notes: notes.trim() ? notes.trim() : undefined,
        isDefault: makeDefault,
      };

      const res = await fetch("/api/account/addresses", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to save address");
      }

      const mapped: Address = {
        id: data?.data?.id,
        label: (data?.data?.label ?? label) as Address["label"],
        name: data?.data?.fullName ?? name,
        phone: data?.data?.phone ?? phone,
        line1: data?.data?.address1 ?? line1,
        line2: data?.data?.address2 ?? line2,
        city: data?.data?.city ?? city,
        country: data?.data?.country ?? country,
        notes: data?.data?.notes ?? notes,
        isDefault: Boolean(data?.data?.isDefault),
      };

      setAddresses((prev) => {
        let next = prev;
        if (editing) next = prev.map((a) => (a.id === editing.id ? mapped : a));
        else next = [mapped, ...prev];

        if (mapped.isDefault) {
          next = next.map((a) => ({ ...a, isDefault: a.id === mapped.id }));
        }
        if (!next.some((a) => a.isDefault) && next.length > 0) {
          next = next.map((a, i) => ({ ...a, isDefault: i === 0 }));
        }

        return next;
      });

      setShowForm(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/account/addresses", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) return;

        const data = Array.isArray(payload?.data) ? payload.data : [];
        const mapped = data.map((a: any) => ({
          id: a.id,
          label: (a.label ?? "Home") as Address["label"],
          isDefault: a.isDefault,
          name: a.fullName ?? "",
          phone: a.phone ?? "",
          line1: a.address1 ?? "",
          line2: a.address2 ?? "",
          city: a.city ?? "",
          country: a.country ?? "",
          notes: a.notes ?? "",
        }));

        if (active) setAddresses(mapped);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-600">Loading saved addresses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Addresses</p>
            <p className="mt-1 text-sm text-neutral-600">
              Manage shipping and billing addresses for faster checkout.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={openNew}
              className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Add new address
            </button>
            <Link
              href="/checkout"
              className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Go to checkout
            </Link>
          </div>
        </div>
      </Card>

      {/* Form */}
      {showForm ? (
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold">{editing ? "Edit address" : "Add new address"}</p>
              <p className="mt-1 text-sm text-neutral-600">
                Use clear details for smooth delivery.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              Close
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-xs font-medium text-neutral-700">Label</span>
                <select
                  value={label}
                  onChange={(e) => setLabel(e.target.value as Address["label"])}
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
                >
                  <option>Home</option>
                  <option>Office</option>
                  <option>Other</option>
                </select>
              </label>

              <Field label="Full name" value={name} onChange={setName} required />
              <Field label="Phone" value={phone} onChange={setPhone} required />
            </div>

            <Field
              label="Address line 1"
              value={line1}
              onChange={setLine1}
              placeholder="Building, street, area…"
              required
            />
            <Field
              label="Address line 2 (optional)"
              value={line2}
              onChange={setLine2}
              placeholder="Apartment, floor, landmark…"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" value={city} onChange={setCity} required />
              <Field label="Country" value={country} onChange={setCountry} required />
            </div>

            <TextArea
              label="Delivery notes (optional)"
              value={notes}
              onChange={setNotes}
              placeholder="Call on arrival, gate code, concierge instruction…"
            />

            <label className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
              <input
                type="checkbox"
                checked={makeDefault}
                onChange={(e) => setMakeDefault(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-300"
              />
              <span className="text-sm text-neutral-600">
                Make this my default address for checkout.
              </span>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-neutral-500">
                Tip: Include building name and a nearby landmark.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
                >
                  Cancel
                </button>

                <button
                  disabled={!canSave || saving}
                  className={[
                    "rounded-2xl px-6 py-3 text-sm font-medium transition",
                    !canSave || saving
                      ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                      : "bg-neutral-900 text-white hover:bg-neutral-800",
                  ].join(" ")}
                >
                  {saving ? "Saving..." : editing ? "Save changes" : "Add address"}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}

      {/* Address cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {addresses.map((a) => (
          <AddressCard
            key={a.id}
            a={a}
            onSetDefault={setDefault}
            onEdit={openEdit}
            onDelete={(id) => {
              if (confirm("Delete this address?")) remove(id);
            }}
          />
        ))}
      </div>

      {/* Footer help */}
      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
        <p className="text-sm font-semibold">Checkout tip</p>
        <p className="mt-2 text-sm text-neutral-600">
          Your default address is selected automatically during checkout. You can still change it on the checkout page.
        </p>
        <div className="mt-4">
          <Link href="/checkout" className="text-sm font-medium text-neutral-900 hover:underline">
            Open checkout →
          </Link>
        </div>
      </div>
    </div>
  );
}
