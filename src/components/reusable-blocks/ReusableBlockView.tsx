import Link from "next/link";
import { Banknote, BadgeCheck, Gift, Headphones, MessageCircle, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { ReusableBlockViewModel } from "@/lib/reusableBlocks";

function BlockIcon({ block }: { block: ReusableBlockViewModel }) {
  const key = (block.icon || block.type || "trust").toLowerCase();
  const className = "h-5 w-5";
  if (key === "cod") return <Banknote className={className} aria-hidden="true" />;
  if (key === "delivery" || key === "shipping") return <Truck className={className} aria-hidden="true" />;
  if (key === "returns") return <RotateCcw className={className} aria-hidden="true" />;
  if (key === "whatsapp") return <MessageCircle className={className} aria-hidden="true" />;
  if (key === "promo") return <Gift className={className} aria-hidden="true" />;
  if (key === "support") return <Headphones className={className} aria-hidden="true" />;
  if (key === "trust") return <ShieldCheck className={className} aria-hidden="true" />;
  return <BadgeCheck className={className} aria-hidden="true" />;
}

export default function ReusableBlockView({
  block,
  compact = false,
  whatsappHref,
}: {
  block: ReusableBlockViewModel;
  compact?: boolean;
  whatsappHref?: string;
}) {
  const isWhatsAppBlock = [block.type, block.icon, block.slug, block.title]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes("whatsapp"));
  const primaryHref =
    isWhatsAppBlock && whatsappHref && (!block.primaryHref || block.primaryHref === "/contact")
      ? whatsappHref
      : block.primaryHref;
  const secondaryHref =
    isWhatsAppBlock && whatsappHref && block.secondaryHref === "/contact"
      ? whatsappHref
      : block.secondaryHref;
  const primaryExternal = Boolean(primaryHref?.startsWith("http"));
  const secondaryExternal = Boolean(secondaryHref?.startsWith("http"));

  return (
    <section className={compact ? "" : "py-8"}>
      <div className="theme-card rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="theme-primary-action flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-white">
            <BlockIcon block={block} />
          </div>
          <div className="min-w-0 flex-1">
            {block.eyebrow ? (
              <p className="theme-accent-text text-xs font-bold uppercase tracking-wide text-neutral-500">
                {block.eyebrow}
              </p>
            ) : null}
            <h2 className={compact ? "text-base font-semibold" : "text-xl font-semibold"}>
              {block.title}
            </h2>
            {block.bodyHtml ? (
              <div
                className="rt-content mt-2 text-sm"
                dangerouslySetInnerHTML={{ __html: block.bodyHtml }}
              />
            ) : null}
          </div>
        </div>

        {block.items.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {block.items.map((item) => (
              <div key={`${item.title}-${item.text}`} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                {item.title ? <p className="text-sm font-semibold text-neutral-950">{item.title}</p> : null}
                {item.text ? <p className="mt-1 text-xs leading-5 text-neutral-600">{item.text}</p> : null}
              </div>
            ))}
          </div>
        ) : null}

        {(block.primaryLabel && primaryHref) || (block.secondaryLabel && secondaryHref) ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {block.primaryLabel && primaryHref ? (
              <Link
                className="btn-primary px-5 py-3 text-sm"
                href={primaryHref}
                rel={primaryExternal ? "noopener noreferrer" : undefined}
                target={primaryExternal ? "_blank" : undefined}
              >
                {block.primaryLabel}
              </Link>
            ) : null}
            {block.secondaryLabel && secondaryHref ? (
              <Link
                className="btn-secondary px-5 py-3 text-sm"
                href={secondaryHref}
                rel={secondaryExternal ? "noopener noreferrer" : undefined}
                target={secondaryExternal ? "_blank" : undefined}
              >
                {block.secondaryLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
