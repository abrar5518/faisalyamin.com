"use client";

import Link from "next/link";
import Image from "next/image";
import { withImageParams } from "@/lib/image";
import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Fetch } from "@/lib/fetch";

type OrderDetail = {
  id: string;
  createdAt: string;

  customer: {
    name: string;
    email?: string;
    phone?: string;
  };

  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    province?: string;
    country: string;
    postalCode?: string;
  };

  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  fulfillment: "unfulfilled" | "processing" | "shipped" | "delivered" | "cancelled";

  totals: {
    subtotal: string;
    shipping: string;
    discount: string;
    total: string;
  };

  items: Array<{
    productId: string;
    name: string;
    price: string;
    qty: number;
    image: string;
    isDropship: boolean;
    variantLabel?: string;
    sizeLabel?: string;
  }>;

  status: "PENDING" | "PAID" | "CONFIRMED" | "PROCESSING" | "READY_TO_SHIP" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  trackingId?: string;
  courierName?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  adminNotes?: string;
  notes?: string;
};

export default function AdminOrderDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const pathname = usePathname();
  const idFromParams = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const idFromPath = pathname.split("/").filter(Boolean).pop();
  const id = idFromParams || idFromPath;

  const [data, setData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderDetail["status"]>("PENDING");
  const [trackingId, setTrackingId] = useState("");
  const [courierName, setCourierName] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!id) {
      setError("Invalid order id");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setMsg(null);
    const res = await Fetch<OrderDetail>(`/api/admin/orders/${id}`, { auth: true, cache: "no-store" });
    if (!res.ok) {
      setError(res.error || "Failed to load order");
      setLoading(false);
      return;
    }
    const orderData = res.data as OrderDetail;
    setData(orderData);
    setStatus(orderData?.status ?? "PENDING");
    setTrackingId(orderData?.trackingId ?? "");
    setCourierName(orderData?.courierName ?? "");
    setEstimatedDelivery(orderData?.estimatedDelivery ?? "");
    setAdminNotes(orderData?.adminNotes ?? "");
    setLoading(false);
  }, [id]);

  useEffect(() => {
    // Data load on mount; lint rule is overly strict for this case.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrder();
  }, [loadOrder]);

  if (loading) {
    return (
      <div className="bg-white">
        <AdminTopbar title="Order" />
        <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
            Loading order...
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white">
        <AdminTopbar title="Order" />
        <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error || "Order not found."}
          </div>
          <div className="mt-6">
            <Link
              href="/admin/orders"
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <AdminTopbar title={`Order ${data.id}`} />

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">{data.id}</p>
            <p className="mt-1 text-xs text-neutral-500">{data.createdAt}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/orders"
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Back
            </Link>
          </div>
        </div>

        {msg ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            {msg}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Items</p>

              <div className="mt-5 divide-y divide-neutral-200">
                {data.items.map((it) => (
                  <div key={it.productId} className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
                        <Image
                          src={withImageParams(
                            it.image || "/images/shopping.jpg",
                            "auto=format&fit=crop&w=160&q=80"
                          )}
                          alt={it.name}
                          width={160}
                          height={160}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{it.name}</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          Product ID: {it.productId} | Qty: {it.qty} | {it.isDropship ? "Dropship" : "Owned"}
                        </p>
                        {(it.variantLabel || it.sizeLabel) ? (
                          <p className="mt-1 text-xs text-neutral-500">
                            {it.variantLabel ? `Color: ${it.variantLabel}` : null}
                            {it.variantLabel && it.sizeLabel ? " | " : null}
                            {it.sizeLabel ? `Size: ${it.sizeLabel}` : null}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{it.price}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Notes</p>
              <p className="mt-2 text-sm text-neutral-600">{data.notes || "No notes."}</p>
            </div>
          </div>

          {/* RIGHT */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Update status</p>
              <div className="mt-4 grid gap-3">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderDetail["status"])}
                  className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
                >
                  <option value="PENDING">⏳ Pending</option>
                  <option value="PAID">💰 Paid (Legacy)</option>
                  <option value="CONFIRMED">✅ Confirmed</option>
                  <option value="PROCESSING">⚙️ Processing</option>
                  <option value="READY_TO_SHIP">📦 Ready to Ship</option>
                  <option value="SHIPPED">🚚 Shipped</option>
                  <option value="OUT_FOR_DELIVERY">🛵 Out for Delivery</option>
                  <option value="DELIVERED">✔️ Delivered</option>
                  <option value="CANCELLED">❌ Cancelled</option>
                  <option value="REFUNDED">💸 Refunded</option>
                </select>

                {/* Show tracking fields when status is SHIPPED or later */}
                {(status === "SHIPPED" || status === "OUT_FOR_DELIVERY" || status === "DELIVERED") && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-2">
                        Tracking ID
                      </label>
                      <input
                        type="text"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        placeholder="e.g., TCS-123456789"
                        className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-2">
                        Courier Company
                      </label>
                      <select
                        value={courierName}
                        onChange={(e) => setCourierName(e.target.value)}
                        className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
                      >
                        <option value="">Select courier...</option>
                        <option value="TCS">TCS</option>
                        <option value="Leopards">Leopards Courier</option>
                        <option value="PostEx">PostEx</option>
                        <option value="M&P">M&P Express</option>
                        <option value="Trax">Trax</option>
                        <option value="BlueEx">BlueEx</option>
                        <option value="Call Courier">Call Courier</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Estimated Delivery */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-2">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
                  />
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-2">
                    Admin Notes (Internal)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Internal notes about this order..."
                    rows={3}
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm resize-none"
                  />
                </div>

                <button
                  onClick={async () => {
                    if (!id) return;
                    setSaving(true);
                    setMsg(null);
                    const res = await Fetch(`/api/admin/orders/${id}`, {
                      method: "PATCH",
                      auth: true,
                      data: { 
                        status,
                        trackingId: trackingId || undefined,
                        courierName: courierName || undefined,
                        estimatedDelivery: estimatedDelivery || undefined,
                        adminNotes: adminNotes || undefined,
                      },
                    });
                    if (!res.ok) {
                      setMsg(res.error || "Failed to update order");
                    } else {
                      setMsg("Order updated successfully!");
                      await loadOrder();
                    }
                    setSaving(false);
                  }}
                  disabled={saving}
                  className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
                >
                  {saving ? "Updating..." : "Update status"}
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Customer</p>
              <p className="mt-3 text-sm text-neutral-900">{data.customer.name}</p>
              <p className="mt-1 text-xs text-neutral-500">{data.customer.email || "-"}</p>
              <p className="mt-1 text-xs text-neutral-500">{data.customer.phone || "-"}</p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Shipping address</p>
              <p className="mt-3 text-sm text-neutral-700">{data.shippingAddress.line1}</p>
              {data.shippingAddress.line2 ? (
                <p className="mt-1 text-sm text-neutral-700">{data.shippingAddress.line2}</p>
              ) : null}
              <p className="mt-1 text-sm text-neutral-700">
                {data.shippingAddress.city}
                {data.shippingAddress.province ? `, ${data.shippingAddress.province}` : ""}
              </p>
              <p className="mt-1 text-sm text-neutral-700">{data.shippingAddress.country}</p>
              <p className="mt-1 text-xs text-neutral-500">{data.shippingAddress.postalCode || ""}</p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Status</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs text-white">{data.paymentStatus}</span>
                <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700">
                  {data.fulfillment}
                </span>
              </div>

              <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-semibold">{data.totals.subtotal}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="font-semibold">{data.totals.shipping}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Discount</span>
                  <span className="font-semibold">{data.totals.discount}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3 text-sm">
                  <span className="text-neutral-600">Total</span>
                  <span className="text-base font-semibold">{data.totals.total}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
