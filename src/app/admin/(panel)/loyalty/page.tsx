"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Fetch } from "@/lib/fetch";

type LoyaltySettings = {
  enabled: boolean;
  pointsPerCurrency: number;
  currencyPerPoint: number;
  minRedeemPoints: number;
  maxRedeemPercent: number;
};

function toNumber(value: string, fallback = 0) {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : fallback;
}

export default function AdminLoyaltyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [enabled, setEnabled] = useState(true);
  const [pointsPerCurrency, setPointsPerCurrency] = useState("0.01");
  const [currencyPerPoint, setCurrencyPerPoint] = useState("0.05");
  const [minRedeemPoints, setMinRedeemPoints] = useState("100");
  const [maxRedeemPercent, setMaxRedeemPercent] = useState("50");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setMsg(null);
      const res = await Fetch("/api/admin/loyalty-settings", { auth: true, cache: "no-store" });
      if (!active) return;
      if (res.ok && res.data) {
        const data = res.data as LoyaltySettings;
        setEnabled(Boolean(data.enabled));
        setPointsPerCurrency(String(data.pointsPerCurrency ?? 0.01));
        setCurrencyPerPoint(String(data.currencyPerPoint ?? 0.05));
        setMinRedeemPoints(String(data.minRedeemPoints ?? 100));
        setMaxRedeemPercent(String(data.maxRedeemPercent ?? 50));
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function save() {
    setMsg(null);
    setSaving(true);
    try {
      const payload = {
        enabled,
        pointsPerCurrency: toNumber(pointsPerCurrency, 0),
        currencyPerPoint: toNumber(currencyPerPoint, 0),
        minRedeemPoints: Math.max(0, Math.floor(toNumber(minRedeemPoints, 0))),
        maxRedeemPercent: Math.min(100, Math.max(0, Math.floor(toNumber(maxRedeemPercent, 0)))),
      };

      const res = await Fetch("/api/admin/loyalty-settings", {
        method: "PUT",
        auth: true,
        data: payload,
      });

      if (!res.ok) throw new Error(res.error || `Failed (${res.status})`);
      setMsg("Loyalty settings updated.");
    } catch (e: any) {
      setMsg(e?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white">
      <AdminTopbar title="Loyalty" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Loyalty settings</p>
            <p className="mt-1 text-xs text-neutral-500">
              Configure how points are earned and redeemed at checkout.
            </p>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>

        {msg ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            {msg}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            Loading settings...
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Earning rules</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Points per 1 PKR</label>
                  <input
                    value={pointsPerCurrency}
                    onChange={(e) => setPointsPerCurrency(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="0.01"
                  />
                  <p className="mt-2 text-xs text-neutral-500">
                    Example: 0.01 means 100 PKR = 1 point.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Value per point (PKR)</label>
                  <input
                    value={currencyPerPoint}
                    onChange={(e) => setCurrencyPerPoint(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="0.05"
                  />
                  <p className="mt-2 text-xs text-neutral-500">
                    Example: 0.05 means 100 points = 5 PKR.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Redemption rules</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Minimum points to redeem</label>
                  <input
                    value={minRedeemPoints}
                    onChange={(e) => setMinRedeemPoints(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700">Max redeem % of subtotal</label>
                  <input
                    value={maxRedeemPercent}
                    onChange={(e) => setMaxRedeemPercent(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="50"
                  />
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Loyalty status</p>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3">
                <p className="text-sm text-neutral-700">Enabled</p>
                <button
                  type="button"
                  onClick={() => setEnabled((v) => !v)}
                  className={[
                    "h-8 w-14 rounded-full border transition",
                    enabled ? "border-neutral-900 bg-neutral-900" : "border-neutral-200 bg-neutral-100",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "block h-7 w-7 rounded-full bg-white transition",
                      enabled ? "translate-x-6" : "translate-x-0",
                    ].join(" ")}
                  />
                </button>
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                Disable to pause earning and redemption site-wide.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-xs font-semibold text-neutral-700">Examples</p>
              <ul className="mt-2 space-y-2 text-xs text-neutral-600">
                <li>100 PKR = 1 point → set points per 1 PKR = 0.01</li>
                <li>100 points = 5 PKR → set value per point = 0.05</li>
                <li>1 point = 1 PKR → set value per point = 1</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
