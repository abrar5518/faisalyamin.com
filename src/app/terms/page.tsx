import type { Metadata } from "next";
import Link from "next/link";
import ManagedPageBody from "@/components/ManagedPageBody";
import Schema from "@/components/seo/Schema";
import { breadcrumbSchema } from "@/components/seo/schemas";
import {
  buildManagedPageMetadata,
  getManagedPage,
  hasManagedPageBody,
} from "@/lib/managedPage";
import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedPageMetadata("terms", {
    title: "Terms of Service",
    description: "Read the terms and conditions for using the store and placing orders.",
    keywords: "terms of service, terms and conditions, ecommerce terms",
  });
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

export default async function TermsPage() {
  const page = await getManagedPage("terms");
  const hasManagedContent = hasManagedPageBody(page);
  const baseUrlResolved = baseUrl.replace(/\/$/, "");
  const breadcrumbItems = baseUrlResolved
    ? [
        { name: "Home", item: baseUrlResolved },
        { name: page?.title || "Terms of Service", item: `${baseUrlResolved}/terms` },
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
            <span className="text-neutral-900">{page?.title || "Terms of Service"}</span>
          </div>
        </Container>
      </div>

      {hasManagedContent ? <ManagedPageBody page={page} /> : (
      <section className="bg-white py-12">
        <Container>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {page?.heroTitle || page?.title || "Terms of Service"}
          </h1>
          <p className="mt-3 text-sm text-neutral-600 sm:text-base">
            {page?.heroSubtitle ||
              page?.shortDescription ||
              "Please read these terms carefully before using our website."}
          </p>

          <div className="mt-8 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Orders and eligibility</p>
              <p className="mt-2 text-sm text-neutral-600">
                By placing an order you confirm you are authorized to use the payment method
                and provide accurate delivery information.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Pricing and availability</p>
              <p className="mt-2 text-sm text-neutral-600">
                Product prices and availability may change without notice. We reserve the right to
                cancel orders for pricing errors or stock issues.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Returns and refunds</p>
              <p className="mt-2 text-sm text-neutral-600">
                Returns are subject to our policy and eligibility checks. Please refer to the
                returns page for the latest rules.
              </p>
              <Link href="/returns" className="mt-3 inline-flex text-sm font-medium text-neutral-900 hover:underline">
                View return policy
              </Link>
            </div>
          </div>
        </Container>
      </section>
      )}
    </div>
  );
}
