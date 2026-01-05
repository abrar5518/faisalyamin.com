"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Fetch } from "@/lib/fetch";

type OrderRow = {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone?: string;
  total: string;
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  fulfillment: "unfulfilled" | "processing" | "shipped" | "delivered" | "cancelled";
  itemsCount: number;
};

function clampInt(v: any, fallback: number, min: number, max: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setMsg(null);
      const res = await Fetch<OrderRow[]>("/api/admin/orders", { auth: true });
      if (!alive) return;
      if (!res.ok) {
        setMsg(res.error || "Failed to load orders");
        setRows([]);
      } else {
        setRows((res.data as OrderRow[]) ?? []);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const [q, setQ] = useState("");
  const [pay, setPay] = useState<"all" | OrderRow["paymentStatus"]>("all");
  const [ful, setFul] = useState<"all" | OrderRow["fulfillment"]>("all");
  const [page, setPage] = useState(1);

  const pageSize = 12;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((o) => {
      const okQ = !needle || o.id.toLowerCase().includes(needle) || o.customerName.toLowerCase().includes(needle);
      const okPay = pay === "all" ? true : o.paymentStatus === pay;
      const okFul = ful === "all" ? true : o.fulfillment === ful;
      return okQ && okPay && okFul;
    });
  }, [rows, q, pay, ful]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = clampInt(page, 1, 1, totalPages);

  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = filtered.slice(start, end);

  return (
    <div className="bg-white">
      <AdminTopbar title="Orders" />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Orders</p>
            <p className="mt-1 text-xs text-neutral-500">Track payments, fulfillment, and customer delivery.</p>
          </div>
        </div>

        {msg ? (
          <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            {msg}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 rounded-3xl border border-neutral-200 bg-white p-4 sm:grid-cols-12">
          <div className="sm:col-span-6">
            <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-neutral-900" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                placeholder="Search by order ID or customer…"
                type="search"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <select
              value={pay}
              onChange={(e) => {
                setPay(e.target.value as any);
                setPage(1);
              }}
              className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
            >
              <option value="all">Payment: All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={ful}
              onChange={(e) => {
                setFul(e.target.value as any);
                setPage(1);
              }}
              className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
            >
              <option value="all">Fulfillment: All</option>
              <option value="unfulfilled">Unfulfilled</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
            Loading orders...
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-4">
            <p className="text-sm font-semibold">
              Showing <span className="text-neutral-600">{start + 1}–{Math.min(end, total)}</span> of{" "}
              <span className="text-neutral-600">{total}</span>
            </p>
            <p className="text-xs text-neutral-500">Page {safePage} of {totalPages}</p>
          </div>

          <div className="divide-y divide-neutral-200">
            {pageRows.map((o) => (
              <div key={o.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">{o.id}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {o.createdAt} • {o.customerName} • Items: {o.itemsCount}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700">
                    {o.total}
                  </span>
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs",
                      o.paymentStatus === "paid"
                        ? "bg-neutral-900 text-white"
                        : o.paymentStatus === "pending"
                        ? "bg-neutral-100 text-neutral-800"
                        : "bg-neutral-50 text-neutral-600 border border-neutral-200",
                    ].join(" ")}
                  >
                    {o.paymentStatus}
                  </span>
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700">
                    {o.fulfillment}
                  </span>

                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-neutral-200 bg-white px-5 py-4">
            <p className="text-xs text-neutral-500">Tip: Mark shipped orders quickly to reduce support tickets.</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className={[
                  "rounded-xl border px-4 py-2 text-sm",
                  safePage === 1
                    ? "border-neutral-200 text-neutral-400"
                    : "border-neutral-200 hover:bg-neutral-50",
                ].join(" ")}
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className={[
                  "rounded-xl border px-4 py-2 text-sm",
                  safePage === totalPages
                    ? "border-neutral-200 text-neutral-400"
                    : "border-neutral-200 hover:bg-neutral-50",
                ].join(" ")}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
