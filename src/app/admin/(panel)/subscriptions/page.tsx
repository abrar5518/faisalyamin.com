"use client";

import { useEffect, useMemo, useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";

type SubscriberRow = {
  id: number;
  email: string;
  name?: string;
  source?: string;
  ip?: string;
  userAgent?: string;
  isActive: boolean;
  createdAt: string;
};

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

export default function AdminSubscriptionsPage() {
  const [all, setAll] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((s) => {
      if (!needle) return true;
      return (
        s.email.toLowerCase().includes(needle) ||
        (s.name ?? "").toLowerCase().includes(needle) ||
        (s.source ?? "").toLowerCase().includes(needle) ||
        (s.ip ?? "").toLowerCase().includes(needle)
      );
    });
  }, [all, q]);

  const total = filtered.length;
  const activeCount = filtered.filter((s) => s.isActive).length;

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/subscriptions", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) return;

        const data = Array.isArray(payload?.data) ? payload.data : [];
        const mapped = data.map((s: any) => ({
          id: s.id,
          email: s.email,
          name: s.name ?? undefined,
          source: s.source ?? undefined,
          ip: s.ip ?? undefined,
          userAgent: s.userAgent ?? undefined,
          isActive: Boolean(s.isActive),
          createdAt: s.createdAt,
        }));
        if (active) setAll(mapped);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-white">
      <AdminTopbar title="Subscriptions" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Newsletter subscriptions</p>
            <p className="mt-1 text-xs text-neutral-500">
              Collect and manage marketing emails from the footer signup form.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
            <span className="rounded-full border border-neutral-200 bg-white px-3 py-1">
              Total: {loading ? "-" : total}
            </span>
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1">
              Active: {loading ? "-" : activeCount}
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-neutral-900" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
              placeholder="Search by email, name, source, or IP"
              type="search"
            />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-4">
            <p className="text-sm font-semibold">
              {loading ? "Loading subscriptions..." : `Showing ${total} subscribers`}
            </p>
            <p className="text-xs text-neutral-500">Sorted by newest</p>
          </div>

          <div className="divide-y divide-neutral-200">
            {filtered.map((s) => (
              <div key={s.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{s.email}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {s.name ?? "-"} | Source: {s.source ?? "-"} | IP: {s.ip ?? "-"}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400 break-all">
                    {s.userAgent ?? "-"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span
                    className={[
                      "rounded-full border px-3 py-1 text-xs",
                      s.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-neutral-200 bg-neutral-50 text-neutral-600",
                    ].join(" ")}
                  >
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700">
                    {formatDate(s.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
