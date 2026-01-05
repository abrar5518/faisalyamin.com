"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";

type CustomerDetail = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  createdAt: string;
  notes?: string;

  addresses: Array<{
    label: string;
    line1: string;
    city: string;
    province?: string;
    country: string;
    postalCode?: string;
  }>;

  orders: Array<{
    id: number;
    createdAt: string;
    total: number;
    paymentStatus: string;
    fulfillment: string;
  }>;
};

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const rawParam = (params as { id?: string | string[] }).id;
  const id = typeof rawParam === "string" ? rawParam : Array.isArray(rawParam) ? rawParam[0] : "";
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (!id) {
          if (active) setLoading(false);
          return;
        }
        const res = await fetch(`/api/admin/customers/${encodeURIComponent(id)}`, { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) return;
        if (active) setData(payload?.data ?? null);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const stats = useMemo(() => {
    if (!data) return null;
    return {
      orders: data.orders.length,
      lastOrder: data.orders[0]?.createdAt ?? "-",
    };
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white">
        <AdminTopbar title="Customer" />
        <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
            Loading customer...
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white">
        <AdminTopbar title="Customer" />
        <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
            Customer not found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <AdminTopbar title={`Customer ${data.name}`} />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">{data.name}</p>
            <p className="mt-1 text-xs text-neutral-500">ID: {data.id} | Created: {data.createdAt}</p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/customers"
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Back
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Orders</p>

              <div className="mt-5 divide-y divide-neutral-200">
                {data.orders.length === 0 ? (
                  <div className="py-6 text-sm text-neutral-600">No orders yet.</div>
                ) : (
                  data.orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <p className="text-sm font-semibold">#{o.id}</p>
                        <p className="mt-1 text-xs text-neutral-500">{o.createdAt}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700">
                          PKR {o.total.toLocaleString()}
                        </span>
                        <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs text-white">{o.paymentStatus}</span>
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
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Notes</p>
              <textarea
                defaultValue={data.notes ?? ""}
                className="mt-4 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                rows={4}
                placeholder="Internal notes for customer..."
              />
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Contact</p>
              <p className="mt-3 text-sm text-neutral-700">{data.email ?? "-"}</p>
              <p className="mt-1 text-sm text-neutral-700">{data.phone ?? "-"}</p>
              <p className="mt-1 text-sm text-neutral-700">{data.city ?? "-"}</p>
              <p className="mt-1 text-sm text-neutral-700">{data.country ?? "-"}</p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Stats</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-xs font-semibold">Total orders</p>
                  <p className="mt-1 text-sm text-neutral-700">{stats?.orders}</p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-xs font-semibold">Last order</p>
                  <p className="mt-1 text-sm text-neutral-700">{stats?.lastOrder}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Addresses</p>
              <div className="mt-4 space-y-3">
                {data.addresses.length === 0 ? (
                  <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
                    No saved addresses.
                  </div>
                ) : (
                  data.addresses.map((a, i) => (
                    <div key={i} className="rounded-2xl bg-neutral-50 p-4">
                      <p className="text-xs font-semibold">{a.label}</p>
                      <p className="mt-2 text-sm text-neutral-700">{a.line1}</p>
                      <p className="mt-1 text-sm text-neutral-700">
                        {a.city}{a.province ? `, ${a.province}` : ""} | {a.country}
                      </p>
                      {a.postalCode ? <p className="mt-1 text-xs text-neutral-500">{a.postalCode}</p> : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
