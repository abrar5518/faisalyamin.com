import type { Metadata } from "next";
import Link from "next/link";
import Schema from "@/components/seo/Schema";
import { breadcrumbSchema } from "@/components/seo/schemas";
import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata: Metadata = {
  title: "Return & Refund Policy | Sahoolat Pakistan",
  description: "Read Sahoolat's Pakistan return and refund policy, including return window, eligible products, return method, fees, exchanges and refund timing.",
  keywords: "Sahoolat return policy, refund policy Pakistan, exchange policy Pakistan, water bottle returns",
  alternates: { canonical: `${baseUrl}/returns` },
};

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

export default function ReturnsPage() {
  const baseUrlResolved = baseUrl.replace(/\/$/, "");
  const breadcrumbItems = baseUrlResolved
    ? [
        { name: "Home", item: baseUrlResolved },
        { name: "Returns", item: `${baseUrlResolved}/returns` },
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
            <span className="text-neutral-900">Returns</span>
          </div>
        </Container>
      </div>

      <section className="bg-white py-12">
        <Container>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Return & Refund Policy</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            This return policy applies to orders delivered within Pakistan through
            Sahoolat. It is available publicly without login so customers can review
            return, exchange and refund terms before placing an order.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Return window</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                You may request a return within 7 days from the date your order is
                delivered. Return requests made after 7 days may not be accepted.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Returns we accept</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-600">
                <li>Defective, damaged or incorrect items received by the customer</li>
                <li>Non-defective items if they are unused, unopened and eligible</li>
                <li>Items that are complete with original packaging and accessories</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Product condition</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Returned products must be in new, unused and resaleable condition.
                For hygiene and safety, used bottles, opened drinkware, missing parts,
                damaged packaging or products with signs of use may be rejected.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Items not eligible for return</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-600">
                <li>Products used, washed, filled with liquid or damaged after delivery</li>
                <li>Items returned without original packaging, accessories or invoice</li>
                <li>Products damaged due to misuse, accidental breakage or improper care</li>
                <li>Clearance or final-sale products where marked as non-returnable</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">How to request a return</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-neutral-600">
                <li>Contact our support team within 7 days of delivery.</li>
                <li>Share your order number, reason for return and clear photos or video.</li>
                <li>Wait for return approval and instructions before sending the item back.</li>
                <li>Pack the item safely with all original packaging and accessories.</li>
              </ol>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Return shipping fee</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                If the item is damaged, defective or incorrect due to our mistake,
                Sahoolat will guide you on the return shipping process. For buyer
                remorse, wrong item ordered, change of mind or exchange requests,
                the customer may be responsible for return shipping charges.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Refund process and timing</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Once we receive and inspect the returned item, approved refunds are
                processed within 7 to 10 business days. Refunds may be issued through
                the original payment method, bank transfer, mobile wallet or store
                credit depending on how the order was paid.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Exchanges</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Exchanges may be accepted within 7 days if the product is unused,
                eligible and the requested replacement is available. Price differences
                and additional shipping charges may apply.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
            <p className="text-sm font-semibold">Return policy summary for Pakistan</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Return window", "7 days from delivery"],
                ["Return method", "Contact support for approval"],
                ["Product condition", "Unused and original packaging"],
                ["Refund timing", "7 to 10 business days after approval"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold text-neutral-900">{label}</p>
                  <p className="mt-1 text-xs text-neutral-600">{value}</p>
                </div>
              ))}
            </div>
            <Link href="/contact" className="mt-5 inline-flex rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800">
              Start a return request
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
