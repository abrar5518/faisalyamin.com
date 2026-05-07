// src/app/admin/(panel)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { normalizeSiteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

const baseUrl = normalizeSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
  const siteName = settings?.siteName?.trim() || "LuxStore";

  return {
    title: `Admin Panel | ${siteName}`,
    description: `${siteName} admin panel - Manage store settings, products, and orders.`,
    alternates: { canonical: `${baseUrl}/admin` },
    robots: { index: false, follow: false },
    icons: settings?.siteIconUrl ? { icon: settings.siteIconUrl } : undefined,
  };
}

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies(); // ✅ IMPORTANT (Next 16)
  const token = cookieStore.get("admin_access_token")?.value;

  // ✅ Guard
  if (!token) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-[1360px] px-0 lg:px-0">
        <div className="lg:flex">
          <AdminSidebar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
