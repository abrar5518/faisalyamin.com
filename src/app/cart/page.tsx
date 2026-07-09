// src/app/cart/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { withImageParams } from "@/lib/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useGlobalCopy } from "@/components/GlobalCopyProvider";
import ReusableBlockView from "@/components/reusable-blocks/ReusableBlockView";
import {
  DEFAULT_CART_SETTINGS,
  parseCartSettings,
  parseMoneySetting,
  type CartSettings,
} from "@/lib/cartSettings";
import { buildWhatsAppHref, fetchPublicContact } from "@/lib/contact";
import { trackViewCart } from "@/lib/googleAnalytics";
import { renderCopyTemplate } from "@/lib/globalCopy";
import type { ReusableBlockViewModel } from "@/lib/reusableBlocks";

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

function formatMoney(value: number, currency = "PKR") {
  return `${currency || "PKR"} ${value.toLocaleString("en-PK")}`;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700">
      {children}
    </span>
  );
}

function Row({ label, value, muted }: { label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className={`text-sm ${muted ? "text-neutral-500" : "text-neutral-700"}`}>{label}</p>
      <div className={`text-sm ${muted ? "text-neutral-500" : "text-neutral-900"}`}>{value}</div>
    </div>
  );
}

export default function CartPage() {
  const { items, updateQty, removeItem } = useCart();
  const globalCopy = useGlobalCopy();
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    description?: string | null;
    freeShippingApplied?: boolean;
  } | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [cartSettings, setCartSettings] = useState<CartSettings>(DEFAULT_CART_SETTINGS);
  const [reusableBlocks, setReusableBlocks] = useState<ReusableBlockViewModel[]>([]);
  const [shippingFee, setShippingFee] = useState(250);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [whatsappHref, setWhatsappHref] = useState("/contact");

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.qty, 0),
    [items]
  );

  const currency = items[0]?.currency || "PKR";
  const discount = useMemo(() => appliedCoupon?.discount ?? 0, [appliedCoupon]);
  const freeShippingUnlocked =
    freeShippingThreshold > 0 && subtotal > 0 && subtotal >= freeShippingThreshold;
  const shipping = useMemo(
    () =>
      subtotal === 0 || appliedCoupon?.freeShippingApplied || freeShippingUnlocked
        ? 0
        : shippingFee,
    [appliedCoupon?.freeShippingApplied, freeShippingUnlocked, shippingFee, subtotal]
  );
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingMessage =
    cartSettings.showFreeShippingProgress && freeShippingThreshold > 0 && subtotal > 0
      ? freeShippingUnlocked
        ? globalCopy.cart.freeShippingUnlocked
        : renderCopyTemplate(globalCopy.cart.freeShippingProgress, {
            amount: formatMoney(remainingForFreeShipping, currency),
          })
      : null;

  const total = Math.max(0, subtotal + shipping - discount);
  const latestCartRef = useRef({ items, total });
  const supportHref =
    cartSettings.supportHref === "/contact" ? whatsappHref : cartSettings.supportHref;

  const validateCoupon = async (code: string) => {
    setCouponLoading(true);
    setCouponMsg(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          subtotal,
          shipping,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Invalid coupon.");
      }
      setAppliedCoupon({
        code: data.data.code,
        discount: data.data.discount ?? 0,
        description: data.data.description ?? null,
        freeShippingApplied: Boolean(data.data.freeShippingApplied),
      });
      setCoupon(data.data.code);
    } catch (err: any) {
      setAppliedCoupon(null);
      setCouponMsg(err?.message || "Failed to apply coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  const applyCoupon = () => {
    const code = coupon.trim();
    if (!code) return;
    validateCoupon(code);
  };

  const clearCoupon = () => {
    setAppliedCoupon(null);
    setCoupon("");
    setCouponMsg(null);
  };

  const empty = items.length === 0;

  useEffect(() => {
    let active = true;

    (async () => {
      const [siteRes, storeRes, blocksRes, contact] = await Promise.all([
        fetch("/api/site-settings", { cache: "no-store" }),
        fetch("/api/store-settings", { cache: "no-store" }),
        fetch("/api/reusable-blocks?placement=cart", { cache: "no-store" }),
        fetchPublicContact(),
      ]);
      const [sitePayload, storePayload, blocksPayload] = await Promise.all([
        siteRes.json().catch(() => ({})),
        storeRes.json().catch(() => ({})),
        blocksRes.json().catch(() => ({})),
      ]);

      if (!active) return;

      setWhatsappHref(buildWhatsAppHref(contact?.whatsapp));

      if (siteRes.ok && sitePayload?.ok) {
        setCartSettings(parseCartSettings(sitePayload.data?.cartSettings));
      }
      if (storeRes.ok && storePayload?.ok) {
        setShippingFee(parseMoneySetting(storePayload.data?.defaultShippingFee, 250));
        setFreeShippingThreshold(
          parseMoneySetting(storePayload.data?.freeShippingThreshold, 0)
        );
      }
      if (blocksRes.ok && blocksPayload?.ok && Array.isArray(blocksPayload.data)) {
        setReusableBlocks(blocksPayload.data);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    latestCartRef.current = { items, total };
  }, [items, total]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      trackViewCart(latestCartRef.current);
    }, 250);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!appliedCoupon?.code) return;
    validateCoupon(appliedCoupon.code);
  }, [subtotal, shipping]);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">
              {globalCopy.cart.breadcrumbHome}
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">{globalCopy.cart.breadcrumbCart}</span>
          </div>
        </Container>
      </div>

      {/* Header */}
      <section className="border-b border-neutral-200 bg-white">
        <Container>
          <div className="flex flex-col gap-4 py-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700">
                <span className="h-2 w-2 rounded-full bg-neutral-900" />
                {globalCopy.cart.secureCheckoutBadge}
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {globalCopy.cart.cartPageTitle}
              </h1>

              <p className="mt-2 text-sm text-neutral-600">
                {globalCopy.cart.cartPageSubtitle}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Pill>{globalCopy.trust.qualityTitle}</Pill>
                <Pill>{globalCopy.trust.shippingTitle}</Pill>
                <Pill>{globalCopy.trust.supportTitle}</Pill>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={cartSettings.continueShoppingHref}
                className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
              >
                {globalCopy.cart.continueShopping}
              </Link>
              <Link
                href="/checkout"
                className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
              >
                {globalCopy.checkout.checkout}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Content */}
      <main className="pb-24 pt-10 lg:pb-16">
        <Container>
          {empty ? (
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-10 text-center">
              <p className="text-lg font-semibold">{globalCopy.cart.emptyTitle}</p>
              <p className="mt-2 text-sm text-neutral-600">
                {globalCopy.cart.cartPageEmptyBody}
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <Link
                  href={cartSettings.emptyPrimaryHref}
                  className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  {globalCopy.cart.cartPageEmptyPrimary}
                </Link>
                <Link
                  href={cartSettings.emptySecondaryHref}
                  className="rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium hover:bg-neutral-50"
                >
                  {globalCopy.cart.cartPageEmptySecondary}
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-12">
              {/* Items */}
              <section className="lg:col-span-7">
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{globalCopy.cart.itemsTitle}</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {renderCopyTemplate(globalCopy.cart.itemsCount, {
                          count: items.length,
                        })}
                      </p>
                    </div>

                    <Link
                      href={cartSettings.continueShoppingHref}
                      className="text-sm font-medium text-neutral-900 hover:underline"
                    >
                      {globalCopy.cart.addMore}
                    </Link>
                  </div>

                  <div className="mt-6 space-y-5">
                    {items.map((it) => {
                      const lineTotal = it.price * it.qty;
                      const saved =
                        typeof it.compareAt === "number" && it.compareAt > it.price
                          ? (it.compareAt - it.price) * it.qty
                          : 0;

                      return (
                        <div
                          key={it.id}
                          className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5"
                        >
                          <div className="flex gap-4">
                            <Link
                              href={it.href ?? "/product/" + it.id}
                              className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                            >
                              <Image
                                src={withImageParams(
                                  it.image || "/images/shopping.jpg",
                                  "auto=format&fit=crop&w=600&q=85"
                                )}
                                alt={it.name}
                                width={600}
                                height={600}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            </Link>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <Link
                                    href={it.href ?? "/product/" + it.id}
                                    className="line-clamp-2 text-sm font-semibold text-neutral-900 hover:underline"
                                  >
                                    {it.name}
                                  </Link>

                                  {it.subtitle ? (
                                    <p className="mt-1 text-xs text-neutral-600">
                                      {it.subtitle}
                                    </p>
                                  ) : null}

                                  {it.printText || it.printFileUrl ? (
                                    <div className="mt-3 space-y-1 rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600">
                                      {it.printText ? (
                                        <p>
                                          <span className="font-medium text-neutral-900">Print:</span>{" "}
                                          {it.printText}
                                        </p>
                                      ) : null}
                                      {it.printFileUrl ? (
                                        <a
                                          href={it.printFileUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="font-medium text-neutral-900 hover:underline"
                                        >
                                          {it.printFileName || "View print file"}
                                        </a>
                                      ) : null}
                                    </div>
                                  ) : null}

                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {it.badge ? <Pill>{it.badge}</Pill> : null}
                                    <Pill>{globalCopy.cart.itemShippingBadge}</Pill>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-sm font-semibold">{formatMoney(it.price, it.currency)}</p>
                                  {typeof it.compareAt === "number" ? (
                                    <p className="text-xs text-neutral-500 line-through">
                                      {formatMoney(it.compareAt, it.currency)}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-neutral-500">In stock</p>
                                  )}
                                </div>
                              </div>

                              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                {/* Qty */}
                                <div className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-1">
                                  <button
                                    onClick={() => updateQty(it.id, it.qty - 1)}
                                    disabled={it.qty <= 1}
                                    className="h-10 w-10 rounded-xl border border-neutral-200 bg-white text-sm hover:bg-neutral-50 disabled:opacity-40"
                                    aria-label="Decrease quantity"
                                  >
                                    -
                                  </button>
                                  <div className="min-w-12 text-center text-sm font-medium">
                                    {it.qty}
                                  </div>
                                  <button
                                    onClick={() => updateQty(it.id, it.qty + 1)}
                                    className="h-10 w-10 rounded-xl border border-neutral-200 bg-white text-sm hover:bg-neutral-50"
                                    aria-label="Increase quantity"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Totals + actions */}
                                <div className="flex items-center justify-between gap-3 sm:justify-end">
                                  <div className="text-right">
                                    <p className="text-xs text-neutral-500">{globalCopy.cart.lineTotal}</p>
                                    <p className="text-sm font-semibold">{formatMoney(lineTotal, it.currency)}</p>
                                    {saved > 0 ? (
                                      <p className="text-xs text-neutral-600">
                                        {renderCopyTemplate(globalCopy.cart.savedAmount, {
                                          amount: formatMoney(saved, it.currency),
                                        })}
                                      </p>
                                    ) : null}
                                  </div>

                                  <button
                                    onClick={() => removeItem(it.id)}
                                    className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-xs font-medium hover:bg-neutral-50"
                                  >
                                    {globalCopy.cart.removeItem}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {reusableBlocks.length ? (
                  <div className="mt-6 space-y-3">
                    {reusableBlocks.map((block) => (
                      <ReusableBlockView key={block.slug} block={block} compact whatsappHref={whatsappHref} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      { t: globalCopy.trust.qualityTitle, d: globalCopy.trust.qualityText },
                      { t: globalCopy.trust.shippingTitle, d: globalCopy.trust.shippingText },
                      { t: globalCopy.trust.supportTitle, d: globalCopy.trust.supportText },
                    ].map((x) => (
                      <div key={x.t} className="theme-card rounded-3xl border border-neutral-200 bg-white p-5">
                        <p className="text-xs font-semibold">{x.t}</p>
                        <p className="mt-1 text-xs text-neutral-600">{x.d}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Summary */}
              <aside className="lg:col-span-5">
                <div className="lg:sticky lg:top-6 space-y-6">
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
                    <p className="text-sm font-semibold">{globalCopy.cart.orderSummaryTitle}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {globalCopy.cart.orderSummaryNote}
                    </p>

                    <div className="mt-6 space-y-3">
                      <Row label={globalCopy.cart.subtotal} value={<span className="font-medium">{formatMoney(subtotal, currency)}</span>} />
                      <Row
                        label={globalCopy.cart.shipping}
                        value={
                          shipping === 0 ? (
                            <span className="text-neutral-700">{globalCopy.cart.noShipping}</span>
                          ) : (
                            <span className="font-medium">{formatMoney(shipping, currency)}</span>
                          )
                        }
                        muted
                      />
                      <Row
                        label={globalCopy.cart.discount}
                        value={
                          discount > 0 ? (
                            <span className="font-medium text-neutral-900">- {formatMoney(discount, currency)}</span>
                          ) : (
                            <span className="text-neutral-500">0</span>
                          )
                        }
                        muted
                      />

                      <div className="my-4 border-t border-neutral-200" />

                      <Row
                        label={globalCopy.cart.total}
                        value={<span className="text-lg font-semibold">{formatMoney(total, currency)}</span>}
                      />
                    </div>

                    {freeShippingMessage ? (
                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
                        {freeShippingMessage}
                      </div>
                    ) : null}

                    {/* Coupon */}
                    <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
                      <p className="text-sm font-medium">{globalCopy.cart.couponTitle}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {globalCopy.cart.couponHelp}
                    </p>

                      <div className="mt-3 flex gap-2">
                        <input
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-400"
                          placeholder={globalCopy.cart.couponPlaceholder}
                        />
                        <button
                          onClick={applyCoupon}
                          disabled={couponLoading}
                          className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
                        >
                          {couponLoading ? globalCopy.cart.applyingCoupon : globalCopy.cart.applyCoupon}
                        </button>
                      </div>

                      {appliedCoupon ? (
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-neutral-600">
                            {renderCopyTemplate(globalCopy.cart.appliedCoupon, {
                              code: appliedCoupon.code,
                            })}
                          </span>
                          <button
                            onClick={clearCoupon}
                            className="text-xs font-medium text-neutral-900 hover:underline"
                          >
                            {globalCopy.cart.removeCoupon}
                          </button>
                        </div>
                      ) : null}

                      {couponMsg ? (
                        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                          {couponMsg}
                        </div>
                      ) : null}
                    </div>

                    {/* Checkout buttons */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <Link
                        href="/checkout"
                        className="rounded-2xl bg-neutral-900 px-6 py-4 text-center text-sm font-medium text-white hover:bg-neutral-800"
                      >
                        {globalCopy.checkout.checkout}
                      </Link>
                      <Link
                        href={cartSettings.continueShoppingHref}
                        className="rounded-2xl border border-neutral-200 px-6 py-4 text-center text-sm font-medium hover:bg-neutral-50"
                      >
                        {globalCopy.cart.continue}
                      </Link>
                    </div>

                    <p className="mt-5 text-xs text-neutral-500">
                      {globalCopy.cart.secureNote}
                    </p>
                  </div>

                  {/* Support box */}
                  <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-7">
                    <p className="text-sm font-semibold">{globalCopy.cart.needHelpTitle}</p>
                    <p className="mt-2 text-sm text-neutral-600">
                      {globalCopy.cart.needHelpBody}
                    </p>
                    <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                      <Link
                        href={supportHref}
                        rel={supportHref.startsWith("http") ? "noopener noreferrer" : undefined}
                        target={supportHref.startsWith("http") ? "_blank" : undefined}
                        className="rounded-2xl bg-neutral-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
                      >
                        {globalCopy.cart.contactSupport}
                      </Link>
                      <Link
                        href={cartSettings.trackOrderHref}
                        className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-center text-sm font-medium hover:bg-neutral-50"
                      >
                        {globalCopy.cart.trackOrder}
                      </Link>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </Container>
      </main>

      {/* Mobile sticky checkout bar */}
      {!empty ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/90 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-[1360px] items-center gap-3 px-5 py-3">
            <div className="min-w-0">
              <p className="truncate text-xs text-neutral-500">
                {renderCopyTemplate(globalCopy.cart.mobileSummary, {
                  count: items.length,
                  shipping: shipping === 0 ? globalCopy.cart.noShipping : formatMoney(shipping, currency),
                })}
              </p>
              <p className="text-base font-semibold leading-none">{formatMoney(total, currency)}</p>
            </div>
            <Link
              href="/checkout"
              className="ml-auto rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              {globalCopy.checkout.checkout}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
