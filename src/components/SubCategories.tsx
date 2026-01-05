// src/components/SubCategories.tsx
import Link from "next/link";
import Image from "next/image";
import { withImageParams } from "@/lib/image";

export type SubCategory = {
  name: string;
  slug: string;
  description?: string;
  count?: number;
  badge?: string;
  image?: string; // optional thumb
};

function buildSubHref(categorySlug: string, subSlug: string) {
  return `/categories/${categorySlug}/${subSlug}`;
}

export default function SubCategories({
  categorySlug,
  items,
}: {
  categorySlug: string;
  items: SubCategory[];
}) {
  if (!items?.length) return null;

  const top = items.slice(0, 10); // chips
  const grid = items.slice(0, 8); // cards

  return (
    <section className="border-b border-neutral-200 bg-white py-10">
      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500">Quick navigation</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              Explore sub-categories
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Jump directly into brands and collections to find the right piece faster.
            </p>
          </div>

          <Link
            href="/categories"
            className="text-sm font-medium text-neutral-900 hover:underline"
          >
            View all categories
          </Link>
        </div>

        {/* Chips row (scroll) */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {top.map((s) => (
            <Link
              key={s.slug}
              href={buildSubHref(categorySlug, s.slug)}
              className="shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm shadow-sm hover:bg-neutral-50"
            >
              <span className="font-medium text-neutral-900">{s.name}</span>
              {typeof s.count === "number" ? (
                <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">
                  {s.count}
                </span>
              ) : null}
            </Link>
          ))}
        </div>

        {/* Cards grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {grid.map((s) => {
            const href = buildSubHref(categorySlug, s.slug);
            return (
              <Link
                key={s.slug}
                href={href}
                className="group rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
                    <Image
                      src={withImageParams(
                        s.image ?? "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
                        "auto=format&fit=crop&w=200&q=80"
                      )}
                      alt={s.name}
                      width={200}
                      height={200}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {s.name}
                      </p>
                      {s.badge ? (
                        <span className="shrink-0 rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white">
                          {s.badge}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 line-clamp-2 text-xs text-neutral-600">
                      {s.description ?? "Explore verified products in this collection."}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      {typeof s.count === "number" ? (
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                          {s.count} items
                        </span>
                      ) : (
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                          Explore
                        </span>
                      )}

                      <span className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white">
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
