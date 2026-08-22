import Link from "next/link";
import type { ReactNode } from "react";
import { HelpCircle, Plus } from "lucide-react";
import Schema from "@/components/seo/Schema";
import { faqSchema } from "@/components/seo/schemas";

export type FaqItem = {
  q?: string | null;
  a?: string | null;
  question?: string | null;
  answer?: string | null;
};

type FaqSectionProps = {
  items: FaqItem[];
  title?: string;
  intro?: string;
  eyebrow?: string;
  linkHref?: string;
  linkLabel?: string;
  footer?: ReactNode;
  includeSchema?: boolean;
  columns?: 1 | 2;
  variant?: "default" | "soft" | "compact";
  className?: string;
};

function normalizeFaqItems(items: FaqItem[]) {
  return items
    .map((item) => ({
      q: (item.q ?? item.question ?? "").trim(),
      a: (item.a ?? item.answer ?? "").trim(),
    }))
    .filter((item) => item.q && item.a);
}

export default function FaqSection({
  items,
  title = "Frequently asked questions",
  intro,
  eyebrow = "FAQs",
  linkHref,
  linkLabel = "View all FAQs",
  footer,
  includeSchema = true,
  columns = 2,
  variant = "default",
  className = "",
}: FaqSectionProps) {
  const faqs = normalizeFaqItems(items);

  if (!faqs.length) return null;

  const isCompact = variant === "compact";
  const shellClass = variant === "soft" ? "ma-faq-shell" : "";
  const gridClass = columns === 1 ? "grid gap-3" : "grid gap-3 lg:grid-cols-2 lg:gap-4";

  return (
    <section className={`ma-faq-section ${className}`}>
      {includeSchema ? <Schema data={faqSchema(faqs)} /> : null}
      <div className={shellClass}>
        <div className="ma-faq-heading flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="ma-eyebrow inline-flex items-center gap-2">
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {eyebrow}
            </p>
            <h2 className={isCompact ? "mt-3 text-2xl" : "mt-4 text-2xl sm:text-3xl"}>
              {title}
            </h2>
            {intro ? (
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base">
                {intro}
              </p>
            ) : null}
          </div>

          {linkHref ? (
            <Link
              href={linkHref}
              className="ma-outline-action inline-flex items-center justify-center"
            >
              {linkLabel}
            </Link>
          ) : null}
        </div>

        <div className={`mt-7 ${gridClass}`}>
          {faqs.map((item, index) => (
            <details
              key={`${item.q}-${index}`}
              className="ma-faq-item group"
            >
              <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-4">
                <h3 className="line-clamp-2 text-sm font-medium leading-6 text-neutral-900">
                  {item.q}
                </h3>
                <span className="ma-faq-toggle inline-flex h-9 w-9 shrink-0 items-center justify-center transition">
                  <Plus className="h-4 w-4 transition group-open:rotate-45" aria-hidden="true" />
                </span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-neutral-600">{item.a}</p>
            </details>
          ))}
        </div>

        {footer ? <div className="mt-7">{footer}</div> : null}
      </div>
    </section>
  );
}
