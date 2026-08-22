// src/components/BlogCard.tsx
import Link from "next/link";
import Image from "next/image";
import { withImageParams } from "@/lib/image";

export type BlogPostCard = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt?: string;
  date: string; // "2025-12-28"
  tags?: string[];
  readTimeMin?: number; // optional
};

export type BlogCardVariant = "default" | "featured" | "compact";

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

/** Default: best for blog grid */
function DefaultCard({ p }: { p: BlogPostCard }) {
  return (
    <Link
      href={`/blog/${p.slug}`}
      className="ma-article-card group overflow-hidden bg-white transition"
    >
      <div className="h-48 overflow-hidden bg-neutral-100">
        <Image
          src={withImageParams(p.image, "auto=format&fit=crop&w=1400&q=85")}
          alt={p.imageAlt || p.title}
          width={1400}
          height={900}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span>{formatDate(p.date)}</span>
          {typeof p.readTimeMin === "number" ? (
            <>
              <span className="text-neutral-300">-</span>
              <span>{p.readTimeMin} min read</span>
            </>
          ) : null}
        </div>

        <p className="mt-2 line-clamp-2 text-sm font-semibold text-neutral-900">
          {p.title}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
          {p.excerpt}
        </p>

        {p.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {p.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700"
              >
                #{t}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-neutral-900">
          Read more <span className="text-neutral-400">{">"}</span>
        </div>
      </div>
    </Link>
  );
}

/** Featured: big hero-style card (optional) */
function FeaturedCard({ p }: { p: BlogPostCard }) {
  return (
    <Link
      href={`/blog/${p.slug}`}
      className="group relative block w-full overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-[360px] overflow-hidden">
        <Image
          src={withImageParams(p.image, "auto=format&fit=crop&w=1800&q=85")}
          alt={p.imageAlt || p.title}
          width={1800}
          height={1200}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/80">
          <span>{formatDate(p.date)}</span>
          {typeof p.readTimeMin === "number" ? (
            <>
              <span className="text-white/40">-</span>
              <span>{p.readTimeMin} min read</span>
            </>
          ) : null}
        </div>

        <p className="mt-2 text-xl font-semibold text-white">
          {p.title}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-white/80">
          {p.excerpt}
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2 text-xs font-medium text-neutral-900 backdrop-blur">
          Read article <span className="text-neutral-400">{">"}</span>
        </div>
      </div>
    </Link>
  );
}

/** Compact: for sidebar / related lists */
function CompactCard({ p }: { p: BlogPostCard }) {
  return (
    <Link
      href={`/blog/${p.slug}`}
      className="group flex gap-4 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="h-20 w-24 overflow-hidden rounded-2xl bg-neutral-100">
        <Image
          src={withImageParams(p.image, "auto=format&fit=crop&w=600&q=85")}
          alt={p.imageAlt || p.title}
          width={600}
          height={450}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-neutral-500">{formatDate(p.date)}</p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold">
          {p.title}
        </p>
        <p className="mt-1 line-clamp-1 text-xs text-neutral-600">
          {p.excerpt}
        </p>
      </div>
    </Link>
  );
}

export default function BlogCard({
  p,
  variant = "default",
}: {
  p: BlogPostCard;
  variant?: BlogCardVariant;
}) {
  if (variant === "featured") return <FeaturedCard p={p} />;
  if (variant === "compact") return <CompactCard p={p} />;
  return <DefaultCard p={p} />;
}
