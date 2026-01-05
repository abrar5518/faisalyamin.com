// src/app/(account)/account/profile/page.tsx
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

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
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
        rows={4}
        className="mt-2 w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900/10"
      />
    </label>
  );
}

function MiniPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] text-neutral-700">
      {children}
    </span>
  );
}

export default function AccountProfilePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const canSave = useMemo(() => {
    return (
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      email.trim().length > 3 &&
      phone.trim().length >= 7
    );
  }, [firstName, lastName, email, phone]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          country,
          city,
          company,
          notes,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error ?? "Save failed");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err?.message ?? "Could not save changes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/account/profile", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) return;

        const profile = payload?.data?.profile;
        const user = payload?.data;

        if (active) {
          setFirstName(profile?.firstName ?? "");
          setLastName(profile?.lastName ?? "");
          setEmail(user?.email ?? "");
          setPhone(profile?.phone ?? "");
          setCountry(profile?.country ?? "");
          setCity(profile?.city ?? "");
          setCompany(profile?.company ?? "");
          setNotes(profile?.notes ?? "");
        }
      } finally {
        if (active) setLoadingProfile(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loadingProfile) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Main form */}
      <div className="lg:col-span-8 space-y-6">
        <Card>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold">Profile details</p>
              <p className="mt-1 text-sm text-neutral-600">
                Keep your contact info up to date for smooth delivery and support.
              </p>
            </div>

            <Link
              href="/account/security"
              className="text-sm font-medium text-neutral-900 hover:underline"
            >
              Security →
            </Link>
          </div>

          {saved ? (
            <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              Saved successfully ✅
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSave} className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" value={firstName} onChange={setFirstName} required />
              <Field label="Last name" value={lastName} onChange={setLastName} required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" value={email} onChange={setEmail} type="email" required />
              <Field label="Phone" value={phone} onChange={setPhone} required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Country" value={country} onChange={setCountry} />
              <Field label="City" value={city} onChange={setCity} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company (optional)" value={company} onChange={setCompany} />
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold">Delivery preferences</p>
                <p className="mt-1 text-xs text-neutral-600">
                  Add notes for packaging, timing, and contact method.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <MiniPill>WhatsApp</MiniPill>
                  <MiniPill>Express</MiniPill>
                  <MiniPill>Signature</MiniPill>
                </div>
              </div>
            </div>

            <TextArea
              label="Notes (optional)"
              value={notes}
              onChange={setNotes}
              placeholder="Any instructions for delivery or support…"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-neutral-500">
                Changes apply to future orders and checkout defaults.
              </p>

              <button
                disabled={!canSave || loading}
                className={[
                  "rounded-2xl px-6 py-4 text-sm font-medium transition",
                  !canSave || loading
                    ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                    : "bg-neutral-900 text-white hover:bg-neutral-800",
                ].join(" ")}
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </Card>

        {/* Secondary info */}
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
          <p className="text-sm font-semibold">Tip</p>
          <p className="mt-2 text-sm text-neutral-600">
            For high-value shipments, ensure your phone number is reachable and your delivery address includes
            building, floor, and a clear landmark.
          </p>
        </div>
      </div>

      {/* Right column */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold">Account status</p>
          <p className="mt-2 text-sm text-neutral-600">
            Your account is active and ready for purchases.
          </p>

          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold">Email verification</p>
              <p className="mt-1 text-xs text-neutral-600">Verified</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold">Preferred shipping</p>
              <p className="mt-1 text-xs text-neutral-600">Express (24–48 hours)</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold">Support channel</p>
              <p className="mt-1 text-xs text-neutral-600">WhatsApp + Email</p>
            </div>
          </div>

          <div className="mt-6 grid gap-2">
            <Link
              href="/account/addresses"
              className="rounded-2xl bg-neutral-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
            >
              Manage addresses
            </Link>
            <Link
              href="/account/orders"
              className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-center text-sm font-medium hover:bg-neutral-50"
            >
              View orders
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
          <p className="text-sm font-semibold">Privacy</p>
          <p className="mt-2 text-sm text-neutral-600">
            You can request account data export or deletion from settings.
          </p>
          <div className="mt-4">
            <Link href="/account/settings" className="text-sm font-medium text-neutral-900 hover:underline">
              Open settings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
