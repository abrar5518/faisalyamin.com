// src/components/account/AccountSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  label: string;
  href: string;
  desc?: string;
};

function buildWhatsappHref(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "").replace(/^\+/, "");
  return digits ? `https://wa.me/${digits}` : "/contact";
}

const NAV: NavItem[] = [
  { label: "Overview", href: "/account", desc: "Dashboard & quick actions" },
  { label: "Profile", href: "/account/profile", desc: "Personal information" },
  { label: "Orders", href: "/account/orders", desc: "Track & manage orders" },
  { label: "Addresses", href: "/account/addresses", desc: "Shipping & billing" },
  { label: "Security", href: "/account/security", desc: "Password & access" },
  { label: "Wishlist", href: "/account/wishlist", desc: "Saved items" },
];

function Item({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = pathname === item.href;

  return (
    <Link
      href={item.href}
      className={[
        "group flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 transition",
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white hover:bg-neutral-50",
      ].join(" ")}
    >
      <div>
        <p className="text-sm font-medium">{item.label}</p>
        {item.desc ? (
          <p
            className={[
              "mt-1 text-xs",
              active ? "text-white/70" : "text-neutral-500",
            ].join(" ")}
          >
            {item.desc}
          </p>
        ) : null}
      </div>

      <span
        className={[
          "mt-1 text-xs",
          active ? "text-white/70" : "text-neutral-400 group-hover:text-neutral-600",
        ].join(" ")}
      >
        &gt;
      </span>
    </Link>
  );
}

export default function AccountSidebar() {
  const [userName, setUserName] = useState("Account");
  const [userEmail, setUserEmail] = useState("");
  const [whatsappHref, setWhatsappHref] = useState("/contact");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/account/me", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) return;
        if (active) {
          setUserName(payload?.data?.name ?? "Account");
          setUserEmail(payload?.data?.email ?? "");
        }
      } catch {
        if (active) {
          setUserName("Account");
          setUserEmail("");
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadContact() {
      try {
        const res = await fetch("/api/contact", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) return;
        if (active) {
          setWhatsappHref(buildWhatsappHref(payload?.data?.whatsapp ?? ""));
        }
      } catch {
        if (active) {
          setWhatsappHref("/contact");
        }
      }
    }
    loadContact();
    return () => {
      active = false;
    };
  }, []);

  const userInitials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "AC";

  return (
    <aside className="space-y-4">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-white text-lg font-semibold">
            {userInitials}
          </span>
          <div className="leading-tight">
            <p className="text-base font-semibold text-neutral-900">{userName}</p>
            <p className="text-xs text-neutral-500">{userEmail || " "}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs font-semibold">Signed in as</p>
          <p className="mt-1 text-sm font-medium text-neutral-900">{userName}</p>
          <p className="mt-1 text-xs text-neutral-500">{userEmail || " "}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
        <p className="px-2 pb-2 text-xs font-semibold text-neutral-700">Navigation</p>
        <div className="grid gap-2">
          {NAV.map((item) => (
            <Item key={item.href} item={item} />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
        <p className="text-sm font-semibold">Need help?</p>
        <p className="mt-2 text-sm text-neutral-600">
          WhatsApp support for shipping, returns and product questions.
        </p>
        <div className="mt-4 grid gap-2">
          <Link
            href={whatsappHref}
            className="rounded-2xl bg-neutral-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
          >
            Contact support
          </Link>
          <Link
            href="/account/orders"
            className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-center text-sm font-medium hover:bg-neutral-50"
          >
            Track order
          </Link>
        </div>
      </div>
    </aside>
  );
}
