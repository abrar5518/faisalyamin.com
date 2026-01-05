// src/components/admin/AdminSidebar.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/subcategories", label: "Subcategories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/contact", label: "Contact" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/apis", label: "APIs" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminSidebar() {
  const settings = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
  const siteName = settings?.siteName?.trim() || "LuxStore";
  const logoUrl = settings?.logoUrl;

  return (
    <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:gap-4 lg:border-r lg:border-neutral-200 lg:bg-white lg:p-5">
      <Link href="/admin/dashboard" className="flex items-center gap-3">
        {logoUrl && (
          <div className="relative h-10 w-auto shrink-0">
            <Image
              src={logoUrl}
              alt={siteName}
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </div>
        )}
        
      </Link>

      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-3">
        <p className="text-xs font-semibold text-neutral-700">Navigation</p>
        <nav className="mt-2 grid gap-1">
          {NAV.map((x) => (
            <Link
              key={x.href}
              href={x.href}
              className="rounded-2xl px-3 py-2 text-sm text-neutral-700 hover:bg-white hover:text-neutral-900"
            >
              {x.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto rounded-3xl border border-neutral-200 bg-white p-4">
        <p className="text-xs font-semibold">Tips</p>
        <p className="mt-1 text-xs text-neutral-600">
          Keep product titles consistent and use SEO descriptions for category pages.
        </p>
      </div>
    </aside>
  );
}
