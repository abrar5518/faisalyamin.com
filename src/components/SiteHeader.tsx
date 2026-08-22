"use client";

import Link from "next/link";
import Image from "next/image";
import { toOptimizableImageSrc } from "@/lib/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useCart } from "@/components/cart/CartProvider";
import {
  DEFAULT_HEADER_SEARCH_PLACEHOLDER,
  parseHeaderMenuItems,
  type HeaderMenuItem,
} from "@/lib/headerSettings";

function Container({ children }: { children: ReactNode }) {
  return (
    <div className="w-full px-[2.75vw] max-[700px]:px-[14px]">
      {children}
    </div>
  );
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function IconMenu({ open }: { open: boolean }) {
  return (
    <div className="relative h-4 w-5">
      <span
        className={[
          "absolute left-0 top-0 h-0.5 w-5 rounded-full bg-neutral-900 transition",
          open ? "translate-y-[7px] rotate-45" : "",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-neutral-900 transition",
          open ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-neutral-900 transition",
          open ? "-translate-y-[7px] -rotate-45" : "",
        ].join(" ")}
      />
    </div>
  );
}

function IconSearch() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4 text-neutral-600"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.5 15a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Zm5.2-1.3 3.1 3.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

type SiteSettingsPayload = {
  siteName?: string | null;
  logoUrl?: string | null;
  headerMenuItems?: string | null;
  headerSearchPlaceholder?: string | null;
  headerAnnouncementEnabled?: boolean;
  headerAnnouncementText?: string | null;
  headerAnnouncementHref?: string | null;
  headerShowSearch?: boolean;
  headerShowAccount?: boolean;
  headerShowCart?: boolean;
  headerShowSupportLinks?: boolean;
};

function formatFallbackAnnouncement(shippingFee: string) {
  return `Standard shipping ${shippingFee || "PKR 250"} across Pakistan`;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, openCart } = useCart();
  const [settings, setSettings] = useState<SiteSettingsPayload | null>(null);
  const [defaultShippingFee, setDefaultShippingFee] = useState("PKR 250");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [siteRes, storeRes] = await Promise.all([
          fetch("/api/site-settings", { cache: "no-store" }),
          fetch("/api/store-settings", { cache: "no-store" }),
        ]);
        const sitePayload = await siteRes.json().catch(() => ({}));
        const storePayload = await storeRes.json().catch(() => ({}));
        if (!active) return;

        if (siteRes.ok && sitePayload?.ok) {
          setSettings(sitePayload.data || null);
        }

        if (storeRes.ok && storePayload?.ok && storePayload.data?.defaultShippingFee) {
          setDefaultShippingFee(storePayload.data.defaultShippingFee);
        }
      } catch {
        // Header has safe defaults when public settings are unavailable.
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const hideHeader = pathname?.startsWith("/admin") || pathname?.startsWith("/checkout");
  const navItems = useMemo<HeaderMenuItem[]>(
    () =>
      parseHeaderMenuItems(settings?.headerMenuItems).filter(
        (item) => item.enabled !== false
      ),
    [settings?.headerMenuItems]
  );

  if (hideHeader) return null;

  const brandName = settings?.siteName?.trim() || "Faisal Yamin";
  const brandInitials =
    brandName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "ST";
  const searchPlaceholder =
    settings?.headerSearchPlaceholder?.trim() || DEFAULT_HEADER_SEARCH_PLACEHOLDER;
  const showAnnouncement = settings?.headerAnnouncementEnabled !== false;
  const showSearch = settings?.headerShowSearch !== false;
  const showAccount = settings?.headerShowAccount !== false;
  const showCart = settings?.headerShowCart !== false;
  const showSupportLinks = settings?.headerShowSupportLinks !== false;
  const announcementText =
    settings?.headerAnnouncementText
      ?.replaceAll("{{shippingFee}}", defaultShippingFee)
      .trim() || formatFallbackAnnouncement(defaultShippingFee);
  const announcementHref = settings?.headerAnnouncementHref?.trim();

  return (
    <>
      {showAnnouncement || showSupportLinks ? (
        <div className="ma-announcement-bar">
          <Container>
            <div className="ma-announcement-inner">
              {showAnnouncement ? (
                announcementHref ? (
                  <Link className="truncate hover:text-neutral-900" href={announcementHref}>
                    {announcementText}
                  </Link>
                ) : (
                  <p className="truncate">{announcementText}</p>
                )
              ) : (
                <span />
              )}

              {showSupportLinks ? (
                <div className="hidden shrink-0 items-center gap-4 sm:flex">
                  <Link className="hover:text-neutral-900" href="/account/orders">
                    Track Order
                  </Link>
                  <span className="text-neutral-300">-</span>
                  <Link className="hover:text-neutral-900" href="/contact">
                    Support
                  </Link>
                </div>
              ) : null}
            </div>
          </Container>
        </div>
      ) : null}

      <header className="ma-site-header theme-header sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <Container>
          <div className="ma-site-header-row flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen((s) => !s)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 md:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <IconMenu open={mobileOpen} />
            </button>

            <Link href="/" className="ma-header-brand flex shrink-0 items-center">
              {settings?.logoUrl ? (
                <Image
                  src={toOptimizableImageSrc(settings.logoUrl)}
                  alt={brandName}
                  width={160}
                  height={40}
                  className="h-10 w-auto max-w-[140px] object-contain sm:max-w-[160px]"
                  loading="lazy"
                />
              ) : (
                <span className="theme-primary-action inline-flex h-10 w-10 items-center justify-center bg-neutral-900 text-sm font-semibold text-white">
                  {brandInitials}
                </span>
              )}
            </Link>

            <nav className="ma-header-nav hidden items-center md:flex">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    className={[
                      "relative px-3 py-2 text-sm font-medium transition",
                      active
                        ? "text-neutral-900"
                        : "text-neutral-600 hover:text-neutral-900",
                    ].join(" ")}
                  >
                    {item.label}
                    {active ? (
                      <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full bg-neutral-900" />
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            {showSearch ? (
              <div className="hidden flex-1 justify-end lg:flex">
                <Link className="ma-header-text-action" href="/search">Search</Link>
              </div>
            ) : (
              <div className="hidden flex-1 lg:block" />
            )}

            <div className="ma-header-actions ml-auto flex items-center gap-2">
              {showAccount ? (
                <Link
                  href="/account"
                  className="ma-header-text-action hidden items-center sm:inline-flex"
                >
                  Account
                </Link>
              ) : null}

              {showSearch ? (
                <Link
                  href="/search"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 lg:hidden"
                  aria-label="Search"
                >
                  <IconSearch />
                </Link>
              ) : null}

              {showCart ? (
                <button
                  type="button"
                  onClick={openCart}
                  className="ma-header-cart inline-flex items-center gap-1"
                  aria-label={`Open cart with ${totalItems} ${
                    totalItems === 1 ? "item" : "items"
                  }`}
                >
                  Bag <span>({totalItems})</span>
                </button>
              ) : null}
            </div>
          </div>
        </Container>

        {mobileOpen ? (
          <div className="border-t border-neutral-200 bg-white md:hidden">
            <Container>
              <div className="py-4">
                {showSearch ? (
                  <form action="/search" className="mb-4">
                    <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm">
                      <IconSearch />
                      <input
                        name="q"
                        type="search"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                        placeholder={searchPlaceholder}
                      />
                      <button className="btn-primary px-4 py-2 text-xs" type="submit">
                        Go
                      </button>
                    </div>
                  </form>
                ) : null}

                <div className="grid gap-2">
                  {navItems.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <Link
                        key={`${item.label}-${item.href}`}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={[
                          "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                          active
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-200 hover:bg-neutral-50",
                        ].join(" ")}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                {showSupportLinks ? (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      href="/account/orders"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm hover:bg-neutral-50"
                    >
                      Track Order
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm hover:bg-neutral-50"
                    >
                      Support
                    </Link>
                  </div>
                ) : null}
              </div>
            </Container>
          </div>
        ) : null}
      </header>
    </>
  );
}
