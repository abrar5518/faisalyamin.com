import type { Metadata } from "next";
import Link from "next/link";
import Schema from "@/components/seo/Schema";
import { faqSchema } from "@/components/seo/schemas";

const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "FAQs – Water Bottles & Orders | Sahoolat",
  description: "Find answers to common questions about orders, delivery, and water bottles at Sahoolat Pakistan.",
  keywords: "water bottle FAQ, Sahoolat help, order questions Pakistan",
  alternates: { canonical: `${baseUrl}/faq` },
};

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Most orders ship within 24 to 48 hours and arrive within 2 to 5 business days.",
  },
  {
    q: "Do you offer cash on delivery?",
    a: "Yes, cash on delivery is available where supported. Some orders may require verification.",
  },
  {
    q: "Can I return a product?",
    a: "Returns are accepted within 7 days of delivery if the item is unused and in original condition.",
  },
  {
    q: "Are products authentic?",
    a: "All products are verified before dispatch. We do not list items that fail verification.",
  },
  {
    q: "How can I contact support?",
    a: "You can contact us via WhatsApp or email. Check the Contact page for details.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Schema data={faqSchema(FAQS)} />
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">Home</Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">FAQ</span>
          </div>
        </Container>
      </div>

      <section className="bg-white py-12">
        <Container>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">FAQ</h1>
          <p className="mt-3 text-sm text-neutral-600 sm:text-base">
            Quick answers to common questions.
          </p>

          <div className="mt-8 grid gap-4">
            {FAQS.map((item) => (
              <div key={item.q} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold">{item.q}</p>
                <p className="mt-2 text-sm text-neutral-600">{item.a}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
