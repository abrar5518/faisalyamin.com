import type { Metadata } from "next";
import Link from "next/link";
import Schema from "@/components/seo/Schema";
import { breadcrumbSchema } from "@/components/seo/schemas";

const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we collect, use, and protect your information.",
  alternates: { canonical: `${baseUrl}/privacy` },
};

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

export default function PrivacyPage() {
  const baseUrlResolved = baseUrl.replace(/\/$/, "");
  const breadcrumbItems = baseUrlResolved
    ? [
        { name: "Home", item: baseUrlResolved },
        { name: "Privacy Policy", item: `${baseUrlResolved}/privacy` },
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
            <span className="text-neutral-900">Privacy Policy</span>
          </div>
        </Container>
      </div>

      <section className="bg-white py-12">
        <Container>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-neutral-600 sm:text-base">
            This policy explains how we collect, use, and protect your data.
          </p>

          <div className="mt-8 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Information we collect</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-neutral-600">
                <li>Contact details like name, email, and phone</li>
                <li>Shipping and billing addresses</li>
                <li>Order and payment details</li>
                <li>Usage data for site analytics</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">How we use your data</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-neutral-600">
                <li>Process and deliver orders</li>
                <li>Provide support and order updates</li>
                <li>Improve site performance and experience</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Data protection</p>
              <p className="mt-2 text-sm text-neutral-600">
                We use industry standard security practices to protect your data. Access
                is limited to authorized personnel only.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
