// src/components/ProductCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { withImageParams } from "@/lib/image";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { useGlobalCopy } from "@/components/GlobalCopyProvider";

export type Product = {
  id: string;
  name: string;
  price: string;
  compareAt?: string;
  badge?: string;
  rating: number;
  reviews: number;
  image: string;
  imageAlt?: string;
  hoverImage?: string;
  hoverImageAlt?: string;
  // optional for sale/deals routing
  href?: string;
  // optional subtitle (sale card me kaam aayega)
  subtitle?: string;
  shortDesc?: string;
};

export type ProductCardVariant = "default" | "featured" | "compact" | "sale";

function Stars({ value }: { value: number }) {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(5, value)) : 0;
  const total = 5;

  return (
    <div className="flex items-center gap-0.5 sm:gap-1" aria-label={`Rating ${safeValue.toFixed(1)} out of 5`}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < Math.round(safeValue);
        return (
          <Star
            key={i}
            className={
              filled
                ? "h-3.5 w-3.5 fill-amber-400 text-amber-400 sm:h-4 sm:w-4"
                : "h-3.5 w-3.5 fill-neutral-200 text-neutral-200 sm:h-4 sm:w-4"
            }
          />
        );
      })}
      <span className="ml-2 text-xs text-neutral-600">{safeValue.toFixed(1)}</span>
    </div>
  );
}

function PriceBlock({ p }: { p: Product }) {
  return (
    <div className="min-w-0">
      <p className="text-base font-semibold leading-5">{p.price}</p>
      {p.compareAt ? (
        <p className="text-xs text-neutral-500 line-through">{p.compareAt}</p>
      ) : (
        <p className="text-xs text-neutral-500">In stock</p>
      )}
    </div>
  );
}

/** ✅ Variant 1: Your current design (UNCHANGED look) */
function ProductImageSwap({
  p,
  params,
  className,
  width,
  height,
}: {
  p: Product;
  params: string;
  className: string;
  width: number;
  height: number;
}) {
  return (
    <>
      <Image
        src={withImageParams(p.image, params)}
        alt={p.imageAlt || p.name}
        width={width}
        height={height}
        className={`${className} ${p.hoverImage ? "group-hover:opacity-0" : ""}`}
        loading="lazy"
      />
      {p.hoverImage ? (
        <Image
          src={withImageParams(p.hoverImage, params)}
          alt={p.hoverImageAlt || p.imageAlt || p.name}
          width={width}
          height={height}
          className={`${className} absolute inset-0 opacity-0 group-hover:opacity-100`}
          loading="lazy"
        />
      ) : null}
    </>
  );
}

function DefaultCard({ p }: { p: Product }) {
  return (
    <div className="theme-card group rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-neutral-100">
        <ProductImageSwap
          p={p}
          params="auto=format&fit=crop&w=900&q=80"
          width={900}
          height={900}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-semibold">{p.name}</p>
        {p.badge ? (
          <span className="theme-primary-action rounded-full bg-neutral-900 px-3 py-1 text-xs text-white">
            {p.badge}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <PriceBlock p={p} />
        <div className="text-right">
          <Stars value={p.rating} />
          <p className="mt-1 text-xs text-neutral-500">{p.reviews} reviews</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href={p.href ?? `/product/${p.id}`}
          className="btn-primary flex-1 px-4 py-3 text-center text-sm"
        >
          View
        </Link>
      </div>
    </div>
  );
}

/** ✅ Variant 2: Featured (BIG image, overlay content, premium) */
function FeaturedCard({ p }: { p: Product }) {
  return (
    <div className="theme-card group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-72 w-full overflow-hidden bg-neutral-100 sm:h-80">
        <ProductImageSwap
          p={p}
          params="auto=format&fit=crop&w=1400&q=85"
          width={1400}
          height={900}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {p.badge ? (
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-900 backdrop-blur">
              {p.badge}
            </span>
          </div>
        ) : null}

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <p className="text-sm font-semibold text-white sm:text-base">{p.name}</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">{p.price}</p>
              {p.compareAt ? (
                <p className="text-xs text-white/70 line-through">{p.compareAt}</p>
              ) : (
                <p className="text-xs text-white/70">In stock</p>
              )}
            </div>
            <div className="rounded-2xl bg-white/90 px-3 py-2 backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-900">{p.rating.toFixed(1)}</span>
                <span className="h-1 w-1 rounded-full bg-neutral-400" />
                <span className="text-xs text-neutral-600">{p.reviews} reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-5">
        <Link
          href={p.href ?? `/product/${p.id}`}
          className="btn-primary flex-1 px-4 py-3 text-center text-sm"
        >
          View
        </Link>
      </div>
    </div>
  );
}

/** ✅ Variant 3: Compact (BIG image, clean, minimal, modern) */
function CompactCard({ p }: { p: Product }) {
  const href = p.href ?? `/product/${p.id}`;
  const globalCopy = useGlobalCopy();

  return (
    <div className="product-card product-card-compact theme-card group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-2.5 shadow-sm transition-transform active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-md sm:rounded-3xl sm:p-5">
      <Link href={href} className="block">
        <div className="product-card-image relative aspect-[1/1.05] w-full overflow-hidden rounded-xl bg-neutral-100 sm:h-64 sm:aspect-auto sm:rounded-2xl lg:h-72">
          <ProductImageSwap
            p={p}
            params="auto=format&fit=crop&w=1200&q=85"
            width={1200}
            height={900}
            className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
          />
          {p.badge ? (
            <span className="theme-primary-action absolute left-2 top-2 rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white sm:left-3 sm:top-3 sm:px-3 sm:py-1">
              {p.badge}
            </span>
          ) : null}
        </div>
      </Link>
      <div className="mt-2.5 min-w-0 sm:mt-4">
        <Link href={href} className="block min-h-10">
          <p className="line-clamp-2 text-sm font-semibold leading-5 text-neutral-900">{p.name}</p>
        </Link>
      </div>

      <div className="mt-1.5 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-base font-semibold leading-5 text-neutral-900">{p.price}</span>
        {p.compareAt ? (
          <span className="text-xs text-neutral-400 line-through">{p.compareAt}</span>
        ) : (
          <span className="text-xs text-neutral-500">In stock</span>
        )}
      </div>

      <div className="mt-1.5 flex min-w-0 items-center justify-between gap-2">
        <div className="min-w-0">
          <Stars value={p.rating} />
        </div>
        <p className="hidden text-xs text-neutral-500 min-[390px]:block">{p.reviews} reviews</p>
      </div>

      <div className="mt-auto pt-2.5 sm:pt-4">
        <Link href={href} className="mobile-card-new-cta theme-primary-action inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-neutral-800 sm:hidden">
          {globalCopy.product.buyNow}
        </Link>
        <AddToCartButton
          id={p.id}
          slug={p.id}
          name={p.name}
          priceLabel={p.price}
          compareAtLabel={p.compareAt}
          image={p.image}
          href={href}
          badge={p.badge}
          className="mobile-card-old-cta hidden min-h-10 w-full items-center justify-center rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-900 cursor-pointer transition hover:bg-neutral-50 sm:hidden"
        />
        <Link href={href} className="hidden min-h-10 w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-center text-xs font-medium text-white transition hover:bg-neutral-800 sm:inline-flex sm:py-3 sm:text-sm">
          View details
        </Link>
      </div>
    </div>
  );
}

/** ✅ Variant 4: SALE (new card design for deals section, different look) */
function SaleCard({ p }: { p: Product }) {
  const globalCopy = useGlobalCopy();
  const href = p.href ?? `/product/${p.id}`;

  return (
    <div className="product-card product-card-sale theme-card group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-transform active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-md sm:rounded-3xl">

      {/* IMAGE AREA */}
      <Link href={href}>
        <div className="product-card-image relative aspect-square w-full overflow-hidden bg-neutral-100 sm:aspect-[4/4.6]">
          <ProductImageSwap
            p={p}
            params="auto=format&fit=crop&w=1400&q=85"
            width={1400}
            height={1610}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5" />

          {p.badge ? (
            <div className="absolute left-2 top-2 sm:left-3 sm:top-3">
              <span className="theme-primary-action rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white sm:px-2.5 sm:py-1">
                {p.badge}
              </span>
            </div>
          ) : null}

          <div className="absolute bottom-2 left-2 hidden sm:bottom-3 sm:left-3 sm:block">
            <span className="inline-flex items-center rounded-2xl bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-900 backdrop-blur">
              Limited time offer
            </span>
          </div>
        </div>
      </Link>

      {/* CONTENT AREA */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        {/* Title */}
        <Link href={href} className="block min-h-10">
          <p className="line-clamp-2 text-sm font-semibold leading-5 text-neutral-900">
            {p.name}
          </p>
        </Link>

        {/* Price */}
        <div className="mt-1.5 flex items-end justify-between gap-2 sm:mt-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-base font-semibold leading-5 text-neutral-900">
              {p.price}
            </span>
            {p.compareAt ? (
              <span className="text-xs text-neutral-400 line-through">
                {p.compareAt}
              </span>
            ) : null}
          </div>

          <span className="shrink-0 text-xs text-neutral-600">
            ★ {p.rating.toFixed(1)}
          </span>
        </div>

        {/* CTA BUTTONS */}
        <div className="mt-auto grid gap-1.5 pt-2.5 sm:grid-cols-2 sm:gap-2 sm:pt-3">
          {/* Buy Now */}
          <Link
            href={href}
            className="mobile-card-new-cta theme-primary-action inline-flex min-h-10 items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-neutral-800"
          >
            {globalCopy.product.buyNow}
          </Link>

          {/* Add to Cart */}
          <AddToCartButton
            id={p.id}
            slug={p.id}
            name={p.name}
            priceLabel={p.price}
            compareAtLabel={p.compareAt}
            image={p.image}
            href={href}
            badge={p.badge}
            className="mobile-card-old-cta hidden min-h-10 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-900 cursor-pointer transition hover:bg-neutral-50 sm:inline-flex sm:items-center sm:justify-center"
          />
        </div>
      </div>
    </div>
  );
}


export default function ProductCard({
  p,
  variant = "default",
}: {
  p: Product;
  variant?: ProductCardVariant;
}) {
  if (variant === "featured") return <FeaturedCard p={p} />;
  if (variant === "compact") return <CompactCard p={p} />;
  if (variant === "sale") return <SaleCard p={p} />;
  return <DefaultCard p={p} />;
}
