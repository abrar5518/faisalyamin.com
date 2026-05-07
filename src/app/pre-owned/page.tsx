import type { Metadata } from "next";
import Link from "next/link";
import Schema from "@/components/seo/Schema";
import { breadcrumbSchema } from "@/components/seo/schemas";
import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata: Metadata = {
  title: "Water Bottle Deals | Sahoolat",
  description: "Browse Sahoolat water bottle deals and affordable bottle offers in Pakistan.",
  keywords: "water bottle deals Pakistan, bottle offers, Sahoolat deals",
  alternates: { canonical: `${baseUrl}/pre-owned` },
  robots: { index: false, follow: true },
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
        { name: "Deals", item: `${baseUrlResolved}/pre-owned` },
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
            <span className="text-neutral-900">Deals</span>
          </div>
        </Container>
      </div>

      <section className="bg-white py-12">
        <Container>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Water bottle deals</h1>
          <p className="mt-3 text-sm text-neutral-600 sm:text-base">
            Explore affordable water bottle deals in Pakistan. For the latest products and prices, browse the shop.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Quality checks</p>
              <p className="mt-2 text-sm text-neutral-600">
                Bottle body, lid, straw, handle and packaging are checked before dispatch.
              </p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Clear product details</p>
              <p className="mt-2 text-sm text-neutral-600">
                Product photos, size, material and delivery details are shared so you can buy with confidence.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
            <p className="text-sm font-semibold">Looking for a specific bottle?</p>
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
