"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackPurchase as trackGooglePurchase } from "@/lib/googleAnalytics";
import { trackPurchase } from "@/lib/metaPixel";

type StoredOrderItem = {
  id?: string | number;
  slug?: string;
  name?: string;
  price?: number;
  qty?: number;
  category?: string;
};

type StoredOrder = {
  id: string | number;
  total?: number;
  shipping?: number;
  items: StoredOrderItem[];
};

function readStoredOrder(orderId: string): StoredOrder | null {
  if (!orderId || typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(`meta_order_${orderId}`);
  if (!raw) return { id: orderId, items: [] };

  try {
    return JSON.parse(raw) as StoredOrder;
  } catch {
    return { id: orderId, items: [] };
  }
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[960px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

function formatMoney(value: number) {
  return `PKR ${value.toLocaleString("en-PK")}`;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const order = readStoredOrder(orderId);

  useEffect(() => {
    const storedOrder = readStoredOrder(orderId);
    if (!storedOrder || storedOrder.items.length === 0) return;
    trackPurchase(storedOrder);
    trackGooglePurchase(storedOrder);
  }, [orderId]);

  const totalItems = order?.items.reduce((sum, item) => sum + (item.qty ?? 1), 0) ?? 0;

  return (
    <div className="min-h-screen bg-white py-16 text-neutral-900">
      <Container>
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-10">
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Order placed
          </span>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Thank you for your order.
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Your order has been received. We will contact you shortly to confirm
            delivery details.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs text-neutral-500">Order ID</p>
              <p className="mt-1 text-sm font-semibold">{orderId || "-"}</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs text-neutral-500">Items</p>
              <p className="mt-1 text-sm font-semibold">{totalItems || "-"}</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs text-neutral-500">Total</p>
              <p className="mt-1 text-sm font-semibold">
                {typeof order?.total === "number" ? formatMoney(order.total) : "-"}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={orderId ? `/account/orders/${orderId}` : "/account/orders"}
              className="rounded-2xl bg-neutral-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
            >
              View order
            </Link>
            <Link
              href="/shop"
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-center text-sm font-medium hover:bg-neutral-50"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
