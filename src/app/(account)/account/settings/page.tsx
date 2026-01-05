// src/app/(account)/account/settings/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      {children}
    </div>
  );
}

function SectionTitle({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-neutral-600">{desc}</p>
    </div>
  );
}

function Toggle({
  title,
  desc,
  value,
  onChange,
}: {
  title: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-5 rounded-3xl border border-neutral-200 bg-white p-5">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm text-neutral-600">{desc}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!value)}
        className={[
          "relative h-7 w-12 rounded-full border transition",
          value
            ? "border-neutral-900 bg-neutral-900"
            : "border-neutral-200 bg-neutral-100",
        ].join(" ")}
        aria-pressed={value}
      >
        <span
          className={[
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition",
            value ? "left-5" : "left-0.5",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-neutral-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function AccountSettingsPage() {
  const [emailOffers, setEmailOffers] = useState(true);
  const [emailOrderUpdates, setEmailOrderUpdates] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(false);

  const [currency, setCurrency] = useState("PKR");
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("Asia/Karachi");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const canSave = useMemo(() => true, []);

  async function onSave() {
    if (!canSave) return;

    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/account/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOffers,
          emailOrderUpdates,
          whatsappUpdates,
          currency,
          language,
          timezone,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error ?? "Failed to update settings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err?.message ?? "Failed to update settings");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/account/settings", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) return;

        const data = payload?.data ?? {};
        if (active) {
          setEmailOffers(Boolean(data.emailOffers ?? true));
          setEmailOrderUpdates(Boolean(data.emailOrderUpdates ?? true));
          setWhatsappUpdates(Boolean(data.whatsappUpdates ?? false));
          setCurrency(data.currency ?? "PKR");
          setLanguage(data.language ?? "English");
          setTimezone(data.timezone ?? "Asia/Karachi");
        }
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
        <p className="text-sm text-neutral-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Settings</p>
            <p className="mt-1 text-sm text-neutral-600">
              Preferences, notifications, and privacy controls.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/account/security"
              className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Security
            </Link>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className={[
                "rounded-2xl px-5 py-3 text-sm font-medium transition",
                saving
                  ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                  : "bg-neutral-900 text-white hover:bg-neutral-800",
              ].join(" ")}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        {saved ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            Settings saved.
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            {error}
          </div>
        ) : null}
      </Card>

      {/* Notifications */}
      <Card>
        <SectionTitle
          title="Notifications"
          desc="Choose how you want to receive updates."
        />

        <div className="mt-6 grid gap-3">
          <Toggle
            title="Order updates via email"
            desc="Shipping confirmations, delivery updates, invoices."
            value={emailOrderUpdates}
            onChange={setEmailOrderUpdates}
          />
          <Toggle
            title="Offers & restocks via email"
            desc="Weekly drops, promotions and back-in-stock alerts."
            value={emailOffers}
            onChange={setEmailOffers}
          />
          <Toggle
            title="WhatsApp updates"
            desc="Fast updates for high-value orders and delivery coordination."
            value={whatsappUpdates}
            onChange={setWhatsappUpdates}
          />
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
          <p className="text-sm font-semibold">Tip</p>
          <p className="mt-2 text-sm text-neutral-600">
            WhatsApp is best for premium shipments that require signature and time coordination.
          </p>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <SectionTitle
          title="Preferences"
          desc="Customize your browsing and checkout experience."
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Select
            label="Currency"
            value={currency}
            onChange={setCurrency}
            options={["AED", "USD", "EUR", "GBP", "SAR"]}
          />
          <Select
            label="Language"
            value={language}
            onChange={setLanguage}
            options={["English", "Arabic", "Urdu"]}
          />
          <Select
            label="Timezone"
            value={timezone}
            onChange={setTimezone}
            options={["Asia/Dubai", "Asia/Karachi", "Europe/London", "America/Chicago"]}
          />
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          Currency and language can be used for display only (based on your setup).
        </p>
      </Card>

      {/* Privacy / Danger zone */}
      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
        <p className="text-sm font-semibold">Privacy & data</p>
        <p className="mt-2 text-sm text-neutral-600">
          Export your account data or request deletion.
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => alert("Data export request (demo). Connect API next.")}
            className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
          >
            Request data export
          </button>

          <button
            type="button"
            onClick={() => {
              const ok = confirm("Are you sure you want to request account deletion?");
              if (ok) alert("Deletion request submitted (demo). Connect API next.");
            }}
            className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Request deletion
          </button>
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          Deletion requests are reviewed by support to prevent accidental loss.
        </p>

        <div className="mt-5">
          <Link href="/contact" className="text-sm font-medium text-neutral-900 hover:underline">
            Contact support →
          </Link>
        </div>
      </div>
    </div>
  );
}
