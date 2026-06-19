import type { Metadata } from "next";
import Link from "next/link";
import FaqSection from "@/components/FaqSection";
import ManagedPageBody from "@/components/ManagedPageBody";
import {
  buildManagedPageMetadata,
  getManagedPage,
  hasManagedPageBody,
} from "@/lib/managedPage";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedPageMetadata("faq", {
    title: "Frequently Asked Questions",
    description:
      "Find quick answers about orders, delivery, payments, returns, and customer support.",
    keywords: "FAQs, customer support, delivery, returns, cash on delivery",
  });
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

const FAQS = [
  {
    q: "How do I place an order?",
    a: "Add your product to cart, open checkout, enter your phone number and delivery address, then place your order. Our team may contact you for confirmation before dispatch.",
  },
  {
    q: "Do you offer cash on delivery?",
    a: "Yes, cash on delivery is available where supported. Some orders may require verification before dispatch.",
  },
  {
    q: "How long does shipping take?",
    a: "Most orders are processed within 24 to 48 hours and usually arrive within 2 to 5 business days, depending on your city and courier service.",
  },
  {
    q: "Can I change my delivery address after placing an order?",
    a: "Contact support as soon as possible. If your order has not been dispatched yet, we will try to update the address.",
  },
  {
    q: "Can I return a product?",
    a: "Returns are accepted for eligible items within the return window if the item meets the policy requirements. Please check the return policy for full details.",
  },
  {
    q: "What if I receive a damaged product?",
    a: "If you receive a damaged product, contact our support team as soon as possible with order details and clear photos. We will review the case and guide you on the next step.",
  },
  {
    q: "How can I contact support?",
    a: "You can contact support through WhatsApp, phone, or email where available. Visit the Contact page for the latest support details.",
  },
  {
    q: "Are the products checked before dispatch?",
    a: "All products are checked before dispatch. We aim to provide reliable, quality products that match the product details shown on the website.",
  },
  {
    q: "Do you deliver across Pakistan?",
    a: "Yes, delivery is available across Pakistan in serviceable areas covered by our courier partners.",
  },
  {
    q: "How do I track my order?",
    a: "If tracking is available, details may be shared by SMS, WhatsApp, email, or order status page after dispatch.",
  },
];

export default async function FaqPage() {
  const page = await getManagedPage("faq");
  const hasManagedContent = hasManagedPageBody(page);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">
              Home
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">{page?.title || "FAQ"}</span>
          </div>
        </Container>
      </div>

      {hasManagedContent ? (
        <ManagedPageBody page={page} />
      ) : (
        <section className="bg-white py-12">
          <Container>
            <FaqSection
              items={FAQS}
              title={page?.heroTitle || page?.title || "Frequently Asked Questions"}
              intro={
                page?.heroSubtitle ||
                page?.shortDescription ||
                "Quick, clear answers about orders, delivery, payments, returns, and customer support."
              }
              eyebrow="Help center"
              includeSchema
              columns={1}
              variant="soft"
            />
          </Container>
        </section>
      )}
    </div>
  );
}
