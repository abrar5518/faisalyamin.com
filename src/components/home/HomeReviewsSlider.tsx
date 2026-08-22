"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRef } from "react";
import { withImageParams } from "@/lib/image";

export type HomeReviewSlide = {
  name: string;
  title: string;
  quote: string;
  avatar: string;
  rating: number;
};

export default function HomeReviewsSlider({ items }: { items: HomeReviewSlide[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollByCard = (direction: "left" | "right") => {
    const node = scrollerRef.current;
    if (!node) return;
    const amount = Math.min(node.clientWidth * 0.9, 430);
    node.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="ma-review-slider">
      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByCard("left")}
          className="ma-review-arrow"
          aria-label="Previous review"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard("right")}
          className="ma-review-arrow"
          aria-label="Next review"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <article
            key={item.name}
            className="ma-review-card group min-w-[86%] snap-start sm:min-w-[430px] lg:min-w-[31.5%]"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src={withImageParams(item.avatar, "auto=format&fit=crop&w=160&q=80")}
                  alt={item.name}
                  width={160}
                  height={160}
                  className="h-11 w-11 rounded-2xl object-cover"
                  loading="lazy"
                />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-neutral-900">{item.name}</p>
                  <div className="mt-1 inline-flex items-center gap-2">
                    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-700">
                      {item.title}
                    </span>
                    <span className="hidden text-neutral-300 sm:inline">.</span>
                    <span className="hidden text-xs text-neutral-500 sm:inline">
                      Verified buyer
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1" aria-label={`${item.rating} star rating`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={
                      index < Math.round(item.rating)
                        ? "h-4 w-4 fill-neutral-900 text-neutral-900"
                        : "h-4 w-4 fill-neutral-300 text-neutral-300"
                    }
                  />
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm leading-relaxed text-neutral-700">
                <span className="mr-1 align-top text-xl font-semibold text-neutral-300">&quot;</span>
                {item.quote}
                <span className="ml-1 align-bottom text-xl font-semibold text-neutral-300">&quot;</span>
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4">
              <p className="text-xs text-neutral-500">Fast delivery - Secure checkout</p>
              <Link href="/reviews" className="text-xs font-medium text-neutral-900 group-hover:underline">
                Read story
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
