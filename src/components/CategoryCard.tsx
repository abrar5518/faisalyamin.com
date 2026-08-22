// src/components/CategoryCard.tsx
import Link from "next/link";
import Image from "next/image";
import { withImageParams } from "@/lib/image";

export type Category = {
  name: string;
  description: string;
  href: string;
  image: string;
  imageAlt?: string;
  isFeatured?: boolean;
};

export type CategoryCardVariant = "default" | "premium" | "compact";

function DefaultCard({ c }: { c: Category }) {
  return (
    <Link
  href={c.href}
  className="group block rounded-3xl border border-neutral-200 bg-white
             shadow-sm transition hover:shadow-md"
>

      {/* Image wrapper */}
      <div className="relative h-28 overflow-hidden rounded-t-3xl bg-neutral-100 sm:h-36">

        <Image
          src={withImageParams(c.image, "auto=format&fit=crop&w=900&q=80")}
          alt={c.imageAlt || c.name}
          width={900}
          height={600}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex h-[calc(100%-7rem)] items-center justify-between gap-3 p-4 sm:p-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold sm:text-lg">{c.name}</p>
          <p className="mt-1 hidden text-sm text-neutral-600 sm:block">
            {c.description}
          </p>
        </div>

        <span className="hidden shrink-0 rounded-2xl bg-neutral-100 px-3 py-2 text-xs text-neutral-700
                     group-hover:bg-neutral-900 group-hover:text-white sm:inline-flex">
          Explore
        </span>
      </div>
    </Link>

  );
}

/** ✅ Premium: big image + gradient overlay + chips (best for Categories page) */
function PremiumCard({ c }: { c: Category }) {
  return (
    <Link
      href={c.href}
      className="ma-collection-card group relative overflow-hidden bg-neutral-100 transition"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={withImageParams(c.image, "auto=format&fit=crop&w=1400&q=85")}
          alt={c.imageAlt || c.name}
          width={1400}
          height={1050}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-900 backdrop-blur">
            Curated
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="ma-collection-title text-lg text-white">{c.name}</p>
          <p className="mt-1 line-clamp-2 text-sm text-white/80">
            {c.description}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2 text-xs font-medium text-neutral-900 backdrop-blur">
            Explore
            <span className="text-neutral-400">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** ✅ Compact: small card, good for sidebars or tight grids */
function CompactCard({ c }: { c: Category }) {
  return (
    <Link
      href={c.href}
      className="group flex items-center gap-4 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-neutral-100">
        <Image
          src={withImageParams(c.image, "auto=format&fit=crop&w=400&q=80")}
          alt={c.imageAlt || c.name}
          width={400}
          height={400}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{c.name}</p>
        <p className="mt-1 line-clamp-1 text-xs text-neutral-600">
          {c.description}
        </p>
      </div>

      <span className="ml-auto shrink-0 rounded-2xl bg-neutral-100 px-3 py-2 text-xs text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white">
        Explore
      </span>
    </Link>
  );
}

export default function CategoryCard({
  c,
  variant = "default",
}: {
  c: Category;
  variant?: CategoryCardVariant;
}) {
  if (variant === "premium") return <PremiumCard c={c} />;
  if (variant === "compact") return <CompactCard c={c} />;
  return <DefaultCard c={c} />;
}
