import type { Metadata } from "next";
import Link from "next/link";
import Schema from "@/components/seo/Schema";
import { breadcrumbSchema } from "@/components/seo/schemas";
import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata: Metadata = {
  title: "Shipping Policy | Sahoolat Pakistan",
  description: "Read Sahoolat's Pakistan shipping policy, including delivery areas, shipping charges, dispatch time, tracking, failed delivery and cash on delivery details.",
  keywords: "Sahoolat shipping policy, delivery Pakistan, shipping charges Pakistan, COD delivery Pakistan",
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
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Shipping Policy</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            Sahoolat currently ships products within Pakistan only. This page explains
            our delivery areas, processing time, shipping cost, tracking and delivery
            rules so customers can review our policy before placing an order.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Delivery areas</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                We deliver across Pakistan, including major cities such as Karachi,
                Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta
                and other serviceable areas covered by our courier partners.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Processing and dispatch time</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Orders are usually processed within 24 to 48 business hours after
                order confirmation. Orders placed on public holidays, Sundays or
                after business hours are processed on the next working day.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Estimated delivery time</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-600">
                <li>Major cities: usually 2 to 4 business days after dispatch</li>
                <li>Other cities and towns: usually 3 to 6 business days after dispatch</li>
                <li>Remote areas: delivery may take 5 to 8 business days</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Shipping fees</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Standard shipping is charged at checkout and is shown before you
                confirm your order. Our current standard shipping fee is PKR 200
                unless a free shipping offer or promotion applies.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Tracking information</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Once your order is dispatched, we may share tracking details by SMS,
                WhatsApp, email or order status page depending on the information
                provided at checkout.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Cash on delivery</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Cash on delivery may be available for eligible orders within Pakistan.
                Some orders may require phone or WhatsApp confirmation before dispatch.
                If confirmation is not completed, the order may be delayed or cancelled.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Failed delivery attempts</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Please provide a complete address and reachable phone number. If the
                courier cannot deliver due to incorrect address, unavailable customer
                or refused delivery, the order may be returned to us and shipping
                charges may not be refundable.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
            <p className="text-sm font-semibold">Need help with delivery?</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              For shipping questions, order tracking or delivery address updates,
              contact us through the Contact page as soon as possible.
            </p>
            <Link href="/contact" className="mt-4 inline-flex rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800">
              Contact support
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
