// src/app/(auth)/layout.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { toOptimizableImageSrc } from "@/lib/image";

export const metadata = {
  title: "Account access",
  robots: { index: false, follow: false },
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const siteSettings = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
  const siteName = siteSettings?.siteName || "Faisal Yamin";
  const logoUrl = siteSettings?.logoUrl || null;
  const logoAlt = siteSettings?.logoAlt || siteName;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Top bar */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <div className="flex h-10 items-center justify-between text-xs text-neutral-600">
            <p>Secure account access</p>
            <div className="flex items-center gap-4">
              <Link className="hover:text-neutral-900" href="/contact">
                Support
              </Link>
              <Link className="hover:text-neutral-900" href="/account/orders">
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Centered auth shell */}
      <main className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
        <div className="grid min-h-[calc(100vh-40px)] items-center py-10 lg:grid-cols-12 lg:gap-10">
          {/* Left brand panel (desktop) */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8">
              <Link href="/" aria-label={siteName} className="inline-flex">
                {logoUrl ? (
                  <span className="inline-flex h-16 w-40 items-center justify-center overflow-hidden">
                    <Image
                      src={toOptimizableImageSrc(logoUrl)}
                      alt={logoAlt}
                      width={160}
                      height={64}
                      className="h-full w-full object-contain"
                      priority
                    />
                  </span>
                ) : (
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-white text-base font-semibold">
                    {siteName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </Link>

              <h2 className="mt-8 text-2xl font-semibold tracking-tight">
                Premium pieces. Secure checkout. Clean experience.
              </h2>
              <p className="mt-3 text-sm text-neutral-600">
                Sign in to manage orders, addresses, and account security. Your data stays protected.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  { t: "Quality checked", d: "Checked before dispatch" },
                  { t: "Insured shipping", d: "Tracked end-to-end" },
                  { t: "Priority support", d: "WhatsApp + email" },
                  { t: "Easy returns", d: "7-day policy" },
                ].map((x) => (
                  <div key={x.t} className="rounded-2xl border border-neutral-200 bg-white p-4">
                    <p className="text-xs font-semibold">{x.t}</p>
                    <p className="mt-1 text-xs text-neutral-600">{x.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right form area */}
          <div className="lg:col-span-7">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
