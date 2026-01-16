"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Fetch } from "@/lib/fetch";

type CouponType = "PERCENT" | "FIXED" | "FREE_SHIPPING";

type AdminCoupon = {
  id: number;
  code: string;
  description?: string | null;
  type: CouponType;
  value: string | number;
  minSubtotal?: string | number | null;
  maxDiscount?: string | number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  usageLimit?: number | null;
  perCustomerLimit?: number | null;
  usedCount?: number | null;
  isActive: boolean;
};

function parseNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function formatDateInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export default function AdminCouponEditPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CouponType>("PERCENT");
  const [value, setValue] = useState("0");
  const [minSubtotal, setMinSubtotal] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [perCustomerLimit, setPerCustomerLimit] = useState("");
  const [usedCount, setUsedCount] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setMsg(null);

    const run = async () => {
      try {
        const res = await Fetch(`/api/admin/coupons?id=${encodeURIComponent(id)}`, {
          auth: true,
          cache: "no-store",
        });

        if (!res.ok) throw new Error(res.error || `Failed to load coupon (${res.status})`);
        const coupon: AdminCoupon = res.data as AdminCoupon;

        setCode(coupon.code ?? "");
        setDescription(coupon.description ?? "");
        setType(coupon.type ?? "PERCENT");
        setValue(String(coupon.value ?? "0"));
        setMinSubtotal(coupon.minSubtotal ? String(coupon.minSubtotal) : "");
        setMaxDiscount(coupon.maxDiscount ? String(coupon.maxDiscount) : "");
        setStartsAt(formatDateInput(coupon.startsAt));
        setEndsAt(formatDateInput(coupon.endsAt));
        setUsageLimit(coupon.usageLimit ? String(coupon.usageLimit) : "");
        setPerCustomerLimit(coupon.perCustomerLimit ? String(coupon.perCustomerLimit) : "");
        setUsedCount(coupon.usedCount ?? 0);
        setIsActive(Boolean(coupon.isActive));
        setLoading(false);
      } catch (e: any) {
        setMsg(e?.message || "Failed to load coupon.");
        setLoading(false);
      }
    };

    run();
  }, [id]);

  async function onSave() {
    setMsg(null);
    if (!id) return setMsg("Invalid coupon id.");
    const normalized = normalizeCode(code);
    if (!normalized) return setMsg("Code is required.");

    const parsedValue = type === "FREE_SHIPPING" ? 0 : parseNumber(value);
    if (type !== "FREE_SHIPPING" && (parsedValue === undefined || parsedValue <= 0)) {
      return setMsg("Value must be greater than 0.");
    }

    setSaving(true);
    try {
      const res = await Fetch(`/api/admin/coupons?id=${encodeURIComponent(id)}`, {
        method: "PUT",
        auth: true,
        data: {
          code: normalized,
          description: description || undefined,
          type,
          value: parsedValue ?? 0,
          minSubtotal: parseNumber(minSubtotal),
          maxDiscount: parseNumber(maxDiscount),
          startsAt: startsAt ? startsAt : null,
          endsAt: endsAt ? endsAt : null,
          usageLimit: parseNumber(usageLimit),
          perCustomerLimit: parseNumber(perCustomerLimit),
          isActive,
        },
      });

      if (!res.ok) throw new Error(res.error || `Failed to save (${res.status})`);
      setMsg("Saved successfully.");
    } catch (err: any) {
      setMsg(err?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white">
        <AdminTopbar title="Edit Coupon" />
        <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
            Loading coupon...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <AdminTopbar title="Edit Coupon" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Coupon details</p>
            <p className="mt-1 text-xs text-neutral-500">
              Update discounts, rules, and availability.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/coupons"
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Back
            </Link>
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
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
              <p className="text-xs font-semibold text-neutral-700">Usage</p>
              <p className="mt-2 text-sm font-semibold text-neutral-900">{usedCount} redeemed</p>
              <p className="mt-1 text-xs text-neutral-500">Counts confirmed order placements.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
