"use client";

import Link from "next/link";
import Image from "next/image";
import { toOptimizableImageSrc } from "@/lib/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useCart } from "@/components/cart/CartProvider";

function Container({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

const MAIN_NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/deals", label: "Deals" },
  { href: "/blog", label: "Blog" },
];

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

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const [branding, setBranding] = useState<{
    siteName?: string;
    logoUrl?: string;
  } | null>(null);
  const shippingFee = "250";

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/site-settings", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!active) return;
        if (res.ok && payload?.ok) {
          setBranding(payload.data || null);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const hideHeader = pathname?.startsWith("/admin");
  if (hideHeader) return null;

  const brandName = branding?.siteName?.trim() || "Sahoolat";
  const brandInitials = brandName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase() || "LX";

  return (
    <>
      {/* Top bar */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-9 items-center justify-between text-xs text-neutral-600">
            <p className="truncate">
              Standard shipping <span className="text-neutral-900 font-medium">PKR {shippingFee}</span> across Pakistan
            </p>

            <div className="hidden sm:flex items-center gap-4">
              <Link className="hover:text-neutral-900" href="/account/orders">
                Track Order
              </Link>
              <span className="text-neutral-300">•</span>
              <Link className="hover:text-neutral-900" href="/contact">
                Support
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <Container>
          <div className="flex h-16 items-center gap-3">
            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setMobileOpen((s) => !s)}
              className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <IconMenu open={mobileOpen} />
            </button>

            {/* Brand */}
            <Link href="/" className="flex items-center shrink-0">
              {branding?.logoUrl ? (
                <Image
                  src={toOptimizableImageSrc(branding.logoUrl)}
                  alt={brandName}
                  width={160}
                  height={40}
                  className="h-10 w-auto max-w-[140px] sm:max-w-[160px] object-contain"
                  loading="lazy"
                />
              ) : (
                <span className="inline-flex h-10 w-10 items-center justify-center bg-neutral-900 text-white text-sm font-semibold">
                  {brandInitials}
                </span>
              )}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 ml-6">
              {MAIN_NAV.map((l) => {
                const active = isActive(pathname, l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={[
                      "relative rounded-xl px-3 py-2 text-sm font-medium transition",
                      active
                        ? "text-neutral-900"
                        : "text-neutral-600 hover:text-neutral-900",
                    ].join(" ")}
                  >
                    {l.label}
                    {active ? (
                      <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full bg-neutral-900" />
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            {/* Search (desktop, balanced) */}
            <div className="hidden lg:flex flex-1 justify-center px-6">
              <form action="/search" className="w-full max-w-[520px]">
                <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm">
                  <IconSearch />
                  <input
                    name="q"
                    type="search"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                    placeholder="Search water bottles, kids bottles, school bottles..."
                  />
                  <button className="btn-primary px-4 py-2 text-xs" type="submit">
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/account"
                className="hidden sm:inline-flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
              >
                Account
              </Link>

              {/* Mobile search */}
              <Link
                href="/search"
                className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50"
                aria-label="Search"
              >
                <IconSearch />
              </Link>

              <Link
                href="/cart"
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Cart
                <span className="rounded-lg bg-white/15 px-2 py-0.5 text-xs">
                  {totalItems}
                </span>
              </Link>
            </div>
          </div>
        </Container>

        {/* Mobile panel */}
        {mobileOpen ? (
          <div className="border-t border-neutral-200 bg-white md:hidden">
            <Container>
              <div className="py-4">
                <form action="/search" className="mb-4">
                  <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm">
                    <IconSearch />
                    <input
                      name="q"
                      type="search"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                      placeholder="Search water bottles, kids bottles, school bottles..."
                    />
                    <button className="btn-primary px-4 py-2 text-xs" type="submit">
                      Go
                    </button>
                  </div>
                </form>

                <div className="grid gap-2">
                  {MAIN_NAV.map((l) => {
                    const active = isActive(pathname, l.href);
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setMobileOpen(false)}
                        className={[
                          "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                          active
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-200 hover:bg-neutral-50",
                        ].join(" ")}
                      >
                        {l.label}
                      </Link>
                    );
                  })}
                </div>

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
              </div>
            </Container>
          </div>
        ) : null}
      </header>
    </>
  );
}
