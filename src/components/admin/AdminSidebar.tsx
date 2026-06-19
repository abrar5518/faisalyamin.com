// src/components/admin/AdminSidebar.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { toOptimizableImageSrc } from "@/lib/image";
import AdminSidebarNav from "./AdminSidebarNav";

export default async function AdminSidebar() {
  const settings = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
  const siteName = settings?.siteName?.trim() || "Store Admin";
  const logoUrl = settings?.logoUrl;

  return (
    <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-r lg:border-neutral-200 lg:bg-white">
      <div className="border-b border-neutral-200 p-5">
        <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-3">
          {logoUrl ? (
            <div className="relative flex h-11 w-32 shrink-0 items-center">
              <Image
                src={toOptimizableImageSrc(logoUrl)}
                alt={siteName}
                width={128}
                height={44}
                className="max-h-11 w-auto object-contain"
                priority
              />
            </div>
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-sm font-bold text-white">
              {siteName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-950">{siteName}</p>
            <p className="text-xs text-neutral-500">Admin workspace</p>
          </div>
        </Link>
      </div>

      <AdminSidebarNav />

      <div className="border-t border-neutral-200 p-5">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Next focus
          </p>
          <p className="mt-2 text-sm font-semibold text-neutral-900">Settings cleanup</p>
          <p className="mt-1 text-xs leading-5 text-neutral-600">
            Organize brand, store, tracking, and checkout controls into clear sections.
          </p>
        </div>
      </div>
    </aside>
  );
}
