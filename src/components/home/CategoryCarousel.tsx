"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CategoryCard, { type Category } from "@/components/CategoryCard";

const GAP = 16; // gap-4 = 16px

export default function CategoryCarousel({
  items,
  title = "Shop by category",
  subtitle = "Browse curated collections made for premium tastes.",
  viewAllLabel = "View all",
  viewAllHref = "/categories",
}: {
  items: Category[];
  title?: string;
  subtitle?: string;
  viewAllLabel?: string;
  viewAllHref?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  /* ----------------------------
     Helpers
  -----------------------------*/

  const getCardWidth = () => {
    const el = scrollerRef.current;
    if (!el) return 0;
    const card = el.querySelector<HTMLElement>("[data-category-card]");
    return card ? card.offsetWidth : 0;
  };

  const updateControls = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 1;
    setCanPrev(el.scrollLeft > 0);
    setCanNext(el.scrollLeft < max);
  };

  const scrollByOneCard = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;

    const cardWidth = getCardWidth();
    if (!cardWidth) return;

    el.scrollBy({
      left: dir * (cardWidth + GAP),
      behavior: "smooth",
    });
  };

  /* ----------------------------
     Effects
  -----------------------------*/

  useEffect(() => {
    updateControls();
    const el = scrollerRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);

    return () => {
      el.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, []);

  if (!items?.length) return null;

  /* ----------------------------
     Render
  -----------------------------*/

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-neutral-900 hover:underline"
          >
            {viewAllLabel}
          </Link>

          <button
            type="button"
            onClick={() => scrollByOneCard(-1)}
            disabled={!canPrev}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl
                       border border-neutral-200 bg-white text-neutral-700
                       transition hover:bg-neutral-50 disabled:opacity-40"
            aria-label="Scroll categories left"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => scrollByOneCard(1)}
            disabled={!canNext}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl
                       border border-neutral-200 bg-white text-neutral-700
                       transition hover:bg-neutral-50 disabled:opacity-40"
            aria-label="Scroll categories right"
          >
            ›
          </button>
        </div>
      </div>

      {/* SCROLLER */}
      <div
        ref={scrollerRef}
        className="mt-8 overflow-x-auto scroll-smooth
                   pt-3 pb-10
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
          "
        >
          {items.map((c) => (
            <div
              key={c.name}
              data-category-card
              className="overflow-visible"
            >
              <CategoryCard c={c} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
