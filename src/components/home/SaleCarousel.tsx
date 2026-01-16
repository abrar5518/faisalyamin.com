"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ProductCard, { Product } from "@/components/ProductCard";

const DEFAULT_AUTO_MS = 4500;
const GAP_PX = 16;

function getCardWidth(el: HTMLDivElement | null) {
  if (!el) return 320;
  const card = el.querySelector<HTMLElement>("[data-sale-card]");
  return card?.offsetWidth ?? 320;
}

export default function SaleCarousel({
  items,
  visibleCount = 4.5,
  autoMs = DEFAULT_AUTO_MS,
}: {
  items: Product[];
  visibleCount?: number;
  autoMs?: number;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [cardWidth, setCardWidth] = useState<number | null>(null);

  const updateControls = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth - 2;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft < maxScroll);
  };

  const scrollByCard = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const width = cardWidth ?? getCardWidth(el);
    el.scrollBy({ left: dir * (width + GAP_PX), behavior: "smooth" });
  };

  useEffect(() => {
    updateControls();
  }, [items.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => updateControls();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const intervalMs = Math.max(1200, Math.min(20000, Math.floor(autoMs)));
    const id = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth - 2;
      if (el.scrollLeft >= maxScroll) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollByCard(1);
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [items.length, autoMs, cardWidth]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const compute = () => {
      const width = el.clientWidth;
      const count = Math.max(1, Math.min(6, Number(visibleCount) || 1));
      const totalGap = GAP_PX * Math.max(0, count - 1);
      const next = Math.max(220, Math.floor((width - totalGap) / count));
      setCardWidth(next);
    };
    compute();
    const onResize = () => compute();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [visibleCount]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Sale & deals</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Limited-time offers on verified pieces. Grab them before they&apos;re gone.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/deals" className="text-sm font-medium text-neutral-900 hover:underline">
            View all deals
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canPrev}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Scroll sale products left"
            >
              <span className="text-lg leading-none">‹</span>
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canNext}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Scroll sale products right"
            >
              <span className="text-lg leading-none">›</span>
            </button>
          </div>
        </div>
      </div>

      <div ref={wrapperRef}>
        <div
          ref={scrollerRef}
          className="no-scrollbar mt-8 flex gap-4 overflow-x-auto scroll-smooth pb-2"
        >
          {items.map((p) => (
            <div
              key={p.id}
              data-sale-card
              className="shrink-0"
              style={cardWidth ? { width: `${cardWidth}px` } : undefined}
            >
              <ProductCard p={p} variant="sale" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
