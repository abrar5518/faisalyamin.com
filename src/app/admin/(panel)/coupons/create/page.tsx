"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Fetch } from "@/lib/fetch";

type CouponType = "PERCENT" | "FIXED" | "FREE_SHIPPING";

function parseNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

export default function AdminCouponCreatePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CouponType>("PERCENT");
  const [value, setValue] = useState("10");
  const [minSubtotal, setMinSubtotal] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [perCustomerLimit, setPerCustomerLimit] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSave() {
    setMsg(null);
    const normalized = normalizeCode(code);
    if (!normalized) return setMsg("Code is required.");

    const parsedValue = type === "FREE_SHIPPING" ? 0 : parseNumber(value);
    if (type !== "FREE_SHIPPING" && (parsedValue === undefined || parsedValue <= 0)) {
      return setMsg("Value must be greater than 0.");
    }

    const payload = {
      code: normalized,
      description: description || undefined,
      type,
      value: parsedValue ?? 0,
      minSubtotal: parseNumber(minSubtotal),
      maxDiscount: parseNumber(maxDiscount),
      startsAt: startsAt || undefined,
      endsAt: endsAt || undefined,
      usageLimit: parseNumber(usageLimit),
      perCustomerLimit: parseNumber(perCustomerLimit),
      isActive,
    };

    setSaving(true);
    try {
      const res = await Fetch("/api/admin/coupons", {
        method: "POST",
        auth: true,
        data: payload,
      });

      if (!res.ok) throw new Error(res.error || `Failed to save (${res.status})`);
      setMsg("Saved successfully.");
      router.push("/admin/coupons");
    } catch (err: any) {
      setMsg(err?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white">
      <AdminTopbar title="Create Coupon" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">New coupon</p>
            <p className="mt-1 text-xs text-neutral-500">
              Coupons are applied on cart and checkout totals.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/coupons"
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Cancel
            </Link>
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save coupon"}
            </button>
          </div>
        </div>

        {msg ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            {msg}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Coupon details</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Code</label>
                  <input
                    value={code}
                    onChange={(e) => setCode(normalizeCode(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="SAVE10"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CouponType)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  >
                    <option value="PERCENT">Percentage</option>
                    <option value="FIXED">Fixed amount</option>
                    <option value="FREE_SHIPPING">Free shipping</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">
                    {type === "PERCENT" ? "Percent off" : "Amount off"}
                  </label>
                  <input
                    value={type === "FREE_SHIPPING" ? "0" : value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={type === "FREE_SHIPPING"}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900 disabled:bg-neutral-50"
                    placeholder={type === "PERCENT" ? "10" : "500"}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Max discount (optional)</label>
                  <input
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="2000"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  rows={3}
                  placeholder="Applied on all items above the minimum order."
                />
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Rules</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Minimum order</label>
                  <input
                    value={minSubtotal}
                    onChange={(e) => setMinSubtotal(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Usage limit (optional)</label>
                  <input
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Per-customer limit</label>
                  <input
                    value={perCustomerLimit}
                    onChange={(e) => setPerCustomerLimit(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="1"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                  <span className="text-sm text-neutral-700">Active (can be used)</span>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Schedule</p>
              <p className="mt-1 text-xs text-neutral-500">Optional start and end dates.</p>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Starts at</label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                />
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-700">Ends at</label>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-xs font-semibold text-neutral-700">Quick tips</p>
              <ul className="mt-2 space-y-2 text-xs text-neutral-600">
                <li>Use short codes like SAVE10 or FREESHIP.</li>
                <li>Set a minimum order to protect margins.</li>
                <li>Combine max discount with percentage coupons.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
