"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MessageCircle, PackageCheck, ShoppingBag } from "lucide-react";
import { trackPurchase as trackGooglePurchase } from "@/lib/googleAnalytics";
import { trackPurchase } from "@/lib/metaPixel";

const WHATSAPP_LINK = "https://wa.me/923018980125";

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
    <div className="mx-auto w-full max-w-[760px] px-4 sm:px-6">
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
    <main className="min-h-screen bg-neutral-50 py-8 text-neutral-900 sm:py-12">
      <Container>
        <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
          </div>

          <p className="mt-6 text-4xl" aria-hidden="true">
            🎉
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Order Placed Successfully
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-600">
            Thank you. We will call or WhatsApp you soon to confirm your Cash on
            Delivery order before dispatch.
          </p>

          <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Order Number
              </p>
              <p className="mt-1 break-all text-base font-bold">{orderId || "-"}</p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Expected Delivery
              </p>
              <p className="mt-1 text-base font-bold">3-7 working days</p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Total
              </p>
              <p className="mt-1 text-base font-bold">
                {typeof order?.total === "number" ? formatMoney(order.total) : "-"}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-left">
            <div className="flex gap-3">
              <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-emerald-950">
                  Your order is being prepared
                </p>
                <p className="mt-1 text-sm leading-6 text-emerald-900/80">
                  Items: {totalItems || "-"} · Payment: Cash on Delivery · Delivery:
                  All over Pakistan
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              WhatsApp Support
            </a>
            <Link
              href="/shop"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm font-bold text-neutral-900 transition hover:bg-neutral-50"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
