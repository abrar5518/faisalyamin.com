"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { withImageParams } from "@/lib/image";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";

export type Variant = {
  id: string;
  label: string;
  colorCode: string;
  images: string[];
  imageAlts: string[];
  price: string;
  compareAt?: string;
};

export type ProductData = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  rating: number;
  reviews: number;
  shortDescription: string;
  seoDescription: string;
  sizes: string[];
  variants: Variant[];
  hasVariants?: boolean;
};


function Container({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

/** --- helpers --- */
function parsePKR(value?: string) {
  if (!value) return null;
  const n = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}
function formatPKR(n: number) {
  return `PKR ${n.toLocaleString("en-PK")}`;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-4 w-4 ${filled ? "text-neutral-900" : "text-neutral-200"}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10 15.27l-5.18 3.05 1.4-5.92L1.6 8.82l6.06-.52L10 2.7l2.34 5.6 6.06.52-4.62 3.58 1.4 5.92z" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${filled ? "text-white" : "text-neutral-700"}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M12 20.5c-.2 0-.4-.1-.5-.2-3.7-3.3-7.5-6.3-7.5-10.1 0-2.7 2-4.7 4.7-4.7 1.6 0 3.1.8 3.9 2.1.8-1.3 2.3-2.1 3.9-2.1 2.7 0 4.7 2 4.7 4.7 0 3.8-3.8 6.8-7.5 10.1-.1.1-.3.2-.5.2Z" />
    </svg>
  );
}

function Stars({ rating, reviews }: { rating: number; reviews: number }) {
  const full = Math.floor(rating);
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} filled={i < full} />
        ))}
      </div>
      <span className="text-sm text-neutral-600">
        <span className="font-medium text-neutral-900">{rating.toFixed(1)}</span>{" "}
        <span className="text-neutral-500">({reviews} reviews)</span>
      </span>
      <span className="hidden sm:inline text-neutral-300">-</span>
      <span className="text-xs text-neutral-500">
        Verified authenticity & condition checks
      </span>
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700">
      {children}
    </span>
  );
}

function TrustItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-xs font-semibold text-neutral-900">{title}</p>
      <p className="mt-1 text-xs text-neutral-600">{desc}</p>
    </div>
  );
}

export default function ProductClient({ product }: { product: ProductData }) {
  const { addItem } = useCart();
  const router = useRouter();
  const initialVariant = product.variants[0];
  const [variant, setVariant] = useState<Variant>(initialVariant);
  const [image, setImage] = useState(initialVariant.images[0] ?? "");
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState(product.sizes[0] || "");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"description" | "reviews" | "shipping">("description");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<string>("1,000");
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/store-settings", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (active && res.ok && payload?.ok) {
          const threshold = payload.data?.freeShippingThreshold;
          if (threshold) {
            setFreeShippingThreshold(threshold);
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/account/wishlist?productId=${product.id}`, {
          cache: "no-store",
        });
        const payload = await res.json().catch(() => ({}));
        if (active && res.ok && payload?.ok) {
          setWishlisted(!!payload?.data?.inWishlist);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, [product.id]);

  const images = useMemo(() => variant.images, [variant]);
  const imageAlts = useMemo(() => variant.imageAlts, [variant]);
  const activePrice = useMemo(() => parsePKR(variant.price) ?? 0, [variant]);
  const compareAt = useMemo(() => parsePKR(variant.compareAt), [variant]);

  const discountPct = useMemo(() => {
    if (!compareAt || compareAt <= activePrice) return null;
    const pct = Math.round(((compareAt - activePrice) / compareAt) * 100);
    return pct > 0 ? pct : null;
  }, [compareAt, activePrice]);

  const onSelectVariant = (v: Variant) => {
    setVariant(v);
    setImage(v.images[0]);
    setImageIndex(0);
  };

  const decQty = () => setQty((q) => Math.max(1, q - 1));
  const incQty = () => setQty((q) => Math.min(99, q + 1));

  const onAddToCart = () => {
    const price = parsePKR(variant.price) ?? 0;
    const compareAtValue = parsePKR(variant.compareAt);
    const sizeKey = size || "default";
    addItem({
      id: `${product.slug}-${variant.id}-${sizeKey}`,
      productId: Number(product.id),
      slug: product.slug,
      name: product.name,
      price,
      compareAt: compareAtValue ?? undefined,
      qty,
      image: variant.images[0],
      href: `/product/${product.slug}`,
      subtitle: size ? `${variant.label} - ${size}` : variant.label,
      variantLabel: variant.label,
      sizeLabel: size || undefined,
      currency: "PKR",
    });
  };

  const onBuyNow = () => {
    onAddToCart();
    router.push("/checkout");
  };

  const toggleWishlist = async () => {
    if (wishlistBusy) return;
    setWishlistBusy(true);
    try {
      const res = await fetch("/api/account/wishlist", {
        method: wishlisted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: Number(product.id) }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        setWishlisted((prev) => !prev);
      }
    } finally {
      setWishlistBusy(false);
    }
  };

  return (
    <main className="pb-24 pt-10 lg:pb-16">
      <Container>
        {/* TOP SECTION */}
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* LEFT: Gallery */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
                <div className="aspect-square">
                  <Image
                    src={withImageParams(image, "auto=format&fit=crop&w=1600&q=90")}
                    alt={imageAlts[imageIndex] || product.name}
                    width={1600}
                    height={1600}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* top-left badge area */}
                <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
                  <Pill>Authenticated</Pill>
                  <Pill>Insured Shipping</Pill>
                  {discountPct ? <Pill>{discountPct}% off</Pill> : null}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="mt-4 grid grid-cols-4 gap-3">
                {images.map((img, idx) => {
                  const active = image === img;
                  return (
                    <button
                      key={img}
                      onClick={() => {
                        setImage(img);
                        setImageIndex(idx);
                      }}
                      className={[
                        "group aspect-square overflow-hidden rounded-2xl border bg-white",
                        "focus:outline-none focus:ring-2 focus:ring-neutral-900/20",
                        active ? "border-neutral-900" : "border-neutral-200 hover:border-neutral-300",
                      ].join(" ")}
                      aria-label={`Select ${imageAlts[idx] || `image ${idx + 1}`}`}
                    >
                      <Image
                        src={withImageParams(img, "auto=format&fit=crop&w=320&q=80")}
                        alt={imageAlts[idx] || product.name}
                        width={320}
                        height={320}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>

              {/* Under-gallery micro info */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <TrustItem title="Condition checked" desc="Dial, bracelet, timekeeping verified." />
                <TrustItem title="Secure checkout" desc="Protected payments & fraud checks." />
                <TrustItem title="Fast dispatch" desc="Ships in 24-48 hours (insured)." />
              </div>
            </div>

            {/* RIGHT: Sticky Buy Box */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-6">
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                  {/* Brand + title */}
                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                    {product.brand}
                  </p>

                  <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {product.name}
                  </h1>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Stars rating={product.rating} reviews={product.reviews} />
                    <button
                      type="button"
                      onClick={toggleWishlist}
                      aria-pressed={wishlisted}
                      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      className={[
                        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition",
                        "focus:outline-none focus:ring-2 focus:ring-neutral-900/20",
                        wishlisted
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                        wishlistBusy ? "opacity-60" : "",
                      ].join(" ")}
                    >
                      <HeartIcon filled={wishlisted} />
                      <span className="hidden sm:inline">
                        {wishlisted ? "Saved" : "Wishlist"}
                      </span>
                    </button>
                  </div>

                  {/* Price block */}
                  <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-neutral-500">Price</p>
                        <div className="mt-1 flex items-baseline gap-3">
                          <p className="text-3xl font-bold tracking-tight">
                            {variant.price}
                          </p>
                          {compareAt && compareAt > activePrice ? (
                            <p className="text-sm text-neutral-500 line-through">
                              {formatPKR(compareAt)}
                            </p>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-neutral-500">
                          Inclusive of applicable taxes. Free shipping above {freeShippingThreshold}.
                        </p>
                      </div>

                      {discountPct ? (
                        <span className="rounded-2xl bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                          Save {discountPct}%
                        </span>
                      ) : null}
                    </div>

                    {/* Short description right under price (best conversion placement) */}
                    <p className="mt-4 text-sm text-neutral-700 leading-relaxed">
                      {product.shortDescription}
                    </p>
                  </div>

                  {/* Variants */}
                  {product.hasVariants ? (
                    <div className="mt-7">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Color</p>
                        <p className="text-xs text-neutral-500">{variant.label}</p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.variants.map((v) => {
                          const active = variant.id === v.id;
                          return (
                            <button
                              key={v.id}
                              onClick={() => onSelectVariant(v)}
                              className={[
                                "group inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm",
                                "focus:outline-none focus:ring-2 focus:ring-neutral-900/20",
                                active
                                  ? "border-neutral-900 bg-neutral-900 text-white"
                                  : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50",
                              ].join(" ")}
                              aria-label={`Select ${v.label}`}
                              title={v.label}
                            >
                              <span
                                className={[
                                  "h-4 w-4 rounded-full border",
                                  active ? "border-white/50" : "border-neutral-300",
                                ].join(" ")}
                                style={{ backgroundColor: v.colorCode }}
                              />
                              <span className="whitespace-nowrap">{v.label}</span>
                              <span className={active ? "text-white/70" : "text-neutral-500"}>
                                {/* - {v.price} */}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {/* Size */}
                  {product.sizes.length ? (
                    <div className="mt-7">
                      <p className="text-sm font-medium">Size</p>
                      <div className="mt-3 flex gap-2">
                        {product.sizes.map((s) => {
                          const active = size === s;
                          return (
                            <button
                              key={s}
                              onClick={() => setSize(s)}
                              className={[
                                "rounded-2xl px-4 py-2 text-sm transition",
                                "focus:outline-none focus:ring-2 focus:ring-neutral-900/20",
                                active
                                  ? "bg-neutral-900 text-white"
                                  : "border border-neutral-200 hover:bg-neutral-50",
                              ].join(" ")}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-xs text-neutral-500">
                        Need help choosing? Chat with support for sizing guidance.
                      </p>
                    </div>
                  ) : null}

                  {/* QTY */}
                  <div className="mt-7">
                    <p className="text-sm font-medium">Quantity</p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-1">
                      <button
                        onClick={decQty}
                        disabled={qty <= 1}
                        className="h-10 w-10 rounded-xl border border-neutral-200 bg-white text-sm hover:bg-neutral-50 disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <div className="min-w-12 text-center text-sm font-medium">{qty}</div>
                      <button
                        onClick={incQty}
                        className="h-10 w-10 rounded-xl border border-neutral-200 bg-white text-sm hover:bg-neutral-50"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={onBuyNow}
                      className="rounded-2xl cursor-pointer bg-neutral-900 px-6 py-4 text-sm font-medium text-white hover:bg-neutral-800"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={onAddToCart}
                      className="rounded-2xl cursor-pointer border border-neutral-200 px-6 py-4 text-sm font-medium hover:bg-neutral-50"
                    >
                      Add to Cart
                    </button>
                  </div>

                  {/* Trust strip (below CTA) */}
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-neutral-50 p-3">
                      <p className="text-xs font-semibold">Authenticity</p>
                      <p className="mt-0.5 text-[11px] text-neutral-600">Verified before shipping</p>
                    </div>
                    <div className="rounded-2xl bg-neutral-50 p-3">
                      <p className="text-xs font-semibold">Shipping</p>
                      <p className="mt-0.5 text-[11px] text-neutral-600">Insured worldwide delivery</p>
                    </div>
                    <div className="rounded-2xl bg-neutral-50 p-3">
                      <p className="text-xs font-semibold">Returns</p>
                      <p className="mt-0.5 text-[11px] text-neutral-600">7-day return policy</p>
                    </div>
                  </div>

                  {/* Fine print */}
                  <p className="mt-5 text-xs text-neutral-500">
                    By purchasing, you agree to our Terms and Warranty policy. Box & papers availability may vary by variant.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="mt-14 lg:mt-16">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
              <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3 text-sm">
                {[
                  { id: "description", label: "Description" },
                  { id: "reviews", label: "Reviews" },
                  { id: "shipping", label: "Shipping & Returns" },
                ].map((t) => {
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id as any)}
                      className={[
                        "rounded-full px-4 py-2 transition",
                        active
                          ? "bg-neutral-900 text-white"
                          : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50",
                      ].join(" ")}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 max-w-4xl">
                {tab === "description" && (
                  <div
                    className="rt-content"
                    dangerouslySetInnerHTML={{ __html: product.seoDescription }}
                  />
                )}

                {tab === "reviews" && (
                  <div className="space-y-3">
                    <p className="text-sm text-neutral-700">
                      Reviews system coming soon.
                    </p>
                    <p className="text-xs text-neutral-500">
                      Tip: add photo reviews + verified purchase badge for higher trust.
                    </p>
                  </div>
                )}

                {tab === "shipping" && (
                  <div className="space-y-3">
                    <p className="text-sm text-neutral-700">
                      Worldwide insured shipping within 48 hours. 7-day return policy applies.
                    </p>
                    <ul className="list-disc pl-5 text-sm text-neutral-600">
                      <li>Insured door-to-door delivery</li>
                      <li>Signature required on delivery</li>
                      <li>Returns accepted in original condition</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

      </Container>

      {/* Mobile sticky CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/90 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1360px] items-center gap-3 px-5 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-neutral-500">
              {product.hasVariants ? variant.label : "Selected item"}
              {size ? ` - ${size}` : ""}
            </p>
            <p className="text-base font-semibold leading-none">{variant.price}</p>
          </div>
          <button
            onClick={onBuyNow}
            className="ml-auto rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Buy Now
          </button>
          <button
            onClick={onAddToCart}
            className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-medium hover:bg-neutral-50"
          >
            Cart
          </button>
        </div>
      </div>
    </main>
  );
}
