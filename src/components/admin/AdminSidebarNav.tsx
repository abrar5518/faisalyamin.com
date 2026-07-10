"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgePercent,
  BookOpenText,
  Boxes,
  ChartNoAxesCombined,
  ClipboardCheck,
  FileText,
  Gift,
  Home,
  Layers3,
  LayoutGrid,
  Mail,
  MessageSquareText,
  Package,
  Plug,
  Route,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Dashboard",
    items: [
      { href: "/admin/dashboard", label: "Overview", icon: ChartNoAxesCombined },
      { href: "/admin/onboarding", label: "Onboarding", icon: ClipboardCheck },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/home", label: "Home", icon: Home },
      { href: "/admin/pages", label: "Pages", icon: FileText },
      { href: "/admin/blog", label: "Blog", icon: BookOpenText },
      { href: "/admin/reusable-blocks", label: "Reusable Blocks", icon: Layers3 },
      { href: "/admin/contact", label: "Contact", icon: Mail },
    ],
  },
  {
    label: "Store",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: LayoutGrid },
      { href: "/admin/subcategories", label: "Subcategories", icon: Boxes },
      { href: "/admin/shop", label: "Shop", icon: Store },
      { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
    ],
  },
  {
    label: "Orders",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/subscriptions", label: "Subscriptions", icon: ShoppingBag },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/coupons", label: "Coupons", icon: BadgePercent },
      { href: "/admin/loyalty", label: "Loyalty", icon: Gift },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/redirects", label: "Redirects", icon: Route },
      { href: "/admin/apis", label: "APIs", icon: Plug },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin/dashboard") return pathname === href || pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5">
      {NAV_GROUPS.map((group) => (
        <section key={group.label}>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
            {group.label}
          </p>
          <div className="mt-2 space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-neutral-950 text-white shadow-sm"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-neutral-500"}`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}
