// src/app/(account)/account/orders/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Status = "All" | "Pending" | "Paid (Legacy)" | "Confirmed" | "Processing" | "Ready to Ship" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled" | "Refunded";

type Order = {
  id: number;
  date: string; // ISO
  status: Exclude<Status, "All">;
  total: number;
  items: number;
  destination: string;
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function StatusPill({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], string> = {
    "Pending": "border-yellow-200 bg-yellow-50 text-yellow-700",
    "Paid (Legacy)": "border-amber-200 bg-amber-50 text-amber-700",
    "Confirmed": "border-blue-200 bg-blue-50 text-blue-700",
    "Processing": "border-purple-200 bg-purple-50 text-purple-700",
    "Ready to Ship": "border-orange-200 bg-orange-50 text-orange-700",
    "Shipped": "border-cyan-200 bg-cyan-50 text-cyan-700",
    "Out for Delivery": "border-teal-200 bg-teal-50 text-teal-700",
    "Delivered": "border-green-200 bg-green-50 text-green-700",
    "Cancelled": "border-red-200 bg-red-50 text-red-700",
    "Refunded": "border-neutral-200 bg-neutral-50 text-neutral-700",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] ${map[status]}`}>
      {status}
    </span>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: Status;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-4 py-2 text-sm transition",
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white hover:bg-neutral-50",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status>("All");

  // simple pagination UI
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return orders.filter((o) => {
      const matchStatus = status === "All" ? true : o.status === status;
      const matchQuery =
        !query ||
        String(o.id).toLowerCase().includes(query) ||
        o.destination.toLowerCase().includes(query) ||
        String(o.total).toLowerCase().includes(query);

      return matchStatus && matchQuery;
    });
  }, [q, status, orders]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [q, status]);

  const empty = filtered.length === 0;

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/account/orders", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) return;

        const data = Array.isArray(payload?.data) ? payload.data : [];
        const mapped = data.map((o: any) => ({
          id: o.id,
          date: o.createdAt,
          status: o.status,
          total: Number(o.total ?? 0),
          items: o.itemsCount ?? 0,
          destination: o.destination || "-",
        }));

        if (active) setOrders(mapped);
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
    <div className="space-y-6">
      {/* Top controls */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Your orders</p>
            <p className="mt-1 text-sm text-neutral-600">
              Search by order ID, destination, or total.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/account/orders"
              className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Track order
            </Link>
            <Link
              href="/shop"
              className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Shop more
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-12">
          {/* Search */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-neutral-900" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                placeholder="Search: LS-10294, Dubai, AED 52,500…"
              />
              <button
                type="button"
                onClick={() => setQ("")}
                className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium hover:bg-neutral-50"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="lg:col-span-5">
            <div className="flex flex-wrap gap-2">
              {(["All", "Pending", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"] as Status[]).map((s) => (
                <FilterPill
                  key={s}
                  label={s}
                  active={status === s}
                  onClick={() => setStatus(s)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-0 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 bg-neutral-50 px-6 py-4">
          <p className="text-sm font-semibold">Order history</p>
          <p className="text-xs text-neutral-500">
            {loading ? "Loading orders..." : `Showing ${filtered.length} result(s)`}
          </p>
        </div>

        {empty ? (
          <div className="p-10 text-center">
            <p className="text-lg font-semibold">No orders found</p>
            <p className="mt-2 text-sm text-neutral-600">
              Try a different search or clear filters.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setStatus("All");
                  setPage(1);
                }}
                className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Reset
              </button>
              <Link
                href="/shop"
                className="rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium hover:bg-neutral-50"
              >
                Shop now
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop header */}
            <div className="hidden grid-cols-12 px-6 py-3 text-xs font-semibold text-neutral-700 sm:grid border-b border-neutral-200">
              <div className="col-span-3">Order</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-3">Destination</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-neutral-200">
              {paged.map((o) => (
                <Link
                  key={o.id}
                  href={`/account/orders/${o.id}`}
                  className="block px-6 py-5 transition hover:bg-neutral-50"
                >
                  <div className="grid items-center gap-3 sm:grid-cols-12">
                    <div className="sm:col-span-3">
                      <p className="text-sm font-semibold text-neutral-900">{o.id}</p>
                      <p className="mt-1 text-xs text-neutral-500">{o.items} item(s)</p>
                    </div>

                    <div className="sm:col-span-2 text-sm text-neutral-600">
                      {formatDate(o.date)}
                    </div>

                    <div className="sm:col-span-3 text-sm text-neutral-600">
                      {o.destination}
                    </div>

                    <div className="sm:col-span-2">
                      <StatusPill status={o.status} />
                    </div>

                    <div className="sm:col-span-2 text-right text-sm font-medium">
                      {`PKR ${o.total.toLocaleString()}`}
                    </div>

                    {/* Mobile hint */}
                    <div className="sm:hidden text-xs text-neutral-500">
                      Tap to open order details →
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-3 border-t border-neutral-200 bg-white px-6 py-4">
              <p className="text-xs text-neutral-500">
                Page <span className="font-medium text-neutral-900">{page}</span> of{" "}
                <span className="font-medium text-neutral-900">{totalPages}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={[
                    "rounded-2xl border px-4 py-2 text-sm font-medium transition",
                    page <= 1
                      ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                      : "border-neutral-200 bg-white hover:bg-neutral-50",
                  ].join(" ")}
                >
                  Prev
                </button>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className={[
                    "rounded-2xl border px-4 py-2 text-sm font-medium transition",
                    page >= totalPages
                      ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                      : "border-neutral-200 bg-white hover:bg-neutral-50",
                  ].join(" ")}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Support strip */}
      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Need invoice or authenticity papers?</p>
            <p className="mt-2 text-sm text-neutral-600">
              Contact support with your order ID and we’ll help immediately.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/contact"
              className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Contact support
            </Link>
            <Link
              href="/account/orders"
              className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Track order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

