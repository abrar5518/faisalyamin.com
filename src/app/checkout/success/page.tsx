"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MessageCircle, PackageCheck, ShoppingBag } from "lucide-react";
import { useGlobalCopy } from "@/components/GlobalCopyProvider";
import {
  DEFAULT_CHECKOUT_SETTINGS,
  parseCheckoutSettings,
  renderCheckoutTemplate,
  type CheckoutSettings,
} from "@/lib/checkoutSettings";
import { buildWhatsAppHref, fetchPublicContact } from "@/lib/contact";
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
    <div className="mx-auto w-full max-w-[760px] px-4 sm:px-6">
      {children}
    </div>
  );
}

function formatMoney(value: number) {
  return `PKR ${value.toLocaleString("en-PK")}`;
}

function CheckoutSuccessContent() {
  const globalCopy = useGlobalCopy();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const order = readStoredOrder(orderId);
  const [whatsappHref, setWhatsappHref] = useState("/contact");
  const [checkoutSettings, setCheckoutSettings] =
    useState<CheckoutSettings>(DEFAULT_CHECKOUT_SETTINGS);

  useEffect(() => {
    const storedOrder = readStoredOrder(orderId);
    if (!storedOrder || storedOrder.items.length === 0) return;
    trackPurchase(storedOrder);
    trackGooglePurchase(storedOrder);
  }, [orderId]);

  useEffect(() => {
    let active = true;

    (async () => {
      const [contact, settingsRes] = await Promise.all([
        fetchPublicContact(),
        fetch("/api/site-settings", { cache: "no-store" }),
      ]);
      const settingsPayload = await settingsRes.json().catch(() => ({}));
      if (!active) return;

      if (settingsRes.ok && settingsPayload?.ok) {
        setCheckoutSettings(parseCheckoutSettings(settingsPayload.data?.checkoutSettings));
      }

      setWhatsappHref(
        buildWhatsAppHref(
          contact?.whatsapp,
          orderId
            ? `Assalam o Alaikum, I need help with my order #${orderId}.`
            : "Assalam o Alaikum, I need help with my order."
        )
      );
    })();

    return () => {
      active = false;
    };
  }, [orderId]);

  const totalItems = order?.items.reduce((sum, item) => sum + (item.qty ?? 1), 0) ?? 0;

  return (
    <main className="min-h-screen bg-neutral-50 py-8 text-neutral-900 sm:py-12">
      <Container>
        <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            {checkoutSettings.successTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-600">
            {checkoutSettings.successSubtitle}
          </p>

          <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {checkoutSettings.successOrderNumberLabel}
              </p>
              <p className="mt-1 break-all text-base font-bold">{orderId || "-"}</p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {checkoutSettings.successExpectedDeliveryLabel}
              </p>
              <p className="mt-1 text-base font-bold">
                {checkoutSettings.successExpectedDeliveryText}
              </p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {checkoutSettings.successTotalLabel}
              </p>
              <p className="mt-1 text-base font-bold">
                {typeof order?.total === "number" ? formatMoney(order.total) : "-"}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-left">
            <div className="flex gap-3">
              <PackageCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-bold text-emerald-950">
                  {checkoutSettings.successPreparedTitle}
                </p>
                <p className="mt-1 text-sm leading-6 text-emerald-900/80">
                  {renderCheckoutTemplate(checkoutSettings.successPreparedText, {
                    items: totalItems || "-",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              {checkoutSettings.successSupportButtonLabel}
            </a>
            <Link
              href="/shop"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm font-bold text-neutral-900 transition hover:bg-neutral-50"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {globalCopy.checkout.continueShopping}
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
