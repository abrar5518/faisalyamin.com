// src/app/checkout/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useGlobalCopy } from "@/components/GlobalCopyProvider";
import {
  DEFAULT_CHECKOUT_SETTINGS,
  parseCheckoutSettings,
  type CheckoutSettings,
} from "@/lib/checkoutSettings";
import { buildWhatsAppHref, fetchPublicContact } from "@/lib/contact";
import { trackBeginCheckout } from "@/lib/googleAnalytics";
import { withImageParams, toOptimizableImageSrc } from "@/lib/image";
import { trackInitiateCheckout } from "@/lib/metaPixel";

type FieldErrors = Partial<Record<"phone" | "fullName" | "email" | "city" | "address", string>>;

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}

function formatMoney(value: number, currency = "PKR") {
  return `${currency || "PKR"} ${value.toLocaleString("en-PK")}`;
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || undefined,
  };
}

function normalizePakistaniPhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").trim();
}

function parseMoneySetting(value?: string | null, fallback = 250) {
  const amount = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) && amount >= 0 ? amount : fallback;
}

function cityInputPlaceholder(value?: string | null) {
  const placeholder = String(value || "").trim();
  if (!placeholder || /select/i.test(placeholder)) return "Enter your city";
  return placeholder;
}

function StepIndicator({ steps }: { steps: string[] }) {
  return (
    <section className="border-b border-neutral-200 bg-white">
      <Container>
        <div className="py-4">
          <div className="flex items-center justify-between gap-2">
            {steps.map((step, index) => (
              <div key={step} className="flex min-w-0 flex-1 items-center">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="theme-primary-action flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="truncate text-xs font-semibold text-neutral-900 sm:text-sm">
                    {step}
                  </span>
                </div>
                {index < steps.length - 1 ? (
                  <div className="mx-2 h-1 flex-1 rounded-full bg-neutral-900/15">
                    <div className="theme-primary-action h-full rounded-full bg-neutral-900" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function SectionCard({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="theme-card rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <span className="theme-primary-action flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
          {number}
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">{title}</h2>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-sm font-medium text-red-600">{message}</p>;
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const globalCopy = useGlobalCopy();
  const router = useRouter();
  const initiateCheckoutTracked = useRef(false);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const cityRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLTextAreaElement | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [branding, setBranding] = useState<{
    siteName?: string;
    logoUrl?: string | null;
    siteIconUrl?: string | null;
  } | null>(null);
  const [checkoutSettings, setCheckoutSettings] =
    useState<CheckoutSettings>(DEFAULT_CHECKOUT_SETTINGS);
  const [shippingFee, setShippingFee] = useState(250);
  const [whatsappHref, setWhatsappHref] = useState("/contact");
  const [userEmail, setUserEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );
  const shippingCost = subtotal > 0 ? shippingFee : 0;
  const total = subtotal + shippingCost;
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items],
  );
  const currency = items[0]?.currency || "PKR";

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [settingsRes, storeRes, contact] = await Promise.all([
          fetch("/api/site-settings", { cache: "no-store" }),
          fetch("/api/store-settings", { cache: "no-store" }),
          fetchPublicContact(),
        ]);
        const settingsPayload = await settingsRes.json().catch(() => ({}));
        const storePayload = await storeRes.json().catch(() => ({}));
        if (active && settingsRes.ok && settingsPayload?.ok) {
          setBranding(settingsPayload.data || null);
          setCheckoutSettings(parseCheckoutSettings(settingsPayload.data?.checkoutSettings));
        }

        if (active && storeRes.ok && storePayload?.ok) {
          setShippingFee(parseMoneySetting(storePayload.data?.defaultShippingFee, 250));
        }

        if (active) {
          setWhatsappHref(buildWhatsAppHref(contact?.whatsapp, "Assalam o Alaikum, I need help placing my order."));
        }

        const accountRes = await fetch("/api/account/me", { cache: "no-store" });
        const accountPayload = await accountRes.json().catch(() => ({}));
        if (!active || !accountRes.ok || !accountPayload?.ok || !accountPayload?.data) return;

        const account = accountPayload.data as {
          email?: string;
          name?: string;
          phone?: string;
          profile?: {
            firstName?: string | null;
            lastName?: string | null;
            phone?: string | null;
            city?: string | null;
          } | null;
        };
        const profileName = [account.profile?.firstName, account.profile?.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();

        setUserEmail(account.email || "");
        setEmail((current) => current || account.email || "");
        setFullName((current) => current || profileName || account.name || "");
        setPhone((current) => current || account.profile?.phone || account.phone || "");
        setCity((current) => current || account.profile?.city || "");

        const addressRes = await fetch("/api/account/addresses", { cache: "no-store" });
        const addressPayload = await addressRes.json().catch(() => ({}));
        if (!active || !addressRes.ok || !addressPayload?.ok || !Array.isArray(addressPayload.data)) return;
        const savedAddress = addressPayload.data[0];
        if (!savedAddress) return;

        setFullName((current) => current || String(savedAddress.fullName || ""));
        setPhone((current) => current || String(savedAddress.phone || ""));
        setCity((current) => current || String(savedAddress.city || ""));
        setAddress((current) => {
          if (current) return current;
          return [savedAddress.address1, savedAddress.address2].filter(Boolean).join(", ");
        });
      } catch {
        // Checkout should stay usable even if account prefill fails.
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (initiateCheckoutTracked.current || items.length === 0) return;
    initiateCheckoutTracked.current = true;

    trackInitiateCheckout({ items, total, totalItems });
    trackBeginCheckout({ items, total });
  }, [items, total, totalItems]);

  const validateForm = () => {
    const nextErrors: FieldErrors = {};
    const cleanPhone = normalizePakistaniPhone(phone);

    if (!cleanPhone) {
      nextErrors.phone = "Please enter your phone number.";
    } else if (!/^(03\d{9}|\+923\d{9}|923\d{9})$/.test(cleanPhone)) {
      nextErrors.phone = "Please enter a valid Pakistani mobile number.";
    }

    if (!fullName.trim()) {
      nextErrors.fullName = "Please enter your full name.";
    }

    if (checkoutSettings.emailMode === "required" && !email.trim() && !userEmail) {
      nextErrors.email = "Please enter your email address.";
    } else if (
      checkoutSettings.emailMode !== "hidden" &&
      email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      nextErrors.email = "Please enter a valid email address or leave it empty.";
    }

    if (!city.trim()) {
      nextErrors.city = "Please enter your city.";
    }

    if (!address.trim()) {
      nextErrors.address = "Please enter your delivery address.";
    } else if (address.trim().length < 12) {
      nextErrors.address = "Please enter a complete delivery address.";
    }

    setErrors(nextErrors);
    return nextErrors;
  };

  const scrollToFirstError = (nextErrors: FieldErrors) => {
    const firstKey = (["phone", "fullName", "email", "city", "address"] as const).find(
      (key) => nextErrors[key],
    );
    const refMap = {
      phone: phoneRef,
      fullName: nameRef,
      email: emailRef,
      city: cityRef,
      address: addressRef,
    };

    if (!firstKey) return;
    const target = refMap[firstKey].current;
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => target?.focus(), 350);
  };

  const placeOrder = async () => {
    if (submitting) return;

    setFormError("");
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError(nextErrors);
      return;
    }

    if (items.length === 0) {
      setFormError(checkoutSettings.emptyCartMessage);
      return;
    }

    setSubmitting(true);

    try {
      const { firstName, lastName } = splitFullName(fullName);
      const customerEmail =
        userEmail || (checkoutSettings.emailMode === "hidden" ? "" : email.trim()) || undefined;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            firstName,
            lastName,
            email: customerEmail,
            phone: phone.trim(),
          },
          address: {
            line1: address.trim(),
            city: city.trim(),
            country: "Pakistan",
          },
          shippingMethod: "standard",
          paymentMethod: "cod",
          items,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "We could not place your order right now.");

      const orderId = data?.data?.orderId ? String(data.data.orderId) : "";
      if (!orderId) throw new Error("Order placed, but confirmation number was missing.");

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
        }),
      );

      clearCart();
      router.push(`/checkout/success?orderId=${encodeURIComponent(orderId)}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not place your order. Please try again.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const brandName = branding?.siteName?.trim() || "Sahoolat";
  const checkoutLogoUrl = branding?.logoUrl?.trim() || branding?.siteIconUrl?.trim() || "";
  const brandInitials =
    brandName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "S";

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <Container>
          <div className="flex flex-col items-center gap-3 py-5 text-center">
            <Link href="/" aria-label={brandName} className="inline-flex items-center">
              {checkoutLogoUrl ? (
                <Image
                  src={toOptimizableImageSrc(checkoutLogoUrl)}
                  alt={brandName}
                  width={220}
                  height={64}
                  className="h-14 w-auto max-w-[220px] object-contain"
                  priority
                />
              ) : (
                <span className="inline-flex items-center gap-2 text-2xl font-black tracking-tight text-neutral-900">
                  <span className="theme-primary-action inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-sm font-bold text-white">
                    {brandInitials}
                  </span>
                  {brandName}
                </span>
              )}
            </Link>
            <div className="hidden">
              <span className="rounded-full bg-neutral-100 px-3 py-1.5">🔒 Secure Checkout</span>
              <span className="rounded-full bg-neutral-100 px-3 py-1.5">🚚 Delivery Across Pakistan</span>
              <span className="rounded-full bg-neutral-100 px-3 py-1.5">💵 Cash on Delivery Available</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold text-neutral-700">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-neutral-800" aria-hidden="true" />
                Secure Checkout
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5">
                <Truck className="h-3.5 w-3.5 text-neutral-800" aria-hidden="true" />
                Delivery Across Pakistan
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5">
                <Banknote className="h-3.5 w-3.5 text-neutral-800" aria-hidden="true" />
                Cash on Delivery Available
              </span>
            </div>
          </div>
        </Container>
      </header>

      <StepIndicator
        steps={[
          checkoutSettings.yourDetailsStepLabel,
          checkoutSettings.deliveryAddressStepLabel,
          checkoutSettings.confirmOrderStepLabel,
        ]}
      />

      <main className="pb-28 pt-5 sm:py-8 lg:pb-8">
        <Container>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
            <section className="space-y-5">
              <div className="theme-card rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <Star className="h-4 w-4 fill-neutral-900" aria-hidden="true" />
                  Over 10,000+ orders delivered
                </div>
                <p className="mt-1 text-sm text-neutral-600">
                  Trusted by customers across Pakistan
                </p>
              </div>

              <SectionCard number={1} title={checkoutSettings.yourDetailsStepLabel}>
                <label className="block">
                  <span className="text-sm font-semibold text-neutral-800">{checkoutSettings.phoneLabel} *</span>
                  <input
                    ref={phoneRef}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder={checkoutSettings.phonePlaceholder}
                    inputMode="tel"
                    autoComplete="tel"
                    className={[
                      "mt-2 w-full rounded-2xl border bg-white px-4 py-4 text-base outline-none transition placeholder:text-neutral-400 focus:ring-4 focus:ring-neutral-900/10",
                      errors.phone ? "border-red-500 bg-red-50" : "border-neutral-300 focus:border-neutral-900",
                    ].join(" ")}
                  />
                  <p className="mt-2 text-sm text-neutral-500">
                    {checkoutSettings.phoneHelper}
                  </p>
                  <ErrorText message={errors.phone} />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-neutral-800">{checkoutSettings.fullNameLabel} *</span>
                  <input
                    ref={nameRef}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder={checkoutSettings.fullNamePlaceholder}
                    autoComplete="name"
                    className={[
                      "mt-2 w-full rounded-2xl border bg-white px-4 py-4 text-base outline-none transition placeholder:text-neutral-400 focus:ring-4 focus:ring-neutral-900/10",
                      errors.fullName ? "border-red-500 bg-red-50" : "border-neutral-300 focus:border-neutral-900",
                    ].join(" ")}
                  />
                  <ErrorText message={errors.fullName} />
                </label>

                {checkoutSettings.emailMode !== "hidden" ? (
                <label className="block">
                  <span className="text-sm font-semibold text-neutral-800">{checkoutSettings.emailLabel}</span>
                  {checkoutSettings.emailMode === "optional" ? (
                    <span className="ml-2 text-xs text-neutral-500">{checkoutSettings.emailOptionalLabel}</span>
                  ) : (
                    <span className="ml-2 text-xs text-neutral-500">*</span>
                  )}
                  <input
                    ref={emailRef}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={checkoutSettings.emailPlaceholder}
                    type="email"
                    autoComplete="email"
                    disabled={Boolean(userEmail)}
                    className={[
                      "mt-2 w-full rounded-2xl border bg-white px-4 py-4 text-base outline-none transition placeholder:text-neutral-400 focus:ring-4 focus:ring-neutral-900/10 disabled:bg-neutral-100 disabled:text-neutral-500",
                      errors.email ? "border-red-500 bg-red-50" : "border-neutral-300 focus:border-neutral-900",
                    ].join(" ")}
                  />
                  <ErrorText message={errors.email} />
                </label>
                ) : null}
              </SectionCard>

              <SectionCard number={2} title={checkoutSettings.deliveryAddressStepLabel}>
                <label className="block">
                  <span className="text-sm font-semibold text-neutral-800">{checkoutSettings.cityLabel} *</span>
                  <input
                    ref={cityRef}
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder={cityInputPlaceholder(checkoutSettings.cityPlaceholder)}
                    autoComplete="address-level2"
                    className={[
                      "mt-2 w-full rounded-2xl border bg-white px-4 py-4 text-base outline-none transition placeholder:text-neutral-400 focus:ring-4 focus:ring-neutral-900/10",
                      errors.city ? "border-red-500 bg-red-50" : "border-neutral-300 focus:border-neutral-900",
                    ].join(" ")}
                  />
                  <ErrorText message={errors.city} />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-neutral-800">{checkoutSettings.addressLabel} *</span>
                  <textarea
                    ref={addressRef}
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder={checkoutSettings.addressPlaceholder}
                    rows={4}
                    autoComplete="street-address"
                    className={[
                      "mt-2 w-full resize-none rounded-2xl border bg-white px-4 py-4 text-base outline-none transition placeholder:text-neutral-400 focus:ring-4 focus:ring-neutral-900/10",
                      errors.address ? "border-red-500 bg-red-50" : "border-neutral-300 focus:border-neutral-900",
                    ].join(" ")}
                  />
                  <p className="mt-2 text-sm text-neutral-500">
                    {checkoutSettings.addressHelper}
                  </p>
                  <ErrorText message={errors.address} />
                </label>
              </SectionCard>

              <SectionCard number={3} title={checkoutSettings.paymentSectionTitle}>
                <div className="rounded-3xl border-2 border-neutral-900 bg-neutral-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="theme-primary-action flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-white">
                      <Banknote className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-neutral-900">{globalCopy.checkout.codTitle}</p>
                      <p className="mt-1 text-sm text-neutral-600">{globalCopy.checkout.codHelper}</p>
                    </div>
                  </div>
                </div>

                {formError ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 lg:hidden">
                    {formError}
                  </div>
                ) : null}
              </SectionCard>
            </section>

            <aside className="lg:sticky lg:top-5">
              <div className="theme-card rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">{checkoutSettings.orderSummaryTitle}</h2>
                    <p className="mt-1 text-sm text-neutral-500">{totalItems} item(s)</p>
                  </div>
                  <LockKeyhole className="h-5 w-5 text-neutral-500" aria-hidden="true" />
                </div>

                {items.length === 0 ? (
                  <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    {checkoutSettings.emptyCartMessage}
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
                          <Image
                            src={withImageParams(
                              item.image || "/images/shopping.jpg",
                              "auto=format&fit=crop&w=320&q=85",
                            )}
                            alt={item.name}
                            width={320}
                            height={320}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold text-neutral-900">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">Quantity: {item.qty}</p>
                          {item.printText || item.printFileUrl ? (
                            <div className="mt-2 space-y-1 rounded-2xl bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                              {item.printText ? (
                                <p>
                                  <span className="font-medium text-neutral-900">Print:</span>{" "}
                                  {item.printText}
                                </p>
                              ) : null}
                              {item.printFileUrl ? (
                                <a
                                  href={item.printFileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-medium text-neutral-900 hover:underline"
                                >
                                  {item.printFileName || "View print file"}
                                </a>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                        <p className="shrink-0 text-sm font-semibold">
                          {formatMoney(item.price * item.qty, item.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 space-y-3 border-t border-neutral-200 pt-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Subtotal</span>
                    <span className="font-medium">{formatMoney(subtotal, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Shipping</span>
                    <span className="font-medium">{formatMoney(shippingCost, currency)}</span>
                  </div>
                  <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 text-neutral-900">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Total Payable
                    </p>
                    <p className="mt-1 text-3xl font-bold tracking-tight">
                      {formatMoney(total, currency)}
                    </p>
                  </div>
                </div>

                {formError ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {formError}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={submitting || items.length === 0}
                  className="cta-attention theme-primary-action mt-4 hidden min-h-16 w-full items-center justify-center gap-3 rounded-3xl bg-neutral-900 px-6 py-4 text-center text-base font-black text-white shadow-lg shadow-neutral-900/20 transition hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 lg:flex"
                >
                  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                  <span>
                    <span className="block">{submitting ? globalCopy.checkout.placingOrder : globalCopy.checkout.placeOrder}</span>
                    <span className="block text-xs font-semibold text-white/70">{globalCopy.checkout.placeOrderSubtext}</span>
                  </span>
                </button>

                <div className="theme-card mt-4 rounded-3xl border border-neutral-200 bg-white p-4 text-center">
                  <p className="text-sm font-semibold">{checkoutSettings.helpTitle}</p>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    {checkoutSettings.helpButtonLabel}
                  </a>
                </div>

              </div>
            </aside>
          </div>
        </Container>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(0,0,0,0.10)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1180px] items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">
              Total Payable
            </p>
            <p className="text-lg font-black leading-tight">{formatMoney(total, currency)}</p>
          </div>
          <button
            type="button"
            onClick={placeOrder}
            disabled={submitting || items.length === 0}
            className="cta-attention theme-primary-action ml-auto flex min-h-16 flex-1 items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-black text-white shadow-lg shadow-neutral-900/20 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            <span>
              <span className="block">{submitting ? globalCopy.checkout.placingOrder : globalCopy.checkout.placeOrder}</span>
              <span className="block text-[11px] font-semibold text-white/70">{globalCopy.checkout.placeOrderSubtext}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
