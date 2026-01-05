// src/app/(account)/account/orders/[id]/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { withImageParams } from "@/lib/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Status = "Pending" | "Paid (Legacy)" | "Confirmed" | "Processing" | "Ready to Ship" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled" | "Refunded";

type OrderItem = {
  id: string;
  name: string;
  subtitle?: string;
  image: string;
  qty: number;
  price: number;
  href?: string;
};

type Order = {
  id: number;
  date: string; // ISO
  status: Status;
  statusRaw?: string;
  trackingId?: string;
  courierName?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  adminNotes?: string;
  tracking?: { carrier: string; number: string; url?: string };
  shippingAddress: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    country: string;
  };
  payment: {
    method: "Cash on delivery" | "Card" | "Crypto";
    subtotal: number;
    shipping: number;
    discount?: number;
    total: number;
  };
  items: OrderItem[];
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] text-neutral-700">
      {children}
    </span>
  );
}

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, string> = {
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
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${map[status]}`}>
      {status}
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      {children}
    </div>
  );
}

function StatusTimeline({ status, order }: { status: Status; order: Order | null }) {
  const statusOrder = [
    "Pending", "Paid (Legacy)", "Confirmed", "Processing", "Ready to Ship", 
    "Shipped", "Out for Delivery", "Delivered"
  ];
  const currentIndex = statusOrder.indexOf(status);
  const previousStatus = currentIndex > 0 ? statusOrder[currentIndex - 1] : null;

  return (
    <div className="mt-5">
      {/* Compact Status Bar */}
      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3">
        {/* Current Status */}
        <div className="flex items-center gap-2 flex-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <span className="text-sm">✓</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-neutral-500">Status</p>
            <p className="text-sm font-semibold text-neutral-900 truncate">{status}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-neutral-200" />

        {/* Previous Status */}
        {previousStatus ? (
          <div className="flex items-center gap-2 flex-1">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-neutral-100">
              <span className="text-xs text-neutral-500">✓</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-neutral-400">Previous</p>
              <p className="text-xs font-medium text-neutral-600 truncate">{previousStatus}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-neutral-400">First status</p>
            </div>
          </div>
        )}

        {/* Date */}
        <div className="hidden sm:flex items-center gap-2 flex-1">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center">
            <span className="text-sm">📅</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-neutral-400">Updated</p>
            <p className="text-xs font-medium text-neutral-600 truncate">{formatDate(order?.date || "")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  const params = useParams();
  const rawParam = (params as { slug?: string | string[] }).slug;
  const orderId = typeof rawParam === "string" ? rawParam : Array.isArray(rawParam) ? rawParam[0] : "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (!orderId) {
          if (active) setLoading(false);
          return;
        }
        const res = await fetch(`/api/account/orders/${encodeURIComponent(orderId)}`, {
          cache: "no-store",
        });
        const payload = await res.json();
        if (!res.ok) return;

        const data = payload?.data;
        if (!data) return;

        const mapped: Order = {
          id: data.id,
          date: data.createdAt,
          status: data.status,
          statusRaw: data.statusRaw,
          trackingId: data.trackingId,
          courierName: data.courierName,
          estimatedDelivery: data.estimatedDelivery,
          deliveredAt: data.deliveredAt,
          adminNotes: data.adminNotes,
          tracking: data.tracking ?? undefined,
          shippingAddress: {
            name: data.customer?.name ?? "-",
            phone: data.customer?.phone ?? "-",
            line1: data.customer?.address1 ?? "-",
            line2: data.customer?.address2 ?? undefined,
            city: data.customer?.city ?? "-",
            country: data.customer?.country ?? "-",
          },
          payment: {
            method: data.paymentMethod ?? "Cash on delivery",
            subtotal: Number(data.subtotal ?? 0),
            shipping: Number(data.shipping ?? 0),
            total: Number(data.total ?? 0),
          },
          items: Array.isArray(data.items)
            ? data.items.map((item: any) => ({
                id: String(item.id),
                name: item.name,
                image: item.image,
                qty: item.qty,
                price: Number(item.price ?? 0),
                href: item.slug ? `/product/${item.slug}` : undefined,
              }))
            : [],
        };

        if (active) setOrder(mapped);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [orderId]);

  const canTrack = Boolean(order?.tracking?.number);

  const copyTracking = async () => {
    if (!order?.tracking?.number) return;
    try {
      await navigator.clipboard.writeText(order.tracking.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const status: Status = order?.status ?? "Processing";

  const title = useMemo(() => {
    if (!order) return "Order not found";
    return `Order ${order.id}`;
  }, [order]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="text-sm font-semibold">Loading order...</p>
          <p className="mt-2 text-sm text-neutral-600">Fetching your order details.</p>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="text-sm font-semibold">Order not found</p>
          <p className="mt-2 text-sm text-neutral-600">
            We couldn’t locate that order. Please go back to orders and try again.
          </p>
          <div className="mt-6 flex gap-2">
            <Link
              href="/account/orders"
              className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Back to orders
            </Link>
            <Link
              href="/contact"
              className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Contact support
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill>Order</Pill>
              <StatusPill status={status} />
              <Pill>{formatDate(order.date)}</Pill>
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Track shipping, review items, and download invoice.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/account/orders"
              className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Back to orders
            </Link>

            <button
              type="button"
              onClick={() => alert("Invoice download (demo). Connect API next.")}
              className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Download invoice
            </button>
          </div>
        </div>

        {status !== "Cancelled" && status !== "Refunded" ? <StatusTimeline status={status} order={order} /> : null}

        {/* Tracking & Delivery Info - Complete Professional Design */}
        {(order.trackingId || order.estimatedDelivery || order.deliveredAt || order.adminNotes) && (
          <div className="mt-3 space-y-2">
            {/* Inline Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
            {/* Tracking ID */}
            {order.trackingId && (
              <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2">
                <span className="text-sm">🚚</span>
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-xs text-neutral-400">Tracking</p>
                    <p className="text-xs font-semibold text-neutral-900">{order.trackingId}</p>
                  </div>
                  {order.courierName && (
                    <>
                      <div className="h-4 w-px bg-neutral-200" />
                      <p className="text-xs text-neutral-500">{order.courierName}</p>
                    </>
                  )}
                </div>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(order.trackingId!);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    } catch {}
                  }}
                  className="ml-2 rounded-md bg-neutral-100 px-2 py-1 text-xs hover:bg-neutral-200"
                >
                  {copied ? "✓" : "Copy"}
                </button>
              </div>
            )}

            {/* Estimated Delivery */}
            {order.estimatedDelivery && !order.deliveredAt && (
              <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2">
                <span className="text-sm">📦</span>
                <div>
                  <p className="text-xs text-neutral-400">Est. Delivery</p>
                  <p className="text-xs font-semibold text-neutral-900">{formatDate(order.estimatedDelivery)}</p>
                </div>
              </div>
            )}

            {/* Delivered */}
            {order.deliveredAt && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                <span className="text-sm">✅</span>
                <div>
                  <p className="text-xs text-green-600">Delivered</p>
                  <p className="text-xs font-semibold text-green-900">{formatDate(order.deliveredAt)}</p>
                </div>
              </div>
            )}
            </div>

            {/* Admin Notes - If Present */}
            {order.adminNotes && (
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                <div className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">💬</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-900">Order Note</p>
                    <p className="mt-1 text-xs text-blue-800 leading-relaxed">{order.adminNotes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {order.tracking ? (
          <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Tracking</p>
                <p className="mt-1 text-sm text-neutral-600">
                  {order.tracking.carrier} • {order.tracking.number}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyTracking}
                  className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
                >
                  {copied ? "Copied" : "Copy"}
                </button>

                {canTrack ? (
                  <a
                    href={order.tracking.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    Track
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Items */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-sm font-semibold">Items</p>
                <p className="mt-1 text-sm text-neutral-600">
                  Review what you purchased.
                </p>
              </div>
              <Link href="/shop" className="text-sm font-medium text-neutral-900 hover:underline">
                Shop more
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {order.items.map((it) => (
                <div key={it.id} className="flex gap-4 rounded-3xl border border-neutral-200 bg-white p-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
                    <Image
                      src={withImageParams(
                        it.image || "/images/shopping.jpg",
                        "auto=format&fit=crop&w=500&q=85"
                      )}
                      alt={it.name}
                      width={500}
                      height={500}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={it.href ?? `/product/${it.id}`}
                      className="line-clamp-1 text-sm font-semibold hover:underline"
                    >
                      {it.name}
                    </Link>
                    {it.subtitle ? (
                      <p className="mt-1 text-sm text-neutral-600">{it.subtitle}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-neutral-500">
                      Qty: <span className="font-medium text-neutral-900">{it.qty}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold">{`PKR ${it.price.toLocaleString()}`}</p>
                    <p className="mt-1 text-xs text-neutral-500">Insured shipping</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Support */}
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
            <p className="text-sm font-semibold">Authenticity & condition notes</p>
            <p className="mt-2 text-sm text-neutral-600">
              Need box/papers verification, condition photos, or service history? Share your order ID with support.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
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
                Back to orders
              </Link>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping address */}
          <Card>
            <p className="text-sm font-semibold">Shipping address</p>
            <p className="mt-3 text-sm text-neutral-900 font-medium">{order.shippingAddress.name}</p>
            <p className="mt-1 text-sm text-neutral-600">{order.shippingAddress.phone}</p>

            <div className="mt-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-sm text-neutral-700">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 ? (
                <p className="mt-1 text-sm text-neutral-600">{order.shippingAddress.line2}</p>
              ) : null}
              <p className="mt-2 text-sm text-neutral-600">
                {order.shippingAddress.city}, {order.shippingAddress.country}
              </p>
            </div>

            <div className="mt-5">
              <Link href="/account/addresses" className="text-sm font-medium text-neutral-900 hover:underline">
                Manage addresses →
              </Link>
            </div>
          </Card>

          {/* Payment summary */}
          <Card>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-sm font-semibold">Payment summary</p>
                <p className="mt-1 text-sm text-neutral-600">
                  Method: <span className="font-medium text-neutral-900">{order.payment.method}</span>
                </p>
              </div>
              <Pill>Secure</Pill>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium">
                  {`PKR ${order.payment.subtotal.toLocaleString()}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Shipping</span>
                <span className="font-medium">
                  {`PKR ${order.payment.shipping.toLocaleString()}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Discount</span>
                <span className="font-medium">
                  {order.payment.discount ? `PKR ${order.payment.discount.toLocaleString()}` : "—"}
                </span>
              </div>

              <div className="my-4 border-t border-neutral-200" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-lg font-semibold">
                  {`PKR ${order.payment.total.toLocaleString()}`}
                </span>
              </div>

              <p className="text-xs text-neutral-500">
                Taxes/duties may apply depending on destination.
              </p>
            </div>
          </Card>

          {/* Quick actions */}
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
            <p className="text-sm font-semibold">Quick actions</p>
            <div className="mt-4 grid gap-2">
              <Link
                href="/account/orders"
                className="rounded-2xl bg-neutral-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
              >
                Track order
              </Link>
              <button
                type="button"
                onClick={() => alert("Return request (demo). Connect API next.")}
                className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
              >
                Request return
              </button>
              <button
                type="button"
                onClick={() => alert("Support ticket (demo). Connect API next.")}
                className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
              >
                Open support ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

