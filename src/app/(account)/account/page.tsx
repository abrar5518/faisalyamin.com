// src/app/(account)/account/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Order = {
  id: number;
  date: string;
  status: "Processing" | "Shipped" | "Cancelled";
  total: number;
  items: number;
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function StatCard({
  title,
  value,
  hint,
  href,
}: {
  title: string;
  value: string;
  hint: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-neutral-700">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
            {value}
          </p>
          <p className="mt-2 text-sm text-neutral-600">{hint}</p>
        </div>
        <span className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white">
          View
        </span>
      </div>
    </Link>
  );
}

function ActionCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-neutral-200 bg-neutral-50 p-6 transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm text-neutral-600">{desc}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-900">
        Open <span className="text-neutral-400">→</span>
      </div>
    </Link>
  );
}

function StatusPill({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], string> = {
    Processing: "border-neutral-200 bg-white text-neutral-700",
    Shipped: "border-neutral-200 bg-neutral-50 text-neutral-900",
    Cancelled: "border-neutral-200 bg-white text-neutral-500",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] ${map[status]}`}>
      {status}
    </span>
  );
}

export default function AccountOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistCount, setWishlistCount] = useState<number | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);
  const [pointValue, setPointValue] = useState<number | null>(null);

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

  useEffect(() => {
    let active = true;
    async function loadWishlist() {
      try {
        const res = await fetch("/api/account/wishlist", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) return;
        if (active) {
          const count = Array.isArray(payload?.data) ? payload.data.length : 0;
          setWishlistCount(count);
        }
      } catch {
        if (active) setWishlistCount(0);
      }
    }
    loadWishlist();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadLoyalty() {
      try {
        const res = await fetch("/api/account/loyalty", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) return;
        if (active) {
          setLoyaltyPoints(payload?.data?.points ?? 0);
          const rule = payload?.data?.settings;
          setPointValue(rule?.currencyPerPoint ?? null);
        }
      } catch {
        if (active) setLoyaltyPoints(0);
      }
    }
    loadLoyalty();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const orderCount = orders.length;
    const totalSpend = orders.reduce((sum, o) => sum + (Number.isFinite(o.total) ? o.total : 0), 0);
    return { orderCount, totalSpend };
  }, [orders]);

  const recent = useMemo(() => orders.slice(0, 3), [orders]);

  return (
    <div className="space-y-6">
      {/* Welcome strip */}
      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Welcome back</p>
            <p className="mt-2 text-sm text-neutral-600">
              Here’s a quick snapshot of your account, orders, and saved items.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/account/orders"
              className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Track an order
            </Link>
            <Link
              href="/categories"
              className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Shop more
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Orders"
          value={loading ? "..." : String(stats.orderCount)}
          hint="Total orders placed"
          href="/account/orders"
        />
        <StatCard
          title="Total spend"
          value={loading ? "..." : `PKR ${stats.totalSpend.toLocaleString()}`}
          hint="Lifetime account value"
          href="/account/orders"
        />
        <StatCard
          title="Points"
          value={loyaltyPoints === null ? "..." : String(loyaltyPoints)}
          hint={
            pointValue
              ? `Worth PKR ${Math.round((loyaltyPoints ?? 0) * pointValue).toLocaleString()}`
              : "Rewards balance"
          }
          href="/account/orders"
        />
        <StatCard
          title="Wishlist"
          value={wishlistCount === null ? "..." : String(wishlistCount)}
          hint="Saved premium pieces"
          href="/account/wishlist"
        />
        <StatCard
          title="Addresses"
          value="2"
          hint="Shipping & billing"
          href="/account/addresses"
        />
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ActionCard
          title="Update profile"
          desc="Keep your contact details and preferences up to date."
          href="/account/profile"
        />
        <ActionCard
          title="Manage addresses"
          desc="Add a new delivery address for faster checkout."
          href="/account/addresses"
        />
        <ActionCard
          title="Security settings"
          desc="Change password and review account security."
          href="/account/security"
        />
      </div>

      {/* Recent orders */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold">Recent orders</p>
            <p className="mt-1 text-sm text-neutral-600">
              Quick view of your latest purchases.
            </p>
          </div>
          <Link href="/account/orders" className="text-sm font-medium text-neutral-900 hover:underline">
            View all
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-200">
          <div className="grid grid-cols-12 bg-neutral-50 px-5 py-3 text-xs font-semibold text-neutral-700">
            <div className="col-span-4">Order</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {recent.map((o) => (
            <Link
              key={o.id}
              href={`/account/orders/${o.id}`}
              className="grid grid-cols-12 items-center px-5 py-4 text-sm transition hover:bg-neutral-50"
            >
              <div className="col-span-4">
                <p className="font-medium text-neutral-900">#{o.id}</p>
                <p className="mt-1 text-xs text-neutral-500">{o.items} item(s)</p>
              </div>

              <div className="col-span-3 text-neutral-600">{formatDate(o.date)}</div>

              <div className="col-span-3">
                <StatusPill status={o.status} />
              </div>

              <div className="col-span-2 text-right font-medium">
                {`PKR ${o.total.toLocaleString()}`}
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile helper */}
        <p className="mt-4 text-xs text-neutral-500">
          Tip: Tap an order to open details, tracking, and invoice.
        </p>
      </div>

      {/* Support strip */}
      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Need help with authentication or delivery?</p>
            <p className="mt-2 text-sm text-neutral-600">
              Our team can verify details, share condition notes, and help with returns.
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
