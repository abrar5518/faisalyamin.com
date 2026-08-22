"use client";

import Link from "next/link";
import Image from "next/image";
import { toOptimizableImageSrc } from "@/lib/image";
import { usePathname } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { buildWhatsAppHref } from "@/lib/contact";
import {
  DEFAULT_FOOTER_COPYRIGHT,
  DEFAULT_FOOTER_NEWSLETTER,
  parseFooterColumns,
  parseFooterSocialLinks,
  parseFooterTrustItems,
  type FooterColumn,
  type FooterSocialLink,
  type FooterTrustItem,
} from "@/lib/footerSettings";

function Container({ children }: { children: ReactNode }) {
  return (
    <div className="w-full px-[2.75vw] max-[700px]:px-[14px]">
      {children}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-neutral-600 transition hover:text-neutral-900"
    >
      {children}
    </Link>
  );
}

type SiteSettingsPayload = {
  siteName?: string | null;
  logoUrl?: string | null;
  siteFooterText?: string | null;
  footerCopyright?: string | null;
  footerColumns?: string | null;
  footerNewsletterEnabled?: boolean;
  footerNewsletterEyebrow?: string | null;
  footerNewsletterTitle?: string | null;
  footerNewsletterSubtitle?: string | null;
  footerNewsletterConsentText?: string | null;
  footerTrustItems?: string | null;
  footerSocialLinks?: string | null;
};

type ContactPayload = {
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  city?: string | null;
  country?: string | null;
  hoursWeekdays?: string | null;
};

function renderTemplate(value: string, siteName: string) {
  return value
    .replaceAll("{{year}}", String(new Date().getFullYear()))
    .replaceAll("{{siteName}}", siteName);
}

export default function SiteFooter() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<SiteSettingsPayload | null>(null);
  const [contact, setContact] = useState<ContactPayload | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [settingsRes, contactRes] = await Promise.all([
          fetch("/api/site-settings", { cache: "no-store" }),
          fetch("/api/contact", { cache: "no-store" }),
        ]);
        const settingsPayload = await settingsRes.json().catch(() => ({}));
        const contactPayload = await contactRes.json().catch(() => ({}));
        if (!active) return;

        if (settingsRes.ok && settingsPayload?.ok) {
          setSettings(settingsPayload.data || null);
        }

        if (contactRes.ok && contactPayload?.ok) {
          setContact(contactPayload.data || null);
        }
      } catch {
        // Footer keeps safe defaults when public settings are unavailable.
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const hideFooter = pathname?.startsWith("/admin") || pathname?.startsWith("/checkout");
  const footerColumns = useMemo<FooterColumn[]>(
    () =>
      parseFooterColumns(settings?.footerColumns).filter(
        (column) => column.enabled !== false
      ),
    [settings?.footerColumns]
  );
  const footerTrustItems = useMemo<FooterTrustItem[]>(
    () =>
      parseFooterTrustItems(settings?.footerTrustItems).filter(
        (item) => item.enabled !== false
      ),
    [settings?.footerTrustItems]
  );
  const footerSocialLinks = useMemo<FooterSocialLink[]>(
    () =>
      parseFooterSocialLinks(settings?.footerSocialLinks).filter(
        (item) => item.enabled !== false
      ),
    [settings?.footerSocialLinks]
  );

  if (hideFooter) return null;

  const brandName = settings?.siteName?.trim() || "Faisal Yamin";
  const footerText =
    settings?.siteFooterText?.trim() ||
    "Shop quality products with secure checkout, clear support, and reliable delivery across Pakistan.";
  const brandInitials =
    brandName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "ST";
  const contactEmail = contact?.email || "";
  const contactWhatsapp = contact?.whatsapp || "";
  const contactPhone = contact?.phone || "";
  const contactCity = contact?.city || "";
  const contactCountry = contact?.country || "";
  const contactHours = contact?.hoursWeekdays || "";
  const whatsappHref = buildWhatsAppHref(contactWhatsapp);
  const showNewsletter = settings?.footerNewsletterEnabled !== false;
  const newsletterEyebrow =
    settings?.footerNewsletterEyebrow?.trim() || DEFAULT_FOOTER_NEWSLETTER.eyebrow;
  const newsletterTitle =
    settings?.footerNewsletterTitle?.trim() || DEFAULT_FOOTER_NEWSLETTER.title;
  const newsletterSubtitle =
    settings?.footerNewsletterSubtitle?.trim() || DEFAULT_FOOTER_NEWSLETTER.subtitle;
  const newsletterConsent =
    settings?.footerNewsletterConsentText?.trim() ||
    DEFAULT_FOOTER_NEWSLETTER.consentText;
  const copyright = renderTemplate(
    settings?.footerCopyright?.trim() || DEFAULT_FOOTER_COPYRIGHT,
    brandName
  );

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
      setMessage("Subscribed. Watch your inbox for offers.");
    } catch {
      setMessage("Unable to subscribe right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="ma-site-footer mt-16">
      {showNewsletter ? (
        <section className="theme-border theme-footer-cta border-t border-neutral-200 bg-neutral-950 text-white">
          <Container>
            <div className="theme-footer-cta relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 px-6 py-10 sm:px-10 lg:px-12">
              <div className="relative grid items-center gap-8 lg:grid-cols-12">
                <div className="lg:col-span-6">
                  <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                    {newsletterEyebrow}
                  </p>

                  <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {newsletterTitle}
                  </h3>
                  <p className="mt-2 text-sm text-white/70">
                    {newsletterSubtitle}
                  </p>
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
                      <p className="mt-2 text-xs text-white/50">
                        {newsletterConsent}
                      </p>
                      {message ? (
                        <p className="mt-2 text-xs text-white/70">{message}</p>
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

                  {footerTrustItems.length ? (
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {footerTrustItems.map((item) => (
                        <div
                          key={`${item.title}-${item.description}`}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                        >
                          <p className="text-xs font-semibold text-white">
                            {item.title}
                          </p>
                          {item.description ? (
                            <p className="mt-0.5 text-xs text-white/60">
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </Container>
          <div className="border-t border-white/10" />
        </section>
      ) : null}

      <section className="ma-footer-main py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Link href="/" className="inline-flex items-center">
                {settings?.logoUrl ? (
                  <Image
                    src={toOptimizableImageSrc(settings.logoUrl)}
                    alt={brandName}
                    width={180}
                    height={48}
                    className="h-12 w-auto object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="inline-flex h-12 w-12 items-center justify-center bg-neutral-900 text-sm font-semibold text-white">
                    {brandInitials}
                  </span>
                )}
              </Link>

              <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-600">
                {footerText}
              </p>

              <div className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-neutral-900 shadow-sm">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-neutral-900">
                    Pakistan-based online shopping store
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Serving customers across Pakistan
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {footerColumns.map((column) => (
                  <div key={column.title}>
                    <p className="text-sm font-semibold text-neutral-900">
                      {column.title}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {column.links
                        .filter((link) => link.enabled !== false)
                        .map((link) => (
                          <li key={`${column.title}-${link.label}-${link.href}`}>
                            <FooterLink href={link.href}>{link.label}</FooterLink>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}

                <div>
                  <p className="text-sm font-semibold text-neutral-900">Contact</p>
                  <ul className="mt-4 space-y-2">
                    <li>
                      <FooterLink href={whatsappHref}>WhatsApp Support</FooterLink>
                    </li>
                    {contactPhone ? (
                      <li className="text-sm text-neutral-600">Call: {contactPhone}</li>
                    ) : null}
                    {contactEmail ? (
                      <li>
                        <a
                          className="text-sm text-neutral-600 transition hover:text-neutral-900"
                          href={`mailto:${contactEmail}`}
                        >
                          {contactEmail}
                        </a>
                      </li>
                    ) : null}
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
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
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

                {footerSocialLinks.length ? (
                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600">
                    {footerSocialLinks.map((item) => (
                      <Link
                        key={`${item.label}-${item.href}`}
                        className="hover:text-neutral-900"
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-neutral-200 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
            <p>{copyright}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/privacy" className="hover:text-neutral-900">
                Privacy
              </Link>
              <span className="text-neutral-300">/</span>
              <Link href="/shipping" className="hover:text-neutral-900">
                Shipping
              </Link>
              <span className="text-neutral-300">/</span>
              <Link href="/returns" className="hover:text-neutral-900">
                Returns
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </footer>
  );
}
