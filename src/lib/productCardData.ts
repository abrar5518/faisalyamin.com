import type { Product as ProductCardData } from "@/components/ProductCard";

type ProductImageLike = {
  url?: string | null;
  alt?: string | null;
  sortOrder?: number | null;
  mediaType?: string | null;
};

type ProductLike = {
  id: number;
  slug: string;
  name: string;
  price: unknown;
  compareAt?: unknown;
  badge?: string | null;
  rating?: number | null;
  reviewsCount?: number | null;
  shortDesc?: string | null;
  variants?: unknown;
  sizes?: unknown;
  images?: ProductImageLike[];
  category?: { name?: string | null } | null;
};

function formatPrice(value: unknown) {
  const amount = Number(value ?? 0);
  return `PKR ${Number.isFinite(amount) ? amount.toLocaleString("en-PK") : "0"}`;
}

function activeVariants(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((variant) => {
    if (!variant || typeof variant !== "object") return false;
    return (variant as { isActive?: boolean }).isActive !== false;
  });
}

export function toProductCardData(product: ProductLike, fallbackImage: string): ProductCardData {
  const images = [...(product.images ?? [])]
    .filter((image) => image.url && image.mediaType !== "video")
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const variants = activeVariants(product.variants);
  const colorSwatches = variants
    .map((variant) => {
      const item = variant as { label?: unknown; colorCode?: unknown };
      return {
        label: typeof item.label === "string" && item.label.trim() ? item.label.trim() : "Colour",
        colorCode: typeof item.colorCode === "string" ? item.colorCode.trim() : "",
      };
    })
    .filter((item) => /^#[0-9a-f]{3,8}$/i.test(item.colorCode));
  const sizes = Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [];
  const mainImage = images[0];
  const hoverImage = images[1];

  return {
    id: product.slug,
    productId: product.id,
    name: product.name,
    price: formatPrice(product.price),
    compareAt: product.compareAt != null ? formatPrice(product.compareAt) : undefined,
    badge: product.badge || undefined,
    rating: typeof product.rating === "number" ? product.rating : 0,
    reviews: typeof product.reviewsCount === "number" ? product.reviewsCount : 0,
    image: mainImage?.url || fallbackImage,
    imageAlt: mainImage?.alt || product.name,
    hoverImage: hoverImage?.url || undefined,
    hoverImageAlt: hoverImage?.alt || product.name,
    href: `/product/${product.slug}`,
    subtitle: product.shortDesc || undefined,
    shortDesc: product.shortDesc || undefined,
    categoryLabel: product.category?.name || undefined,
    colorSwatches,
    hasOptions: variants.length > 0 || sizes.length > 0,
  };
}
