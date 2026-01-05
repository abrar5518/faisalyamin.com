import type { Metadata } from "next";
import Link from "next/link";

const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Returns",
  description: "Return policy, eligibility, and return steps.",
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
  return (
    <div className="min-h-screen bg-white text-neutral-900">
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
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Returns</h1>
          <p className="mt-3 text-sm text-neutral-600 sm:text-base">
            We want you to be confident in every purchase. Please review the return
            policy below.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Return window</p>
              <p className="mt-2 text-sm text-neutral-600">
                Returns are accepted within 7 days of delivery, subject to condition
                checks and eligibility.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Eligibility</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-neutral-600">
                <li>Item must be unused and in original condition</li>
                <li>All tags, accessories, and packaging must be included</li>
                <li>Proof of purchase is required</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">How to initiate a return</p>
              <p className="mt-2 text-sm text-neutral-600">
                Contact support with your order number and reason for return. Our
                team will provide return instructions.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Refunds</p>
              <p className="mt-2 text-sm text-neutral-600">
                Approved refunds are processed to the original payment method after
                inspection. Processing times may vary by bank.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
