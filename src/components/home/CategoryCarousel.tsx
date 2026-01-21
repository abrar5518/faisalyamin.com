"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import CategoryCard, { Category } from "@/components/CategoryCard";

const GAP = 16;

export default function CategoryCarousel({
  items,
}: {
  items: Category[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 1;
    setCanPrev(el.scrollLeft > 0);
    setCanNext(el.scrollLeft < max);
  };

  const scrollBy = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth / 2), behavior: "smooth" });
  };

  useEffect(() => {
    update();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    return () => el.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      {/* HEADER (UNCHANGED, arrows back) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Shop by category
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Browse curated collections made for premium tastes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/categories"
            className="text-sm font-medium text-neutral-900 hover:underline"
          >
            View all Test
          </Link>

          <button
            onClick={() => scrollBy(-1)}
            disabled={!canPrev}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl
                       border border-neutral-200 bg-white text-neutral-700
                       disabled:opacity-40"
          >
            ‹
          </button>

          <button
            onClick={() => scrollBy(1)}
            disabled={!canNext}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl
                       border border-neutral-200 bg-white text-neutral-700
                       disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>

      {/* SCROLLER */}
      <div
        ref={scrollerRef}
        className="mt-8 overflow-x-auto scroll-smooth
                   [-ms-overflow-style:none]
                   [scrollbar-width:none]
                   [&::-webkit-scrollbar]:hidden"
      >
        {/* TRACK */}
        <div
          className="
            grid grid-flow-col gap-4
            auto-cols-[calc((100%-16px)/2)]
            lg:auto-cols-[calc((100%-32px)/3)]
            pb-10 pt-2
          "
        >
          {items.map((c) => (
            <div key={c.name} className="relative overflow-visible">
              {/* SLIDE WRAPPER — IMPORTANT */}
              <div className="relative">
                <CategoryCard c={c} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
