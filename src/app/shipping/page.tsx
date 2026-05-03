import type { Metadata } from "next";
import Link from "next/link";
import Schema from "@/components/seo/Schema";
import { breadcrumbSchema } from "@/components/seo/schemas";

const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Shipping & Delivery Information | Sahoolat Pakistan",
  description: "Check shipping times, delivery charges, and policies for water bottles across Pakistan at Sahoolat.",
  keywords: "shipping Pakistan, delivery bottles, Sahoolat shipping",
  alternates: { canonical: `${baseUrl}/shipping` },
};

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

export default function ShippingPage() {
  const baseUrlResolved = baseUrl.replace(/\/$/, "");
  const breadcrumbItems = baseUrlResolved
    ? [
        { name: "Home", item: baseUrlResolved },
        { name: "Shipping", item: `${baseUrlResolved}/shipping` },
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
            <span className="text-neutral-900">Shipping</span>
          </div>
        </Container>
      </div>

      <section className="bg-white py-12">
        <Container>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Shipping</h1>
          <p className="mt-3 text-sm text-neutral-600 sm:text-base">
            We ship insured orders with tracking and signature on delivery.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Processing time</p>
              <p className="mt-2 text-sm text-neutral-600">
                Orders are processed within 24 to 48 hours (business days). High value
                orders may require verification before dispatch.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Delivery timelines</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-neutral-600">
                <li>Local delivery: 1 to 3 business days</li>
                <li>Nationwide delivery: 2 to 5 business days</li>
                <li>Remote areas: 3 to 7 business days</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Shipping fees</p>
              <p className="mt-2 text-sm text-neutral-600">
                Shipping fees are calculated at checkout. Free shipping may apply on
                qualifying orders.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Tracking and delivery</p>
              <p className="mt-2 text-sm text-neutral-600">
                A tracking number is shared once your order ships. Signature is required
                for delivery.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
