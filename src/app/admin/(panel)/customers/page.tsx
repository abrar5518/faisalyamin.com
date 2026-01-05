"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";

type CustomerRow = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  createdAt: string;
};

function clampInt(v: any, fallback: number, min: number, max: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

export default function AdminCustomersPage() {
  const [all, setAll] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((c) => {
      if (!needle) return true;
      return (
        String(c.id).toLowerCase().includes(needle) ||
        c.name.toLowerCase().includes(needle) ||
        (c.email ?? "").toLowerCase().includes(needle) ||
        (c.phone ?? "").toLowerCase().includes(needle)
      );
    });
  }, [all, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = clampInt(page, 1, 1, totalPages);

  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const rows = filtered.slice(start, end);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/customers", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) return;

        const data = Array.isArray(payload?.data) ? payload.data : [];
        const mapped = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email ?? undefined,
          phone: c.phone ?? undefined,
          city: c.city ?? undefined,
          country: c.country ?? undefined,
          totalOrders: c.totalOrders ?? 0,
          totalSpent: Number(c.totalSpent ?? 0),
          lastOrderAt: c.lastOrderAt ?? undefined,
          createdAt: c.createdAt,
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
      <AdminTopbar title="Customers" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Customers</p>
            <p className="mt-1 text-xs text-neutral-500">Customer profiles, order history, and contact data.</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-neutral-900" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
              placeholder="Search by name, email, phone, or ID"
              type="search"
            />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-4">
            <p className="text-sm font-semibold">
              {loading ? (
                "Loading customers..."
              ) : (
                <>
                  Showing <span className="text-neutral-600">{start + 1}-{Math.min(end, total)}</span> of{" "}
                  <span className="text-neutral-600">{total}</span>
                </>
              )}
            </p>
            <p className="text-xs text-neutral-500">Page {safePage} of {totalPages}</p>
          </div>

          <div className="divide-y divide-neutral-200">
            {rows.map((c) => (
              <div key={c.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {c.email ?? "-"} | {c.phone ?? "-"} | {c.city ?? "-"} | ID: {c.id}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700">
                    Orders: {c.totalOrders}
                  </span>
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700">
                    Spent: PKR {c.totalSpent.toLocaleString()}
                  </span>
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700">
                    Last: {c.lastOrderAt ?? "-"}
                  </span>

                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-neutral-200 bg-white px-5 py-4">
            <p className="text-xs text-neutral-500">Tip: Customers with high repeat orders are your VIP segment.</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className={[
                  "rounded-xl border px-4 py-2 text-sm",
                  safePage === 1 ? "border-neutral-200 text-neutral-400" : "border-neutral-200 hover:bg-neutral-50",
                ].join(" ")}
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className={[
                  "rounded-xl border px-4 py-2 text-sm",
                  safePage === totalPages ? "border-neutral-200 text-neutral-400" : "border-neutral-200 hover:bg-neutral-50",
                ].join(" ")}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
