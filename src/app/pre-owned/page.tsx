import type { Metadata } from "next";
import Link from "next/link";
import Schema from "@/components/seo/Schema";
import { breadcrumbSchema } from "@/components/seo/schemas";

const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Pre-Owned",
  description: "Certified pre-owned items and verified resale listings.",
  alternates: { canonical: `${baseUrl}/pre-owned` },
};

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

export default function PreOwnedPage() {
  const baseUrlResolved = baseUrl.replace(/\/$/, "");
  const breadcrumbItems = baseUrlResolved
    ? [
        { name: "Home", item: baseUrlResolved },
        { name: "Pre-Owned", item: `${baseUrlResolved}/pre-owned` },
      ]
    : [];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {breadcrumbItems.length ? <Schema data={breadcrumbSchema(breadcrumbItems)} /> : null}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">Home</Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">Pre-Owned</span>
          </div>
        </Container>
      </div>

      <section className="bg-white py-12">
        <Container>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pre-owned collection</h1>
          <p className="mt-3 text-sm text-neutral-600 sm:text-base">
            Verified pre-owned items with authenticity checks and transparent condition grading.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Authenticity checks</p>
              <p className="mt-2 text-sm text-neutral-600">
                Every pre-owned item goes through verification before listing and again before dispatch.
              </p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Condition grading</p>
              <p className="mt-2 text-sm text-neutral-600">
                Condition notes, photos, and wear details are shared so you can buy with confidence.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
            <p className="text-sm font-semibold">Looking for a specific piece?</p>
            <p className="mt-2 text-sm text-neutral-600">
              Tell us your preferred brand and budget and we’ll recommend the best options.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/shop" className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800">
                Browse shop
              </Link>
              <Link href="/contact" className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50">
                Contact support
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
