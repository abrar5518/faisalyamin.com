// src/app/checkout/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { withImageParams } from "@/lib/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { trackBeginCheckout } from "@/lib/googleAnalytics";
import { trackInitiateCheckout } from "@/lib/metaPixel";

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

function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {desc ? <p className="mt-1 text-xs text-neutral-500">{desc}</p> : null}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-neutral-700">
        {label} {required ? <span className="text-neutral-400">*</span> : null}
        {disabled ? <span className="ml-2 text-xs text-neutral-500">(from your account)</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900/10 disabled:bg-neutral-50 disabled:text-neutral-600 disabled:cursor-not-allowed"
      />
    </label>
  );
}

function RadioCard({
  active,
  title,
  desc,
  right,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  right?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-3xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-neutral-900/10",
        active ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 bg-white hover:bg-neutral-50",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={[
                "h-4 w-4 rounded-full border",
                active ? "border-neutral-900" : "border-neutral-300",
              ].join(" ")}
            >
              <span
                className={[
                  "block h-full w-full scale-50 rounded-full transition",
                  active ? "bg-neutral-900" : "bg-transparent",
                ].join(" ")}
              />
            </span>
            <p className="text-sm font-semibold">{title}</p>
          </div>
          <p className="mt-2 text-sm text-neutral-600">{desc}</p>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </button>
  );
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loyaltySettings, setLoyaltySettings] = useState<{
    enabled: boolean;
    pointsPerCurrency: number;
    currencyPerPoint: number;
    minRedeemPoints: number;
    maxRedeemPercent: number;
  } | null>(null);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
    phone?: string;
    profile?: {
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      country?: string | null;
      city?: string | null;
    } | null;
  } | null>(null);

  // Customer
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Address
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const defaultCountry = "Pakistan";
  const defaultCity = "";
  const [country, setCountry] = useState(defaultCountry);
  const [city, setCity] = useState(defaultCity);
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [zip, setZip] = useState("");

  // Shipping / payment
  const [payment, setPayment] = useState<"cod">("cod");

  // Coupon
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    description?: string | null;
    freeShippingApplied?: boolean;
  } | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState("");
  const [redeemMsg, setRedeemMsg] = useState<string | null>(null);
  const initiateCheckoutTracked = useRef(false);

  // Totals
  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.qty, 0),
    [items]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/loyalty-settings", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!active) return;
        if (res.ok && payload?.ok) {
          setLoyaltySettings(payload.data || null);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Fetch user session + profile + saved addresses
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/account/me", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!active) return;
        if (res.ok && payload?.ok && payload?.data) {
          const account = payload.data as any;
          setUser(account);

          const profile = account?.profile || null;
          const profileFirst = profile?.firstName ?? "";
          const profileLast = profile?.lastName ?? "";
          const profilePhone = profile?.phone ?? "";
          const profileCountry = profile?.country ?? "";
          const profileCity = profile?.city ?? "";

          if (account?.email) setEmail(account.email);

          setFirstName((cur) => (cur ? cur : profileFirst || ""));
          setLastName((cur) => (cur ? cur : profileLast || ""));
          setPhone((cur) => (cur ? cur : profilePhone || ""));
          setCountry((cur) => {
            if (profileCountry) return profileCountry;
            return cur === defaultCountry ? "" : cur;
          });
          setCity((cur) => {
            if (profileCity) return profileCity;
            return cur === defaultCity ? "" : cur;
          });

          if (!profileFirst && !profileLast && account?.name) {
            const names = String(account.name).split(" ");
            setFirstName((cur) => (cur ? cur : names[0] || ""));
            setLastName((cur) => (cur ? cur : names.slice(1).join(" ") || ""));
          }

          const addrRes = await fetch("/api/account/addresses", { cache: "no-store" });
          const addrPayload = await addrRes.json().catch(() => ({}));
          if (addrRes.ok && addrPayload?.ok && Array.isArray(addrPayload.data) && addrPayload.data.length) {
            const addr = addrPayload.data[0];
            const fullName = String(addr.fullName || "").trim();
            if (fullName && (!profileFirst || !profileLast)) {
              const parts = fullName.split(" ");
              setFirstName((cur) => (cur ? cur : parts[0] || ""));
              setLastName((cur) => (cur ? cur : parts.slice(1).join(" ") || ""));
            }
            setPhone((cur) => (cur ? cur : String(addr.phone || "")));
            setAddress1((cur) => (cur ? cur : String(addr.address1 || "")));
            setAddress2((cur) => (cur ? cur : String(addr.address2 || "")));
            setCity((cur) => (cur ? cur : String(addr.city || "")));
            setCountry((cur) => (cur ? cur : String(addr.country || "")));
            setZip((cur) => (cur ? cur : String(addr.postalCode || "")));
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const defaultShippingFee = 250;

  const shippingCost = useMemo(() => {
    if (subtotal <= 0) return 0;
    return defaultShippingFee;
  }, [defaultShippingFee, subtotal]);

  const discount = useMemo(() => appliedCoupon?.discount ?? 0, [appliedCoupon]);
  const discountForLoyalty = useMemo(
    () => (appliedCoupon?.freeShippingApplied ? 0 : discount),
    [appliedCoupon?.freeShippingApplied, discount]
  );

  const maxRedeemPoints = useMemo(() => {
    if (!loyaltySettings?.enabled) return 0;
    if (availablePoints < loyaltySettings.minRedeemPoints) return 0;
    const base = Math.max(0, subtotal - discountForLoyalty);
    const maxValue = Math.max(0, (base * loyaltySettings.maxRedeemPercent) / 100);
    const maxPointsByValue =
      loyaltySettings.currencyPerPoint > 0
        ? Math.floor(maxValue / loyaltySettings.currencyPerPoint)
        : 0;
    const points = Math.min(availablePoints, maxPointsByValue);
    return points >= loyaltySettings.minRedeemPoints ? points : 0;
  }, [availablePoints, discount, loyaltySettings, subtotal]);

  const redeemPointsValue = useMemo(() => {
    if (!loyaltySettings?.enabled) return 0;
    const points = Math.max(0, Math.floor(Number(redeemPoints) || 0));
    const clamped = Math.min(points, maxRedeemPoints);
    return clamped * (loyaltySettings.currencyPerPoint || 0);
  }, [loyaltySettings, maxRedeemPoints, redeemPoints]);

  const total = Math.max(0, subtotal + shippingCost - discount - redeemPointsValue);

  const canPlaceOrder = useMemo(() => {
    const basic =
      phone.trim() &&
      firstName.trim() &&
      address1.trim() &&
      city.trim() &&
      country.trim();
    return Boolean(basic && items.length > 0);
  }, [phone, firstName, address1, city, country, items.length]);

  const customerEmail = useMemo(
    () => user?.email || email.trim() || undefined,
    [user?.email, email]
  );

  useEffect(() => {
    if (initiateCheckoutTracked.current || items.length === 0) return;
    initiateCheckoutTracked.current = true;

    trackInitiateCheckout({
      items,
      total,
      totalItems: items.reduce((sum, item) => sum + item.qty, 0),
    });
    trackBeginCheckout({
      items,
      total,
    });
  }, [items, total]);

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
          shipping: shippingCost,
          customerEmail,
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

  const placeOrder = async () => {
    if (!canPlaceOrder || submitting) return;
    setSubmitting(true);
    setMsg(null);
    try {
      // Ensure logged-in user's email is always sent
      const customerEmail = user?.email || email.trim() || undefined;
      
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            firstName: firstName.trim(),
            lastName: lastName.trim() || undefined,
            email: customerEmail,
            phone: phone.trim(),
          },
          address: {
            line1: address1.trim(),
            line2: address2.trim() || undefined,
            city: city.trim(),
            country: country.trim(),
            postalCode: zip.trim() || undefined,
          },
          shippingMethod: "standard",
          paymentMethod: payment,
          items,
          couponCode: appliedCoupon?.code ?? undefined,
          redeemPoints: loyaltySettings?.enabled && user
            ? Math.floor(Number(redeemPoints) || 0)
            : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Checkout failed");

      const orderId = data?.data?.orderId ? String(data.data.orderId) : "";
      if (!orderId) throw new Error("Order placed, but confirmation ID was missing.");

      window.sessionStorage.setItem(
        `meta_order_${orderId}`,
        JSON.stringify({
          id: orderId,
          total,
          shipping: shippingCost,
          items: items.map((item) => ({
            id: item.productId ?? item.slug ?? item.id,
            slug: item.slug,
            name: item.name,
            price: item.price,
            qty: item.qty,
            category: item.category,
          })),
        })
      );

      clearCart();
      router.push(`/checkout/success?orderId=${encodeURIComponent(orderId)}`);
    } catch (err: any) {
      setMsg(err?.message ? `Order failed: ${err.message}` : "Order failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!appliedCoupon?.code) return;
    validateCoupon(appliedCoupon.code);
  }, [subtotal, shippingCost, customerEmail]);

  useEffect(() => {
    const raw = Math.floor(Number(redeemPoints) || 0);
    if (!redeemPoints || raw <= 0) {
      setRedeemMsg(null);
      return;
    }
    if (maxRedeemPoints > 0 && raw > maxRedeemPoints) {
      setRedeemMsg(`Max redeemable points: ${maxRedeemPoints}.`);
      return;
    }
    if (loyaltySettings?.minRedeemPoints && raw < loyaltySettings.minRedeemPoints) {
      setRedeemMsg(`Minimum redeem points: ${loyaltySettings.minRedeemPoints}.`);
      return;
    }
    setRedeemMsg(null);
  }, [loyaltySettings?.minRedeemPoints, maxRedeemPoints, redeemPoints]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!customerEmail) return;
      try {
        const res = await fetch("/api/account/loyalty", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!active) return;
        if (res.ok && payload?.ok) {
          setAvailablePoints(payload.data?.points ?? 0);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, [customerEmail]);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">Home</Link>
            <span className="text-neutral-300">/</span>
            <Link className="hover:text-neutral-900" href="/cart">Cart</Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">Checkout</span>
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
                Checkout
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Secure checkout
              </h1>

              <p className="mt-2 text-sm text-neutral-600">
                Complete your details and confirm your order.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Pill>Encrypted payments</Pill>
                <Pill>Insured delivery</Pill>
                <Pill>7-day returns</Pill>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href="/cart"
                className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
              >
                Back to cart
              </Link>
              <Link
                href="/shop"
                className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Content */}
      <main className="pb-24 pt-10 lg:pb-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Left: Forms */}
            <section className="lg:col-span-7 space-y-6">
              {/* Contact */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                {user && (
                  <div className="mb-4 flex items-center gap-2 rounded-2xl bg-green-50 border border-green-200 px-4 py-3">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-green-800">
                      Logged in as <strong>{user.name || user.email}</strong>
                    </span>
                  </div>
                )}
                <SectionTitle
                  title="Contact information"
                  desc="We'll send order updates and delivery tracking to these details."
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    type="email"
                    disabled={!!user}
                  />
                  <Field
                    label="Phone"
                    value={phone}
                    onChange={setPhone}
                    placeholder="+92 300 1234567"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                <SectionTitle
                  title="Shipping address"
                  desc="Enter a complete address for insured delivery."
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="First name" value={firstName} onChange={setFirstName} required />
                  <Field label="Last name (optional)" value={lastName} onChange={setLastName} />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Country" value={country} onChange={setCountry} required />
                  <Field label="City" value={city} onChange={setCity} required />
                </div>

                <div className="mt-4 grid gap-4">
                  <Field
                    label="Address line 1"
                    value={address1}
                    onChange={setAddress1}
                    placeholder="Building, street, area"
                    required
                  />
                  <Field
                    label="Address line 2 (optional)"
                    value={address2}
                    onChange={setAddress2}
                    placeholder="Apartment, floor, landmark"
                  />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="ZIP / Postal (optional)" value={zip} onChange={setZip} />
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-xs font-semibold">Delivery notes</p>
                    <p className="mt-1 text-xs text-neutral-600">
                      Delivery is available within Pakistan. Courier may call before delivery.
                    </p>
                  </div>
                </div>
              </div>

              {/* Account prompt - Only show if NOT logged in */}
              {!user && (
                <div className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 p-6 sm:p-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">Have an account?</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Log in to save your details and track orders. You can also checkout as guest.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href="/login"
                        className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-xs font-medium hover:bg-neutral-50"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/signup"
                        className="rounded-2xl bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800"
                      >
                        Create account
                      </Link>
                    </div>
                  </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    { t: "Order tracking", d: "See delivery status anytime." },
                    { t: "Faster checkout", d: "Saved address & contact." },
                    { t: "Reorder quickly", d: "Buy again in one tap." },
                  ].map((x) => (
                    <div key={x.t} className="rounded-2xl border border-neutral-200 bg-white p-4">
                      <p className="text-xs font-semibold">{x.t}</p>
                      <p className="mt-1 text-xs text-neutral-600">{x.d}</p>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Payment */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                <SectionTitle
                  title="Payment method"
                  desc="Cash on delivery is available for now."
                />

                <div className="mt-6 grid gap-3">
                  <RadioCard
                    active={payment === "cod"}
                    title="Cash on delivery"
                    desc="Pay with cash on delivery (verification may apply)."
                    right={<Pill>COD</Pill>}
                    onClick={() => setPayment("cod")}
                  />
                </div>

                <div className="mt-5 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold">Payment note</p>
                  <p className="mt-2 text-sm text-neutral-600">
                    For order confirmation, we may contact you by phone or WhatsApp before dispatch.
                  </p>
                </div>

                {/* Place order */}
                <div className="mt-6">
                  <button
                    onClick={placeOrder}
                    disabled={!canPlaceOrder}
                    className={[
                      "w-full rounded-2xl px-6 py-4 text-sm font-medium transition",
                      canPlaceOrder
                        ? "bg-neutral-900 text-white hover:bg-neutral-800"
                        : "cursor-not-allowed bg-neutral-200 text-neutral-500",
                    ].join(" ")}
                  >
                    Place order
                  </button>
                  {!canPlaceOrder ? (
                    <p className="mt-2 text-xs text-neutral-500">
                      Please fill required fields (phone, first name, address).
                    </p>
                  ) : null}
                  {msg ? (
                    <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                      {msg}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            {/* Right: Summary */}
            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-6 space-y-6">
                {/* Items summary */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
                  <p className="text-sm font-semibold">Order summary</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Review items before placing your order.
                  </p>

                  <div className="mt-6 space-y-4">
                    {items.map((it) => (
                      <div key={it.id} className="flex gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
                          <Image
                            src={withImageParams(
                              it.image || "/images/shopping.jpg",
                              "auto=format&fit=crop&w=400&q=85"
                            )}
                            alt={it.name}
                            width={400}
                            height={400}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <Link
                            href={it.href ?? "/product/" + it.id}
                            className="line-clamp-1 text-sm font-semibold hover:underline"
                          >
                            {it.name}
                          </Link>
                          {it.subtitle ? (
                            <p className="mt-1 text-xs text-neutral-600">{it.subtitle}</p>
                          ) : null}
                          <p className="mt-2 text-xs text-neutral-500">
                            Qty: <span className="text-neutral-700">{it.qty}</span>
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatMoney(it.price * it.qty)}</p>
                          {typeof it.compareAt === "number" ? (
                            <p className="text-xs text-neutral-500 line-through">
                              {formatMoney(it.compareAt * it.qty)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon */}
                  <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-sm font-medium">Coupon</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Enter a coupon code to apply discounts.
                    </p>

                    <div className="mt-3 flex gap-2">
                      <input
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-400"
                        placeholder="Enter coupon code"
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={couponLoading}
                        className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
                      >
                        {couponLoading ? "Applying..." : "Apply"}
                      </button>
                    </div>

                    {appliedCoupon ? (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-neutral-600">
                          Applied: <span className="font-medium">{appliedCoupon.code}</span>
                        </span>
                        <button
                          onClick={clearCoupon}
                          className="text-xs font-medium text-neutral-900 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : null}

                    {couponMsg ? (
                      <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        {couponMsg}
                      </div>
                    ) : null}
                  </div>

                  {loyaltySettings?.enabled ? (
                    <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
                      <p className="text-sm font-medium">Loyalty points</p>
                      {user ? (
                        <>
                          <p className="mt-1 text-xs text-neutral-500">
                            You have <span className="font-medium">{availablePoints}</span> points.
                          </p>

                          <div className="mt-3 flex gap-2">
                            <input
                              value={redeemPoints}
                              onChange={(e) => setRedeemPoints(e.target.value)}
                              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-400"
                              placeholder={`Max ${maxRedeemPoints}`}
                              inputMode="numeric"
                            />
                            <button
                              type="button"
                              onClick={() => setRedeemPoints(String(maxRedeemPoints))}
                              className="rounded-2xl border border-neutral-200 px-4 py-3 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
                            >
                              Use max
                            </button>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                            <span>Value</span>
                            <span>PKR {Math.round(redeemPointsValue).toLocaleString("en-PK")}</span>
                          </div>

                          {redeemMsg ? (
                            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                              {redeemMsg}
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <p className="mt-2 text-xs text-neutral-500">
                          Log in to redeem points during checkout.
                        </p>
                      )}
                    </div>
                  ) : null}

                  {/* Totals */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-700">Subtotal</p>
                    <p className="text-sm font-medium">{formatMoney(subtotal)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-500">Shipping</p>
                    <p className="text-sm text-neutral-700">
                      {shippingCost === 0 ? "Free" : formatMoney(shippingCost)}
                    </p>
                  </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-neutral-500">Discount</p>
                      <p className="text-sm text-neutral-700">
                        {discount > 0 ? `- ${formatMoney(discount)}` : "0"}
                      </p>
                    </div>
                    {redeemPointsValue > 0 ? (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-neutral-500">Loyalty</p>
                        <p className="text-sm text-neutral-700">
                          - {formatMoney(redeemPointsValue)}
                        </p>
                      </div>
                    ) : null}

                    <div className="my-4 border-t border-neutral-200" />

                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Total</p>
                      <p className="text-lg font-semibold">{formatMoney(total)}</p>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Taxes & duties may apply based on delivery location.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-2">
                    <Link
                      href="/cart"
                      className="rounded-2xl border border-neutral-200 px-5 py-3 text-center text-sm font-medium hover:bg-neutral-50"
                    >
                      Edit cart
                    </Link>
                    <button
                      onClick={placeOrder}
                      disabled={!canPlaceOrder}
                      className={[
                        "rounded-2xl px-5 py-3 text-center text-sm font-medium transition",
                        canPlaceOrder
                          ? "bg-neutral-900 text-white hover:bg-neutral-800"
                          : "cursor-not-allowed bg-neutral-200 text-neutral-500",
                      ].join(" ")}
                    >
                      Place order
                    </button>
                  </div>

                  <p className="mt-5 text-xs text-neutral-500">
                    Secure payments. Signature required for delivery. Returns within 7 days.
                  </p>
                </div>

                {/* Trust box */}
                <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-7">
                  <p className="text-sm font-semibold">Why shop with us</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    {[
                      { t: "Quality checked", d: "Packed and checked before dispatch." },
                      { t: "Pakistan shipping", d: "Tracked door-to-door delivery." },
                      { t: "Priority support", d: "Fast WhatsApp + email help." },
                      { t: "Easy returns", d: "7-day return policy." },
                    ].map((x) => (
                      <div key={x.t} className="rounded-3xl border border-neutral-200 bg-white p-5">
                        <p className="text-xs font-semibold">{x.t}</p>
                        <p className="mt-1 text-xs text-neutral-600">{x.d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </main>

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/90 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1360px] items-center gap-3 px-5 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-neutral-500">
              Total - {shippingCost === 0 ? "No shipping" : `Shipping ${formatMoney(shippingCost)}`}
            </p>
            <p className="text-base font-semibold leading-none">{formatMoney(total)}</p>
          </div>

          <button
            onClick={placeOrder}
            disabled={!canPlaceOrder}
            className={[
              "ml-auto rounded-2xl px-5 py-3 text-sm font-medium transition",
              canPlaceOrder
                ? "bg-neutral-900 text-white hover:bg-neutral-800"
                : "cursor-not-allowed bg-neutral-200 text-neutral-500",
            ].join(" ")}
          >
            Place order
          </button>
        </div>
      </div>
    </div>
  );
}
