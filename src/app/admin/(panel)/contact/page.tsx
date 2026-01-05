"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Fetch } from "@/lib/fetch";

type ContactForm = {
  phone: string;
  whatsapp: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  hoursWeekdays: string;
  hoursWeekend: string;
  notes: string;
};

const EMPTY_FORM: ContactForm = {
  phone: "",
  whatsapp: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  hoursWeekdays: "",
  hoursWeekend: "",
  notes: "",
};

export default function AdminContactPage() {
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setMsg(null);
      const res = await Fetch("/api/admin/contact", { auth: true, cache: "no-store" });
      if (!alive) return;
      if (!res.ok) {
        setMsg(res.error || "Failed to load contact");
        setLoading(false);
        return;
      }
      const data: any = res.data || {};
      setForm({
        phone: data.phone ?? "",
        whatsapp: data.whatsapp ?? "",
        email: data.email ?? "",
        addressLine1: data.addressLine1 ?? "",
        addressLine2: data.addressLine2 ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        country: data.country ?? "",
        postalCode: data.postalCode ?? "",
        hoursWeekdays: data.hoursWeekdays ?? "",
        hoursWeekend: data.hoursWeekend ?? "",
        notes: data.notes ?? "",
      });
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onSave = async () => {
    setSaving(true);
    setMsg(null);
    const res = await Fetch("/api/admin/contact", {
      method: "PUT",
      auth: true,
      data: form,
    });
    if (!res.ok) {
      setMsg(res.error || "Failed to save contact");
    } else {
      setMsg("Contact details updated.");
    }
    setSaving(false);
  };

  return (
    <div className="bg-white">
      <AdminTopbar title="Contact" />

      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Contact details</p>
            <p className="mt-1 text-xs text-neutral-500">
              Used across the site footer, support, and contact pages.
            </p>
          </div>
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save contact"}
          </button>
        </div>

        {msg ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            {msg}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
            Loading...
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Primary contact</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((x) => ({ ...x, phone: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">WhatsApp</label>
                  <input
                    value={form.whatsapp}
                    onChange={(e) => setForm((x) => ({ ...x, whatsapp: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-neutral-700">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((x) => ({ ...x, email: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Address</p>
              <div className="mt-5 grid gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Address line 1</label>
                  <input
                    value={form.addressLine1}
                    onChange={(e) => setForm((x) => ({ ...x, addressLine1: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Address line 2</label>
                  <input
                    value={form.addressLine2}
                    onChange={(e) => setForm((x) => ({ ...x, addressLine2: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-neutral-700">City</label>
                    <input
                      value={form.city}
                      onChange={(e) => setForm((x) => ({ ...x, city: e.target.value }))}
                      className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700">State</label>
                    <input
                      value={form.state}
                      onChange={(e) => setForm((x) => ({ ...x, state: e.target.value }))}
                      className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700">Country</label>
                    <input
                      value={form.country}
                      onChange={(e) => setForm((x) => ({ ...x, country: e.target.value }))}
                      className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700">Postal code</label>
                    <input
                      value={form.postalCode}
                      onChange={(e) => setForm((x) => ({ ...x, postalCode: e.target.value }))}
                      className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Hours</p>
              <div className="mt-5 grid gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Weekdays</label>
                  <input
                    value={form.hoursWeekdays}
                    onChange={(e) => setForm((x) => ({ ...x, hoursWeekdays: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="Mon-Fri: 9am-7pm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Weekend</label>
                  <input
                    value={form.hoursWeekend}
                    onChange={(e) => setForm((x) => ({ ...x, hoursWeekend: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="Sat-Sun: 10am-6pm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((x) => ({ ...x, notes: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
