import type { Metadata } from "next";
import Link from "next/link";
import Schema from "@/components/seo/Schema";
import { breadcrumbSchema } from "@/components/seo/schemas";
import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export const metadata: Metadata = {
  title: "Privacy Policy | Sahoolat Pakistan",
  description: "Read Sahoolat's privacy policy for Pakistan customers, including what data we collect, how we use it, payment privacy, cookies, third-party services and your choices.",
  keywords: "Sahoolat privacy policy, data protection Pakistan, ecommerce privacy Pakistan",
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
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            This Privacy Policy explains how Sahoolat collects, uses, stores and
            protects customer information when you visit our website or place an
            order within Pakistan. By using our website, you agree to the practices
            described below.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Information we collect</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-600">
                <li>Name, phone number, email address and delivery address</li>
                <li>Order details, purchased products, payment method and order notes</li>
                <li>Account details if you create an account or login</li>
                <li>Messages sent through WhatsApp, contact forms or customer support</li>
                <li>Website usage data such as pages viewed, device type and browser data</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">How we use your data</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-600">
                <li>To process, confirm, ship and deliver your orders in Pakistan</li>
                <li>To contact you about order confirmation, delivery or support</li>
                <li>To handle returns, refunds, exchanges and warranty-related requests</li>
                <li>To improve our website, product selection and customer experience</li>
                <li>To prevent fraud, misuse, unauthorized transactions and security issues</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Payment information</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                We do not intentionally store complete card details on our website.
                Online payments, if available, are processed through payment service
                providers. Cash on delivery orders may require phone confirmation
                before dispatch.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Cookies and tracking</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                We may use cookies, pixels and analytics tools to keep the website
                working, remember preferences, measure performance, improve marketing
                and understand how customers use our store.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Sharing information</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                We may share necessary information with courier companies, payment
                processors, hosting providers, analytics tools, fraud-prevention
                services and customer support tools. We do not sell your personal
                information to unrelated third parties.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Data security</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                We use reasonable technical and organizational safeguards to protect
                customer information. Access is limited to authorized personnel and
                service providers who need the information to operate our business.
                No online system can be guaranteed 100% secure.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Data retention</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                We keep order, account and support information for as long as needed
                to provide services, comply with tax/accounting requirements, resolve
                disputes, prevent fraud and maintain business records.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Your choices</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                You may contact us to request correction of inaccurate account or
                order information, unsubscribe from promotional messages, or ask
                questions about how your information is handled.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
            <p className="text-sm font-semibold">Pakistan-only services</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Sahoolat currently serves customers in Pakistan only. If our service
              area changes, this policy may be updated. We may update this Privacy
              Policy from time to time, and the latest version will remain available
              on this page.
            </p>
            <Link href="/contact" className="mt-4 inline-flex rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800">
              Contact us
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
