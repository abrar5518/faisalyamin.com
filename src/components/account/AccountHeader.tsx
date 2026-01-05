// src/components/account/AccountHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function titleFromPath(path: string) {
  if (path === "/account") return { title: "Overview", desc: "Your dashboard and quick actions." };
  if (path.startsWith("/account/profile")) return { title: "Profile", desc: "Update your personal info." };
  if (path.startsWith("/account/orders")) return { title: "Orders", desc: "Track and manage your orders." };
  if (path.startsWith("/account/addresses")) return { title: "Addresses", desc: "Manage shipping and billing addresses." };
  if (path.startsWith("/account/security")) return { title: "Security", desc: "Password, devices, and access." };
  if (path.startsWith("/account/wishlist")) return { title: "Wishlist", desc: "Saved items you liked." };
  return { title: "Account", desc: "Manage your account." };
}

export default function AccountHeader() {
  const pathname = usePathname();
  const { title, desc } = titleFromPath(pathname);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700">
          <span className="h-2 w-2 rounded-full bg-neutral-900" />
          My Account
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">{desc}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/shop"
          className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
        >
          Continue shopping
        </Link>
        <Link
          href="/"
          className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
