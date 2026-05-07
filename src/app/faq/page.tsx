import type { Metadata } from "next";
import Link from "next/link";
import FaqSection from "@/components/FaqSection";
import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata: Metadata = {
  title: "Water Bottle FAQs in Pakistan | Sahoolat.pk",
  description: "Find answers about water bottles in Pakistan, prices, kids bottles, school bottles, stainless steel bottles, BPA-free bottles, shipping, returns and COD.",
  keywords: [
    "water bottle FAQs Pakistan",
    "water bottles price in Pakistan",
    "kids water bottle Pakistan",
    "school water bottles",
    "stainless steel water bottle Pakistan",
    "BPA free water bottles",
    "insulated water bottles Pakistan",
  ],
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
    q: "Where can I buy water bottles online in Pakistan?",
    a: "You can buy water bottles online in Pakistan from Sahoolat.pk. We offer kids water bottles, school water bottles, stainless steel bottles, BPA-free bottles, plastic bottles and insulated bottles.",
  },
  {
    q: "What is the average water bottle price in Pakistan?",
    a: "Water bottle price in Pakistan depends on size, material, design and features. Plastic bottles are usually affordable, while stainless steel and insulated water bottles may cost more because of better durability and temperature control.",
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
    q: "Are your water bottles BPA-free?",
    a: "Many of our water bottles are BPA-free and suitable for daily use. You can check each product description for material details before placing your order.",
  },
  {
    q: "Which water bottle is best for kids in Pakistan?",
    a: "The best kids water bottle should be lightweight, safe, leak-proof and easy to carry. Bottles with cute designs, straws and secure lids are usually ideal for school children.",
  },
  {
    q: "Which water bottle is best for school students?",
    a: "For school students, a 500ml to 1 litre water bottle is usually suitable. It should be lightweight, leak-proof and easy to fit in a school bag.",
  },
  {
    q: "Are stainless steel water bottles better than plastic bottles?",
    a: "Stainless steel water bottles are more durable and better for keeping drinks hot or cold. Plastic water bottles are lighter and easier to carry. The best choice depends on your daily use.",
  },
  {
    q: "Do insulated water bottles keep water cold?",
    a: "Yes, insulated water bottles can keep water cold for several hours. They are useful for Pakistan’s hot weather, gym, office, school and travel.",
  },
  {
    q: "Can I use these bottles for hot drinks?",
    a: "Some stainless steel and insulated bottles are suitable for hot drinks. Always check the product description to confirm whether the bottle supports hot and cold beverages.",
  },
  {
    q: "Are plastic water bottles safe for daily use?",
    a: "High-quality BPA-free plastic water bottles are safe for daily use. They are lightweight, reusable and suitable for kids, school, office and travel.",
  },
  {
    q: "Which water bottle is best for gym use?",
    a: "For gym use, a leak-proof sports water bottle, insulated bottle or large capacity bottle is a good option. These bottles are easy to carry and help you stay hydrated during workouts.",
  },
  {
    q: "What size water bottle should I buy?",
    a: "For kids, 500ml is usually enough. For school, office and gym, 750ml to 1 litre is practical. For travel or workouts, larger bottles such as 1.5L or 2L can be more useful.",
  },
  {
    q: "Do you sell cute water bottles for kids?",
    a: "Yes, Sahoolat.pk offers cute water bottles for kids, including cartoon-style bottles, straw bottles and colorful designs suitable for school and daily use.",
  },
  {
    q: "Do you sell stainless steel water bottles in Pakistan?",
    a: "Yes, we offer stainless steel water bottles in Pakistan with durable quality, stylish designs and options for hot and cold drinks.",
  },
  {
    q: "Do you sell school water bottles?",
    a: "Yes, we offer school water bottles for kids and students. Our collection includes lightweight, leak-proof and easy-to-carry bottles for daily school use.",
  },
  {
    q: "Can I return a water bottle?",
    a: "Returns are accepted within 7 days of delivery if the item is unused, undamaged and in original condition. Please check the return policy for full details.",
  },
  {
    q: "What if I receive a damaged product?",
    a: "If you receive a damaged product, contact our support team as soon as possible with order details and clear photos. We will review the case and guide you on the next step.",
  },
  {
    q: "How can I contact Sahoolat.pk support?",
    a: "You can contact Sahoolat.pk support through WhatsApp or email. Visit the Contact page for the latest support details.",
  },
  {
    q: "Are the products shown on Sahoolat.pk authentic?",
    a: "All products are checked before dispatch. We aim to provide reliable, quality products that match the product details shown on the website.",
  },
  {
    q: "Do you deliver water bottles across Pakistan?",
    a: "Yes, we deliver water bottles across Pakistan, including major cities such as Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Faisalabad and more.",
  },
  {
    q: "How do I clean a water bottle properly?",
    a: "You can clean your water bottle with warm water and mild soap. For bottles with straws or lids, clean all small parts regularly to maintain hygiene.",
  },
  {
    q: "Can kids use stainless steel water bottles?",
    a: "Yes, kids can use stainless steel water bottles if the bottle is lightweight, easy to open and suitable for school use. Always choose a size that is comfortable for the child.",
  },
  {
    q: "Are reusable water bottles eco-friendly?",
    a: "Yes, reusable water bottles help reduce single-use plastic waste. BPA-free plastic and stainless steel bottles are practical choices for a more eco-friendly lifestyle.",
  },
  {
    q: "Do you have leak-proof water bottles?",
    a: "Yes, many bottles on Sahoolat.pk are designed to be leak-proof. Please check the product details for lid type, straw design and leak-proof features.",
  },
  {
    q: "Which water bottle is good for travel?",
    a: "For travel, choose a durable, leak-proof and easy-carry water bottle. Insulated stainless steel bottles and large capacity bottles are good options for long trips.",
  },
  {
    q: "Do you sell water bottles for office use?",
    a: "Yes, we offer stylish and practical water bottles for office use, including stainless steel, insulated and modern reusable bottles.",
  },
  {
    q: "Can I compare water bottle prices on Sahoolat.pk?",
    a: "Yes, you can compare different water bottle prices, sizes, materials and designs on Sahoolat.pk before placing your order.",
  },
  {
    q: "Are insulated bottles heavier than plastic bottles?",
    a: "Insulated stainless steel bottles are usually heavier than plastic bottles because of their double-wall construction. However, they are more durable and better for temperature control.",
  },
  {
    q: "Why should I buy from Sahoolat.pk?",
    a: "Sahoolat.pk offers a wide range of water bottles in Pakistan with affordable prices, secure checkout, cash on delivery where supported, and fast delivery.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
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
          <FaqSection
            items={FAQS}
            title="Water Bottle FAQs in Pakistan"
            intro="Quick, clear answers about prices, delivery, returns, materials and choosing the right bottle for kids, school, gym, office or travel."
            eyebrow="Help center"
            includeSchema
            columns={1}
            variant="soft"
          />
        </Container>
      </section>
    </div>
  );
}
