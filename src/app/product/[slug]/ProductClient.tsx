"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { withImageParams } from "@/lib/image";
import type { ChangeEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, FileCheck2, UploadCloud, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useGlobalCopy } from "@/components/GlobalCopyProvider";
import type { CatalogTemplateSettings } from "@/lib/catalogSettings";
import { renderCatalogTemplate } from "@/lib/catalogSettings";
import { trackViewItem } from "@/lib/googleAnalytics";
import { trackViewContent } from "@/lib/metaPixel";
import { getVideoRenderInfo } from "@/lib/videoUrl";
import { withResponsiveTables } from "@/lib/richText";

export type Variant = {
  id: string;
  label: string;
  colorCode: string;
  images: string[];
  imageAlts: string[];
  price: string;
  compareAt?: string;
};

export type ProductMediaItem = {
  type: "image" | "video";
  url: string;
  alt?: string;
  thumbnailUrl?: string;
};

export type ProductData = {
  id: string;
  slug: string;
  brand: string;
  category?: string;
  name: string;
  rating: number;
  reviews: number;
  reviewItems: ReviewItem[];
  shortDescription: string;
  seoDescription: string;
  images: string[];
  imageAlts: string[];
  media: ProductMediaItem[];
  sizes: string[];
  variants: Variant[];
  hasVariants?: boolean;
  isPrintable?: boolean;
};

export type ReviewItem = {
  id: number;
  rating: number;
  title?: string | null;
  body: string;
  createdAt: string;
  user: { name: string };
  images: Array<{ url: string; alt?: string | null }>;
};


function Container({ children }: { children: ReactNode }) {
  return (
    <div className="box-border mx-auto min-w-0 w-full max-w-[1360px] px-4 sm:px-8 lg:px-12">
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

function cartKeyPart(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "none"
  );
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

function StarRow({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} filled={i < full} />
      ))}
    </div>
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

function Stars({
  rating,
  reviews,
  supportText,
}: {
  rating: number;
  reviews: number;
  supportText: string;
}) {
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
        {supportText}
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

function imageMedia(url: string, alt?: string): ProductMediaItem {
  return { type: "image", url, alt };
}

function ProductVideoPlayer({
  item,
  poster,
}: {
  item: ProductMediaItem;
  poster?: string;
}) {
  const video = getVideoRenderInfo(item.url);

  if (video?.kind === "embed") {
    return (
      <iframe
        src={video.src}
        title={item.alt || "Product video"}
        className="h-full w-full bg-black"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    );
  }

  return (
    <video
      src={video?.src || item.url}
      poster={poster}
      className="h-full w-full bg-black object-contain"
      controls
      playsInline
      preload="metadata"
    />
  );
}

export default function ProductClient({
  product,
  catalogSettings,
  shippingFee,
}: {
  product: ProductData;
  catalogSettings: CatalogTemplateSettings;
  shippingFee: string;
}) {
  const { addItem } = useCart();
  const globalCopy = useGlobalCopy();
  const router = useRouter();
  const initialVariant = product.variants[0];
  const [variant, setVariant] = useState<Variant>(initialVariant);
  const [variantSelected, setVariantSelected] = useState(false);
  const initialMedia = product.media[0] ?? imageMedia(product.images[0] ?? initialVariant.images[0] ?? "", product.imageAlts[0]);
  const [activeMedia, setActiveMedia] = useState<ProductMediaItem>(initialMedia);
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState(product.sizes[0] || "");
  const [qty, setQty] = useState(1);
  const [printText, setPrintText] = useState("");
  const [printFileUrl, setPrintFileUrl] = useState("");
  const [printFileName, setPrintFileName] = useState("");
  const [printUploading, setPrintUploading] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);
  const [tab, setTab] = useState<"description" | "reviews" | "shipping">("description");
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", body: "" });
  const [reviewImages, setReviewImages] = useState<Array<{ url: string; alt?: string }>>([]);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewUploading, setReviewUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showMobileCta, setShowMobileCta] = useState(false);
  const [zoom, setZoom] = useState(1);
  const viewContentTracked = useRef(false);
  const ctaBlockRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const mainTouchStartX = useRef<number | null>(null);
  const mainImageSwiped = useRef(false);

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

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/account/me", { cache: "no-store" });
        if (!active) return;
        setIsAuthed(res.ok);
      } catch {
        if (active) setIsAuthed(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const imageAlts = useMemo(
    () => (variantSelected ? variant.imageAlts : product.imageAlts),
    [product.imageAlts, variant.imageAlts, variantSelected]
  );
  const galleryMedia = useMemo<ProductMediaItem[]>(() => {
    if (variantSelected) {
      return variant.images.map((url, idx) => imageMedia(url, variant.imageAlts[idx] || product.name));
    }

    if (product.media.length) return product.media;
    return product.images.map((url, idx) => imageMedia(url, product.imageAlts[idx] || product.name));
  }, [product.imageAlts, product.images, product.media, product.name, variant.imageAlts, variant.images, variantSelected]);
  const lightboxImages = useMemo(
    () => galleryMedia.filter((item) => item.type === "image" && item.url),
    [galleryMedia],
  );
  const activeLightboxIndex = useMemo(() => {
    const index = lightboxImages.findIndex((item) => item.url === activeMedia.url);
    return index >= 0 ? index : 0;
  }, [activeMedia.url, lightboxImages]);
  const currentLightboxImage = lightboxImages[activeLightboxIndex];
  const activePrice = useMemo(() => parsePKR(variant.price) ?? 0, [variant]);
  const compareAt = useMemo(() => parsePKR(variant.compareAt), [variant]);
  const descriptionHtml = useMemo(
    () => withResponsiveTables(product.seoDescription),
    [product.seoDescription],
  );
  const shippingHtml = useMemo(
    () =>
      withResponsiveTables(
        renderCatalogTemplate(
          catalogSettings.productShippingReturnsHtml,
          { shipping: shippingFee },
        ),
      ),
    [catalogSettings.productShippingReturnsHtml, shippingFee],
  );

  const discountPct = useMemo(() => {
    if (!compareAt || compareAt <= activePrice) return null;
    const pct = Math.round(((compareAt - activePrice) / compareAt) * 100);
    return pct > 0 ? pct : null;
  }, [compareAt, activePrice]);
  useEffect(() => {
    if (viewContentTracked.current) return;
    viewContentTracked.current = true;

    trackViewContent({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: activePrice,
    });
    trackViewItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: activePrice,
      category: product.category,
    });
  }, [activePrice, product.category, product.id, product.name, product.slug]);

  useEffect(() => {
    const node = ctaBlockRef.current;
    if (!node) return;

    const syncMobileCta = () => {
      setShowMobileCta(node.getBoundingClientRect().bottom <= 0);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowMobileCta(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0.01 },
    );

    observer.observe(node);
    const frame = window.requestAnimationFrame(syncMobileCta);
    window.addEventListener("scroll", syncMobileCta, { passive: true });
    window.addEventListener("resize", syncMobileCta);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", syncMobileCta);
      window.removeEventListener("resize", syncMobileCta);
    };
  }, []);

  const onSelectVariant = (v: Variant) => {
    setVariantSelected(true);
    setVariant(v);
    setActiveMedia(imageMedia(v.images[0] ?? "", v.imageAlts[0] || product.name));
    setImageIndex(0);
    setLightboxOpen(false);
  };

  const setLightboxImageAt = (nextIndex: number) => {
    if (!lightboxImages.length) return;
    const normalizedIndex = (nextIndex + lightboxImages.length) % lightboxImages.length;
    const item = lightboxImages[normalizedIndex];
    const mediaIndex = galleryMedia.findIndex(
      (media) => media.type === "image" && media.url === item.url,
    );

    setActiveMedia(item);
    setImageIndex(mediaIndex >= 0 ? mediaIndex : normalizedIndex);
    setZoom(1);
  };

  const openImageLightbox = (item: ProductMediaItem, mediaIndex: number) => {
    if (item.type !== "image") return;
    setActiveMedia(item);
    setImageIndex(mediaIndex);
    setZoom(1);
    setLightboxOpen(true);
  };

  const setGalleryMediaAt = (nextIndex: number) => {
    if (!galleryMedia.length) return;
    const normalizedIndex = (nextIndex + galleryMedia.length) % galleryMedia.length;
    const item = galleryMedia[normalizedIndex];
    setActiveMedia(item);
    setImageIndex(normalizedIndex);
    setZoom(1);
  };

  const handleMainImageTouchEnd = (x: number) => {
    if (mainTouchStartX.current === null || galleryMedia.length < 2) {
      mainTouchStartX.current = null;
      return;
    }
    const delta = mainTouchStartX.current - x;
    mainTouchStartX.current = null;
    if (Math.abs(delta) < 45) return;
    mainImageSwiped.current = true;
    if (delta > 0) setGalleryMediaAt(imageIndex + 1);
    else setGalleryMediaAt(imageIndex - 1);
    window.setTimeout(() => {
      mainImageSwiped.current = false;
    }, 0);
  };

  const handleThumbnailClick = (item: ProductMediaItem, idx: number) => {
    setActiveMedia(item);
    setImageIndex(idx);
    setZoom(1);

    if (item.type === "image" && window.matchMedia("(max-width: 1023px)").matches) {
      setLightboxOpen(true);
    }
  };

  const showPreviousLightboxImage = () => {
    setLightboxImageAt(activeLightboxIndex - 1);
  };

  const showNextLightboxImage = () => {
    setLightboxImageAt(activeLightboxIndex + 1);
  };

  const handleLightboxTouchEnd = (x: number) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - x;
    touchStartX.current = null;
    if (Math.abs(delta) < 45) return;
    if (delta > 0) showNextLightboxImage();
    else showPreviousLightboxImage();
  };

  const decQty = () => setQty((q) => Math.max(1, q - 1));
  const incQty = () => setQty((q) => Math.min(99, q + 1));

  const onSelectPrintFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || printUploading) return;

    setPrintUploading(true);
    setPrintError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/customization-uploads", {
        method: "POST",
        body: form,
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload?.ok || !payload?.data?.url) {
        throw new Error(payload?.error || "Unable to upload file.");
      }

      setPrintFileUrl(String(payload.data.url));
      setPrintFileName(String(payload.data.filename || file.name));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload file.";
      setPrintError(message);
    } finally {
      setPrintUploading(false);
      event.target.value = "";
    }
  };

  const onAddToCart = (
    e?: React.MouseEvent | React.TouchEvent,
    options?: { showToast?: boolean; openCart?: boolean },
  ) => {
    if (printUploading) return;
    if (e) {
      if ("preventDefault" in e) e.preventDefault();
      if ("stopPropagation" in e) e.stopPropagation();
    }
    const price = parsePKR(variant.price) ?? 0;
    const compareAtValue = parsePKR(variant.compareAt);
    const sizeKey = size || "default";
    const cleanPrintText = product.isPrintable ? printText.trim() : "";
    const cleanPrintFileUrl = product.isPrintable ? printFileUrl.trim() : "";
    const cleanPrintFileName = product.isPrintable ? printFileName.trim() : "";
    const printKey =
      product.isPrintable && (cleanPrintText || cleanPrintFileUrl)
        ? `print-${cartKeyPart(cleanPrintText)}-${cartKeyPart(cleanPrintFileUrl)}`
        : "standard";
    addItem({
      id: product.isPrintable
        ? `${product.slug}-${variant.id}-${sizeKey}-${printKey}`
        : `${product.slug}-${variant.id}-${sizeKey}`,
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
      printText: cleanPrintText || undefined,
      printFileUrl: cleanPrintFileUrl || undefined,
      printFileName: cleanPrintFileName || undefined,
      category: product.category,
      currency: "PKR",
    }, options);
  };

  const onBuyNow = () => {
    if (printUploading) return;
    onAddToCart(undefined, { showToast: false, openCart: false });
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

  const onSelectReviewImages = async (files: FileList | null) => {
    if (!files || reviewUploading) return;
    if (isAuthed === false) {
      router.push("/login");
      return;
    }
    const remaining = Math.max(0, 6 - reviewImages.length);
    const list = Array.from(files).slice(0, remaining);
    if (!list.length) return;

    setReviewUploading(true);
    setReviewMsg(null);
    try {
      for (const file of list) {
        const form = new FormData();
        form.append("file", file);
        form.append("kind", "review");
        const res = await fetch("/api/account/uploads", { method: "POST", body: form });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const payload = await res.json().catch(() => ({}));
        if (!res.ok || !payload?.data?.url) {
          setReviewMsg(payload?.error || "Failed to upload image.");
          continue;
        }
        setReviewImages((prev) => [
          ...prev,
          { url: payload.data.url, alt: product.name },
        ]);
      }
    } finally {
      setReviewUploading(false);
    }
  };

  const submitReview = async () => {
    if (reviewBusy) return;
    if (isAuthed === false) {
      router.push("/login");
      return;
    }
    const slug = product.slug?.trim();
    if (!slug) {
      setReviewMsg("Unable to submit review right now.");
      return;
    }
    setReviewBusy(true);
    setReviewMsg(null);
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(slug)}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          rating: reviewForm.rating,
          title: reviewForm.title || undefined,
          body: reviewForm.body,
          images: reviewImages,
        }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload?.ok === false) {
        setReviewMsg(payload?.error || "Failed to submit review.");
        return;
      }
      setReviewMsg("Thanks! Your review has been submitted for approval.");
      setReviewForm({ rating: 5, title: "", body: "" });
      setReviewImages([]);
    } finally {
      setReviewBusy(false);
    }
  };

  const formattedDate = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <main className="min-w-0 max-w-full overflow-x-clip pb-24 pt-6 sm:pb-0 sm:pt-10 lg:pb-16">
      <Container>
        {/* TOP SECTION */}
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-12 lg:gap-12">
            {/* LEFT: Gallery */}
            <div className="min-w-0 max-w-full lg:col-span-7">
              <div className="relative w-full max-w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 sm:rounded-3xl">
                <div className="aspect-square min-w-0 w-full max-w-full">
                  {activeMedia.type === "video" ? (
                    <ProductVideoPlayer
                      item={activeMedia}
                      poster={activeMedia.thumbnailUrl || product.images[0]}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (mainImageSwiped.current) return;
                        openImageLightbox(activeMedia, imageIndex);
                      }}
                      onTouchStart={(event) => {
                        mainTouchStartX.current = event.touches[0]?.clientX ?? null;
                      }}
                      onTouchEnd={(event) => {
                        handleMainImageTouchEnd(event.changedTouches[0]?.clientX ?? 0);
                      }}
                      className="block h-full min-w-0 w-full max-w-full cursor-zoom-in touch-pan-y"
                      aria-label="Open product image preview"
                    >
                      <Image
                        src={withImageParams(activeMedia.url, "auto=format&fit=contain&w=1600&q=90")}
                        alt={activeMedia.alt || imageAlts[imageIndex] || product.name}
                        width={1600}
                        height={1600}
                        className="h-full max-h-full w-full max-w-full object-contain"
                        priority
                        sizes="(min-width: 1024px) 58vw, 100vw"
                      />
                    </button>
                  )}
                </div>

                {/* top-left badge area */}
                <div className="pointer-events-none absolute inset-x-3 top-3 flex min-w-0 flex-wrap gap-1.5 sm:inset-x-4 sm:top-4 sm:gap-2">
                  {catalogSettings.productGalleryBadges.map((badge) => (
                    <Pill key={badge}>{badge}</Pill>
                  ))}
                  {discountPct ? <Pill>{discountPct}% off</Pill> : null}
                </div>

                {activeMedia.type === "image" ? (
                  <button
                    type="button"
                    onClick={() => {
                      openImageLightbox(activeMedia, imageIndex);
                    }}
                    className="absolute bottom-3 right-3 min-h-10 rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-neutral-900 shadow-sm backdrop-blur hover:bg-white sm:bottom-4 sm:right-4"
                  >
                    View larger
                  </button>
                ) : null}
              </div>

              {/* Thumbnails */}
              <div className="no-scrollbar mt-3 flex min-w-0 max-w-full snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:mt-4 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:pb-0">
                {galleryMedia.map((item, idx) => {
                  const active = activeMedia.url === item.url && activeMedia.type === item.type;
                  const thumb = item.type === "video" ? item.thumbnailUrl || product.images[0] : item.url;
                  return (
                    <button
                      key={`${item.type}-${item.url}-${idx}`}
                      onClick={() => {
                        handleThumbnailClick(item, idx);
                      }}
                      className={[
                        "group h-16 min-w-16 shrink-0 snap-start overflow-hidden rounded-md border bg-white sm:aspect-square sm:h-auto sm:w-auto sm:rounded-2xl",
                        "focus:outline-none focus:ring-2 focus:ring-neutral-900/20",
                        active ? "border-neutral-900 ring-2 ring-black ring-offset-1" : "border-neutral-200 hover:border-neutral-300",
                      ].join(" ")}
                      aria-label={`Select ${item.type === "video" ? "video" : "image"} ${idx + 1}`}
                    >
                      <div className="relative h-full w-full">
                        {thumb ? (
                          <Image
                            src={withImageParams(thumb, "auto=format&fit=crop&w=320&q=80")}
                            alt={item.alt || product.name}
                            width={320}
                            height={320}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-neutral-950 text-xs font-medium text-white">
                            Video
                          </div>
                        )}
                        {item.type === "video" ? (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-xs font-semibold text-neutral-900 shadow-sm sm:h-10 sm:w-10 sm:text-sm">
                              ▶
                            </span>
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Under-gallery micro info */}
              <div className="mt-6 hidden gap-3 sm:grid sm:grid-cols-3">
                {catalogSettings.productGalleryTrustItems.map((item) => (
                  <TrustItem key={item.title || item.text} title={item.title} desc={item.text} />
                ))}
              </div>
            </div>

            {/* RIGHT: Sticky Buy Box */}
            <div className="min-w-0 max-w-full lg:col-span-5">
              <div className="min-w-0 max-w-full lg:sticky lg:top-6">
                <div className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                  {/* Brand + title */}
                  <p className="break-words text-xs font-medium uppercase tracking-wider text-neutral-500 [overflow-wrap:anywhere]">
                    {product.brand}
                  </p>

                  <h1 className="mt-2 max-w-full break-words text-[1.65rem] font-semibold leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-3xl">
                    {product.name}
                  </h1>

                  <div className="mt-3 flex min-w-0 max-w-full flex-wrap items-center gap-3 sm:flex-nowrap sm:justify-between">
                    <Stars
                      rating={product.rating}
                      reviews={product.reviews}
                      supportText={globalCopy.trust.qualityText}
                    />
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
                  <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:mt-6 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-neutral-500">{catalogSettings.productPriceLabel}</p>
                        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                            {variant.price}
                          </p>
                          {compareAt && compareAt > activePrice ? (
                            <p className="text-sm text-neutral-500 line-through">
                              {formatPKR(compareAt)}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {discountPct ? (
                        <span className="theme-primary-action shrink-0 rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white sm:rounded-2xl sm:px-3">
                          Save {discountPct}%
                        </span>
                      ) : null}
                    </div>

                    {/* Short description right under price (best conversion placement) */}
                    <p className="mt-3 max-w-full break-words text-sm leading-relaxed text-neutral-700 [overflow-wrap:anywhere] sm:mt-4">
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
                                "group inline-flex min-h-10 items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition",
                                "focus:outline-none focus:ring-2 focus:ring-neutral-900/20",
                                active
                                  ? "theme-primary-action border-neutral-900 bg-neutral-900 text-white"
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
                              <span className="max-w-full break-words [overflow-wrap:anywhere]">{v.label}</span>
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
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.sizes.map((s) => {
                          const active = size === s;
                          return (
                            <button
                              key={s}
                              onClick={() => setSize(s)}
                              className={[
                                "min-h-10 rounded-2xl px-4 py-2 text-sm transition",
                                "focus:outline-none focus:ring-2 focus:ring-neutral-900/20",
                                active
                                  ? "theme-primary-action bg-neutral-900 text-white"
                                  : "border border-neutral-200 hover:bg-neutral-50",
                              ].join(" ")}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-xs text-neutral-500">
                        {catalogSettings.productSizeHelper}
                      </p>
                    </div>
                  ) : null}

                  {product.isPrintable ? (
                    <div className="mt-7 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Print details</p>
                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          Add the name, text, logo, or image you want printed.
                        </p>
                      </div>

                      <label className="mt-4 block">
                        <span className="text-xs font-medium text-neutral-700">Text to print</span>
                        <input
                          value={printText}
                          onChange={(event) => setPrintText(event.target.value)}
                          maxLength={160}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900"
                          placeholder="Name, short message, or print instructions"
                        />
                      </label>

                      <div className="mt-4">
                        <p className="text-xs font-medium text-neutral-700">Upload logo or image</p>
                        <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-4 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50">
                          <UploadCloud className="h-4 w-4" aria-hidden="true" />
                          <span>{printUploading ? "Uploading..." : "Choose image file"}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={onSelectPrintFile}
                            disabled={printUploading}
                            className="sr-only"
                          />
                        </label>

                        {printFileUrl ? (
                          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                            <FileCheck2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span className="min-w-0 flex-1 truncate">
                              {printFileName || "Print file uploaded"}
                            </span>
                            <a
                              href={printFileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold hover:underline"
                            >
                              View
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setPrintFileUrl("");
                                setPrintFileName("");
                              }}
                              className="font-semibold hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : null}

                        {printError ? (
                          <p className="mt-2 text-xs font-medium text-red-600">{printError}</p>
                        ) : null}
                      </div>
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
                  <div ref={ctaBlockRef} className="mt-7 grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={onBuyNow}
                      disabled={printUploading}
                      className="cta-attention theme-primary-action min-h-11 rounded-2xl cursor-pointer bg-neutral-900 px-6 py-4 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {globalCopy.product.buyNow}
                    </button>
                    <button
                      onClick={() => onAddToCart()}
                      disabled={printUploading}
                      className="min-h-11 rounded-2xl cursor-pointer border border-neutral-200 px-6 py-4 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {globalCopy.product.addToCart}
                    </button>
                  </div>

                  {/* Trust strip (below CTA) */}
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-neutral-50 p-3">
                      <p className="text-xs font-semibold">{globalCopy.trust.qualityTitle}</p>
                      <p className="mt-0.5 text-xs text-neutral-600">{globalCopy.trust.qualityText}</p>
                    </div>
                    <div className="rounded-2xl bg-neutral-50 p-3">
                      <p className="text-xs font-semibold">{globalCopy.trust.shippingTitle}</p>
                      <p className="mt-0.5 text-xs text-neutral-600">{globalCopy.trust.shippingText}</p>
                    </div>
                    <div className="rounded-2xl bg-neutral-50 p-3">
                      <p className="text-xs font-semibold">Returns</p>
                      <p className="mt-0.5 text-xs text-neutral-600">7-day return policy</p>
                    </div>
                  </div>

                  {/* Fine print */}
                  <p className="mt-5 text-xs text-neutral-500">
                    {catalogSettings.productFinePrint}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="mt-10 min-w-0 max-w-full lg:mt-16">
            <div className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 sm:rounded-3xl sm:p-8">
              <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3 text-sm">
                {[
                  { id: "description", label: catalogSettings.productDescriptionTabLabel },
                  { id: "reviews", label: catalogSettings.productReviewsTabLabel },
                  { id: "shipping", label: catalogSettings.productShippingTabLabel },
                ].map((t) => {
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id as any)}
                      className={[
                        "rounded-full px-4 py-2 transition",
                        active
                          ? "theme-primary-action bg-neutral-900 text-white"
                          : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50",
                      ].join(" ")}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div className={`mt-6 min-w-0 w-full max-w-full sm:mt-8 ${tab === "reviews" ? "" : "sm:max-w-4xl"}`}>
                {tab === "description" && (
                  <div
                    className="rt-content"
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                )}

                {tab === "reviews" && (
                  <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                      <div className="space-y-5">
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                          <p className="text-sm font-semibold text-neutral-900">
                            {catalogSettings.productReviewsTitle}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <StarRow rating={product.rating} />
                            <p className="text-sm text-neutral-600">
                              <span className="font-semibold text-neutral-900">
                                {product.rating.toFixed(1)}
                              </span>{" "}
                              from {product.reviews} reviews
                            </p>
                          </div>
                          <p className="mt-2 text-xs text-neutral-500">
                            {catalogSettings.productReviewsIntro}
                          </p>
                        </div>

                        {product.reviewItems.length ? (
                          product.reviewItems.map((r) => (
                            <div
                              key={r.id}
                              className="rounded-2xl border border-neutral-200 bg-white p-5"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                  <StarRow rating={r.rating} />
                                  <p className="text-sm font-semibold text-neutral-900">
                                    {r.user.name}
                                  </p>
                                </div>
                                <p className="text-xs text-neutral-500">
                                  {formattedDate(r.createdAt)}
                                </p>
                              </div>
                              {r.title ? (
                                <p className="mt-3 text-sm font-semibold text-neutral-900">
                                  {r.title}
                                </p>
                              ) : null}
                              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                                {r.body}
                              </p>
                              {r.images.length ? (
                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                  {r.images.map((img, idx) => (
                                    <div
                                      key={`${img.url}-${idx}`}
                                      className="overflow-hidden rounded-xl border border-neutral-200"
                                    >
                                      <img
                                        src={img.url}
                                        alt={img.alt || product.name}
                                        className="h-28 w-full object-cover"
                                        loading="lazy"
                                      />
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-600">
                            {product.reviews > 0
                              ? "Review summary is available, but detailed customer reviews could not be loaded."
                              : "No reviews yet. Be the first to share your experience."}
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-neutral-200 bg-white p-5 lg:sticky lg:top-6">
                        <p className="text-sm font-semibold text-neutral-900">Write a review</p>
                        {isAuthed === false ? (
                          <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                            Please sign in to leave a review.
                            <button
                              className="theme-primary-action mt-3 w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800"
                              onClick={() => router.push("/login")}
                            >
                              Sign in to review
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4 space-y-4">
                            <div>
                              <label className="text-xs font-medium text-neutral-700">Rating</label>
                              <div className="mt-2 flex gap-2">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() =>
                                      setReviewForm((f) => ({ ...f, rating: n }))
                                    }
                                    className={[
                                      "flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold",
                                      reviewForm.rating >= n
                                        ? "theme-primary-action border-neutral-900 bg-neutral-900 text-white"
                                        : "border-neutral-200 text-neutral-700 hover:bg-neutral-50",
                                    ].join(" ")}
                                  >
                                    {n}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-medium text-neutral-700">
                                Title (optional)
                              </label>
                              <input
                                value={reviewForm.title}
                                onChange={(e) =>
                                  setReviewForm((f) => ({ ...f, title: e.target.value }))
                                }
                                className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                                placeholder="Great quality and fast shipping"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-medium text-neutral-700">Review</label>
                              <textarea
                                value={reviewForm.body}
                                onChange={(e) =>
                                  setReviewForm((f) => ({ ...f, body: e.target.value }))
                                }
                                className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                                rows={4}
                                placeholder="Share your experience with this product."
                              />
                            </div>

                            <div>
                              <label className="text-xs font-medium text-neutral-700">
                                Photos (optional)
                              </label>
                              <div className="mt-2 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-xs text-neutral-600">
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => onSelectReviewImages(e.target.files)}
                                />
                                <p className="mt-2">Up to 6 images. JPG/PNG/WEBP.</p>
                              </div>
                              {reviewImages.length ? (
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                  {reviewImages.map((img, idx) => (
                                    <div
                                      key={`${img.url}-${idx}`}
                                      className="relative overflow-hidden rounded-xl border border-neutral-200"
                                    >
                                      <img
                                        src={img.url}
                                        alt={img.alt || product.name}
                                        className="h-20 w-full object-cover"
                                        loading="lazy"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setReviewImages((prev) =>
                                            prev.filter((_, i) => i !== idx)
                                          )
                                        }
                                        className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>

                            {reviewMsg ? (
                              <p className="text-xs text-neutral-600">{reviewMsg}</p>
                            ) : null}

                            <button
                              type="button"
                              onClick={submitReview}
                              disabled={reviewBusy || reviewUploading || reviewForm.body.trim().length < 10}
                              className="theme-primary-action w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
                            >
                              {reviewBusy ? "Submitting..." : "Submit review"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {tab === "shipping" && (
                  <div className="space-y-3">
                    <div
                      className="rt-content"
                      dangerouslySetInnerHTML={{
                        __html: shippingHtml,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

      </Container>

      {lightboxOpen && currentLightboxImage ? (
        <div className="fixed inset-0 z-[80] bg-black/90 text-white">
          <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="line-clamp-1 text-sm font-medium">{product.name}</p>
              <p className="mt-1 text-xs text-white/60">
                {activeLightboxIndex + 1} / {lightboxImages.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))}
                className="hidden rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/20 sm:inline-flex"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="hidden rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/20 sm:inline-flex"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoom((value) => Math.min(3, Number((value + 0.25).toFixed(2))))}
                className="hidden rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/20 sm:inline-flex"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-950 shadow-lg hover:bg-neutral-100"
                aria-label="Close image preview"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close image preview"
          />

          {lightboxImages.length > 1 ? (
            <>
              <button
                type="button"
                onClick={showPreviousLightboxImage}
                className="absolute left-3 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 sm:left-6"
                aria-label="Previous product image"
              >
                <ChevronLeft className="h-7 w-7" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={showNextLightboxImage}
                className="absolute right-3 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 sm:right-6"
                aria-label="Next product image"
              >
                <ChevronRight className="h-7 w-7" aria-hidden="true" />
              </button>
            </>
          ) : null}

          <div
            className="relative z-[1] flex h-full w-full items-center justify-center overflow-auto p-4 pb-28 pt-20 sm:p-10 sm:pb-32"
            onTouchStart={(event) => {
              touchStartX.current = event.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              handleLightboxTouchEnd(event.changedTouches[0]?.clientX ?? 0);
            }}
          >
            <div
              className="relative h-[72vh] w-full max-w-6xl transition-transform duration-200 sm:h-[82vh]"
              style={{ transform: `scale(${zoom})` }}
            >
              <Image
                src={withImageParams(currentLightboxImage.url, "auto=format&fit=contain&w=2200&q=95")}
                alt={currentLightboxImage.alt || product.name}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {lightboxImages.length > 1 ? (
            <div className="absolute inset-x-0 bottom-4 z-10 px-4">
              <div className="mx-auto flex max-w-4xl gap-2 overflow-x-auto rounded-2xl bg-black/35 p-2 backdrop-blur">
                {lightboxImages.map((item, index) => (
                  <button
                    key={`${item.url}-${index}`}
                    type="button"
                    onClick={() => setLightboxImageAt(index)}
                    className={[
                      "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-neutral-900 sm:h-20 sm:w-20",
                      index === activeLightboxIndex ? "border-white" : "border-white/20 hover:border-white/60",
                    ].join(" ")}
                    aria-label={`Open image ${index + 1}`}
                  >
                    <Image
                      src={withImageParams(item.url, "auto=format&fit=crop&w=240&q=80")}
                      alt={item.alt || product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Mobile sticky CTA bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)] transition-transform sm:hidden"
        style={{ transform: showMobileCta ? "translateY(0)" : "translateY(100%)" }}
      >
        <div className="mx-auto flex max-w-[1360px] items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-neutral-500">
              {product.hasVariants ? variant.label : "Selected item"}
              {size ? ` - ${size}` : ""}
            </p>
            <p className="text-base font-semibold leading-none">{variant.price}</p>
          </div>
          <button
            onClick={() => onAddToCart()}
            disabled={printUploading}
            className="min-h-11 flex-1 rounded-lg border border-neutral-200 px-3 py-3 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {globalCopy.product.mobileCartShort}
          </button>
          <button
            onClick={onBuyNow}
            disabled={printUploading}
            className="cta-attention theme-primary-action min-h-11 flex-1 rounded-lg bg-neutral-900 px-3 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {globalCopy.product.buyNow}
          </button>
        </div>
      </div>
    </main>
  );
}
