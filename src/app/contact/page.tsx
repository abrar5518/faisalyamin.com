import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Schema from "@/components/seo/Schema";
import { absoluteUrl, contactPageSchema, organizationSchema } from "@/components/seo/schemas";

const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Contact Us – Sahoolat Pakistan",
  description: "Get in touch with Sahoolat Pakistan for support, sales inquiries, and delivery questions. Contact our water bottle store for assistance.",
  keywords: "contact Sahoolat, customer support Pakistan, water bottle store contact",
  alternates: { canonical: `${baseUrl}/contact` },
};

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

export default async function ContactPage() {
  const [contact, siteSettings] = await Promise.all([
    prisma.contact.findFirst({ orderBy: { id: "asc" } }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
  ]);

  const address = [
    contact?.addressLine1,
    contact?.addressLine2,
    contact?.city,
    contact?.state,
    contact?.postalCode,
    contact?.country,
  ]
    .filter(Boolean)
    .join(", ");
  const baseUrlResolved = (siteSettings?.siteUrl || baseUrl).replace(/\/$/, "");
  const brandName = siteSettings?.siteName?.trim() || "LuxStore";
  const logoUrl = siteSettings?.logoUrl || siteSettings?.siteIconUrl || "/favicon.ico";
  const orgAddress = {
    streetAddress: [contact?.addressLine1, contact?.addressLine2].filter(Boolean).join(", ") || undefined,
    addressLocality: contact?.city || undefined,
    addressRegion: contact?.state || undefined,
    postalCode: contact?.postalCode || undefined,
    addressCountry: contact?.country || "PK",
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Schema
        data={contactPageSchema({
          url: `${baseUrlResolved}/contact`,
          name: "Contact",
          description: "Contact details for support, sales, and delivery.",
        })}
      />
      <Schema
        data={organizationSchema({
          name: brandName,
          url: baseUrlResolved,
          logo: absoluteUrl(logoUrl, baseUrlResolved),
          phone: contact?.phone || undefined,
          email: contact?.email || undefined,
          address: orgAddress,
        })}
      />
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">Home</Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">Contact</span>
          </div>
        </Container>
      </div>

      <section className="border-b border-neutral-200 bg-white">
        <Container>
          <div className="grid gap-8 py-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Contact us
              </h1>
              <p className="mt-3 text-sm text-neutral-600 sm:text-base">
                Reach out for order support, shipping, or product questions.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Phone</p>
              <p className="mt-2 text-sm text-neutral-600">
                {contact?.phone || "-"}
              </p>
              <p className="mt-4 text-sm font-semibold">WhatsApp</p>
              <p className="mt-2 text-sm text-neutral-600">
                {contact?.whatsapp || "-"}
              </p>
              <p className="mt-4 text-sm font-semibold">Email</p>
              <p className="mt-2 text-sm text-neutral-600">
                {contact?.email || "-"}
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Address</p>
              <p className="mt-2 text-sm text-neutral-600">
                {address || "-"}
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Hours</p>
              <p className="mt-2 text-sm text-neutral-600">
                {contact?.hoursWeekdays || "-"}
              </p>
              <p className="mt-4 text-sm font-semibold">Weekend</p>
              <p className="mt-2 text-sm text-neutral-600">
                {contact?.hoursWeekend || "-"}
              </p>
              {contact?.notes ? (
                <>
                  <p className="mt-4 text-sm font-semibold">Notes</p>
                  <p className="mt-2 text-sm text-neutral-600">
                    {contact.notes}
                  </p>
                </>
              ) : null}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
