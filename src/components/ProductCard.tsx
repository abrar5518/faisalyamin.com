// src/components/ProductCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
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
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const total = 5;

  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${value} out of 5`}>
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const filled = idx <= full;
        const halfFill = !filled && half && idx === full + 1;
        return (
          <span
            key={i}
            className={[
              "inline-block h-4 w-4 rounded-sm",
              filled ? "theme-primary-action bg-neutral-900" : halfFill ? "bg-neutral-400" : "bg-neutral-200",
            ].join(" ")}
          />
        );
      })}
      <span className="ml-2 text-xs text-neutral-600">{value.toFixed(1)}</span>
    </div>
  );
}

function PriceBlock({ p }: { p: Product }) {
  return (
    <div>
      <p className="text-sm font-semibold">{p.price}</p>
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
  const displayName = p.name.length > 28 ? `${p.name.slice(0, 28)}...` : p.name;
  return (
    <div className="theme-card group rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <Link href={p.href ?? `/product/${p.id}`} >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-neutral-100 sm:h-64 sm:aspect-auto lg:h-72">
          <ProductImageSwap
            p={p}
            params="auto=format&fit=crop&w=1200&q=85"
            width={1200}
            height={900}
            className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
          />
          {p.badge ? (
            <span className="theme-primary-action absolute left-3 top-3 rounded-full bg-neutral-900 px-3 py-1 text-xs text-white">
              {p.badge}
            </span>
          ) : null}
        </div>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{displayName}</p>
          <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
            {p.shortDesc || "Verified • Box & Papers • Fast Shipping"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold">{p.price}</p>
          {p.compareAt ? (
            <p className="text-xs text-neutral-500 line-through">{p.compareAt}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Stars value={p.rating} />
        <p className="text-xs text-neutral-500">{p.reviews} reviews</p>
      </div>

      <div className="mt-4">
        <Link href={p.href ?? `/product/${p.id}`} className="btn-primary w-full px-4 py-2.5 text-xs sm:py-3 sm:text-sm">
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
    <div className="theme-card group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      {/* IMAGE AREA */}
      <Link href={href}>
        <div className="relative aspect-[4/4.6] w-full overflow-hidden bg-neutral-100">
          <ProductImageSwap
            p={p}
            params="auto=format&fit=crop&w=1400&q=85"
            width={1400}
            height={1610}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5" />

          {p.badge ? (
            <div className="absolute left-3 top-3">
              <span className="theme-primary-action rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white">
                {p.badge}
              </span>
            </div>
          ) : null}

          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center rounded-2xl bg-white/90 px-3 py-1.5 text-[11px] font-medium text-neutral-900 backdrop-blur">
              Limited time offer
            </span>
          </div>
        </div>
      </Link>

      {/* CONTENT AREA */}
      <div className="p-4">
        {/* Title */}
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900">
          {p.name}
        </p>

        {/* Price */}
        <div className="mt-2 flex items-end justify-between">
          <div className="flex items-end gap-2">
            <span className="text-base font-semibold text-neutral-900">
              {p.price}
            </span>
            {p.compareAt ? (
              <span className="text-xs text-neutral-400 line-through">
                {p.compareAt}
              </span>
            ) : null}
          </div>

          <span className="text-[11px] text-neutral-600">
            ★ {p.rating.toFixed(1)}
          </span>
        </div>

        {/* CTA BUTTONS */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {/* Buy Now */}
          <Link
            href={href}
            className="theme-primary-action rounded-xl bg-neutral-900 px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-neutral-800"
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
            className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-900 cursor-pointer transition hover:bg-neutral-50"
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
