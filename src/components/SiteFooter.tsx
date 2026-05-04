"use client";

import Link from "next/link";
import Image from "next/image";
import { toOptimizableImageSrc } from "@/lib/image";
import { usePathname } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";

function Container({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

function Dot() {
  return <span className="inline-block h-1 w-1 rounded-full bg-neutral-300" />;
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-neutral-600 hover:text-neutral-900 transition"
    >
      {children}
    </Link>
  );
}

export default function SiteFooter() {
  const pathname = usePathname();

  const [branding, setBranding] = useState<{
    siteName?: string;
    logoUrl?: string;
    siteFooterText?: string;
  } | null>(null);
  const [contact, setContact] = useState<{
    phone?: string;
    whatsapp?: string;
    email?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    hoursWeekdays?: string;
    hoursWeekend?: string;
  } | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const settingsRes = await fetch("/api/site-settings", { cache: "no-store" });
        const settingsPayload = await settingsRes.json().catch(() => ({}));
        if (active && settingsRes.ok && settingsPayload?.ok) {
          setBranding(settingsPayload.data || null);
        }
        const res = await fetch("/api/contact", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!active) return;
        if (res.ok && payload?.ok) {
          setContact(payload.data || null);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const hideFooter = pathname?.startsWith("/admin");
  if (hideFooter) return null;

  const brandName = branding?.siteName?.trim() || "LuxStore";
  const footerText =
    branding?.siteFooterText?.trim() ||
    "Sahoolat.pk offers affordable water bottles in Pakistan including kids water bottles, school bottles, stainless steel bottles, BPA-free bottles and insulated bottles with fast delivery and secure checkout.";
  const brandInitials = brandName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase() || "LX";
  const contactEmail = contact?.email || "support@sahoolat.pk";
  const contactWhatsapp = contact?.whatsapp || "";
  const contactPhone = contact?.phone || "";
  const contactCity = contact?.city || "";
  const contactCountry = contact?.country || "";
  const contactHours = contact?.hoursWeekdays || "";
  const whatsappDigits = contactWhatsapp.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}` : "/contact";

  async function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload?.ok) {
        throw new Error(payload?.error || "Subscription failed");
      }
      setEmail("");
      setMessage("Subscribed! Watch your inbox for offers.");
    } catch {
      setMessage("Unable to subscribe right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="mt-16">
      {/* Premium Newsletter */}
      <section className="border-t border-neutral-200 bg-neutral-950 text-white">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 px-6 py-10 sm:px-10 lg:px-12">
            {/* subtle glow */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

            <div className="relative grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                  Premium updates only
                </p>

                <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Get drops, deals & restocks
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  Weekly emails. No spam. Just curated luxury picks and restock alerts.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-white/60">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-white/40" />
                    One email per week
                  </span>
                  <span className="hidden sm:inline text-white/25">/</span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-white/40" />
                    Unsubscribe anytime
                  </span>
                </div>
              </div>

              <div className="lg:col-span-6">
                <form onSubmit={handleSubscribe} className="grid gap-3 sm:grid-cols-12">
                  <div className="sm:col-span-8">
                    <input
                      className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/25"
                      placeholder="Enter your email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={submitting}
                    />
                    <p className="mt-2 text-[11px] text-white/50">
                      By subscribing you agree to our privacy policy.
                    </p>
                    {message ? (
                      <p className="mt-2 text-[11px] text-white/70">{message}</p>
                    ) : null}
                  </div>
                  <div className="sm:col-span-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-medium text-neutral-900 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting ? "Submitting..." : "Subscribe"}
                    </button>
                  </div>
                </form>

                {/* micro trust row */}
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[11px] font-semibold text-white">Authenticity</p>
                    <p className="mt-0.5 text-[11px] text-white/60">Verified items</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[11px] font-semibold text-white">Shipping</p>
                    <p className="mt-0.5 text-[11px] text-white/60">Fast dispatch</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[11px] font-semibold text-white">Support</p>
                    <p className="mt-0.5 text-[11px] text-white/60">WhatsApp help</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>

        {/* divider strip */}
        <div className="border-t border-white/10" />
      </section>

      {/* Main footer */}
      <section className="bg-white py-12">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Brand block */}
            <div className="lg:col-span-4">
              <Link href="/" className="inline-flex items-center">
                {branding?.logoUrl ? (
                  <Image
                    src={toOptimizableImageSrc(branding.logoUrl)}
                    alt={brandName}
                    width={180}
                    height={48}
                    className="h-12 w-auto object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="inline-flex h-12 w-12 items-center justify-center bg-neutral-900 text-white text-sm font-semibold">
                    {brandInitials}
                  </span>
                )}
              </Link>

              <p className="mt-4 max-w-sm text-sm text-neutral-600 leading-relaxed">
                {footerText}
              </p>
            </div>

            {/* Links */}
            <div className="lg:col-span-8">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Shop</p>
                  <ul className="mt-4 space-y-2">
                    <li><FooterLink href="/shop">Shop All</FooterLink></li>
                    <li><FooterLink href="/categories">Categories</FooterLink></li>
                    <li><FooterLink href="/deals">Deals</FooterLink></li>
                    <li><FooterLink href="/blog">Blog</FooterLink></li>
                    <li><FooterLink href="/cart">Cart</FooterLink></li>
                    <li><FooterLink href="/account">Account</FooterLink></li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold text-neutral-900">Company</p>
                  <ul className="mt-4 space-y-2">
                    <li><FooterLink href="/contact">Contact</FooterLink></li>
                    <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
                    <li><FooterLink href="/shipping">Shipping</FooterLink></li>
                    <li><FooterLink href="/returns">Returns</FooterLink></li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold text-neutral-900">Support</p>
                  <ul className="mt-4 space-y-2">
                    <li><FooterLink href="/faq">FAQ</FooterLink></li>
                    <li><FooterLink href="/returns">Returns</FooterLink></li>
                    <li><FooterLink href="/contact">Contact Us</FooterLink></li>
                    <li><FooterLink href="/account/orders">Track Order</FooterLink></li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold text-neutral-900">Contact</p>
                  <ul className="mt-4 space-y-2">
                    <li>
                      <FooterLink href={whatsappHref}>WhatsApp Support</FooterLink>
                    </li>
                    {contactPhone ? (
                      <li className="text-sm text-neutral-600">Call: {contactPhone}</li>
                    ) : null}
                    <li>
                      <a
                        className="text-sm text-neutral-600 hover:text-neutral-900 transition"
                        href={`mailto:${contactEmail}`}
                      >
                        {contactEmail}
                      </a>
                    </li>
                    {contactCity || contactCountry ? (
                      <li className="text-sm text-neutral-600">
                        {contactCity}
                        {contactCity && contactCountry ? ", " : ""}
                        {contactCountry}
                      </li>
                    ) : null}
                    {contactHours ? (
                      <li className="text-sm text-neutral-600">Hours: {contactHours}</li>
                    ) : null}
                  </ul>

                  {/* tiny payment row */}
                  <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <p className="text-xs font-semibold text-neutral-900">
                      Payments
                    </p>
                    <p className="mt-1 text-xs text-neutral-600">
                      Cards / Bank Transfer / COD (optional)
                    </p>
                  </div>
                </div>
              </div>

              {/* bottom strip inside main section */}
              <div className="mt-10 flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                  <span className="font-semibold text-neutral-900">Shipping:</span>
                  <span>Karachi</span>
                  <Dot />
                  <span>Lahore</span>
                  <Dot />
                  <span>Islamabad</span>
                  <Dot />
                  <span>Nationwide</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600">
                  <Link className="hover:text-neutral-900" href="/account/orders">
                    Track order
                  </Link>
                  <Link className="hover:text-neutral-900" href="/contact">
                    Support
                  </Link>
                  <Link className="hover:text-neutral-900" href="/account">
                    Account
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Final bar */}
          <div className="mt-10 flex flex-col gap-2 border-t border-neutral-200 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
            <p>Copyright © {new Date().getFullYear()} Softtex Solution. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/privacy" className="hover:text-neutral-900">Privacy</Link>
              <span className="text-neutral-300">/</span>
              <Link href="/shipping" className="hover:text-neutral-900">Shipping</Link>
              <span className="text-neutral-300">/</span>
              <Link href="/returns" className="hover:text-neutral-900">Returns</Link>
            </div>
          </div>
        </Container>
      </section>
    </footer>
  );
}
