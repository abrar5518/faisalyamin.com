import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductClient, { ProductData, ProductMediaItem, Variant } from "./ProductClient";
import Schema from "@/components/seo/Schema";
import { absoluteUrl, breadcrumbSchema, productSchema, stripHtml } from "@/components/seo/schemas";
import { normalizeSiteUrl } from "@/lib/siteUrl";
import FaqSection from "@/components/FaqSection";
import {
  parseCatalogSettings,
  renderCatalogTemplate,
} from "@/lib/catalogSettings";
import { redirectIfManaged } from "@/lib/serverRedirects";
import { toProductCardData } from "@/lib/productCardData";

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const baseUrl = normalizeSiteUrl();
  const product = (await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: { images: true },
  })) as {
    name: string;
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    shortDesc?: string | null;
    images?: Array<{ url: string; alt?: string | null; sortOrder?: number | null; mediaType?: string | null }>;
  } | null;

  if (!product) {
    return {
      title: "Product not found",
      description: "This product could not be found.",
      alternates: { canonical: `${baseUrl}/product/${slug}` },
    };
  }

  const baseUrlResolved = baseUrl.replace(/\/$/, "");
  const sortedImages = [...(product.images ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );
  const seoImages = sortedImages
    .filter((img) => (img.mediaType ?? "image") === "image")
    .slice(0, 6)
    .map((img) => ({
      url: img.url.startsWith("http")
        ? img.url
        : `${baseUrlResolved}${img.url.startsWith("/") ? "" : "/"}${img.url}`,
      alt: img.alt || product.name,
    }));
  const title = product.metaTitle || product.name;
  const description = product.metaDescription || product.shortDesc || undefined;

  return {
    title,
    description,
    keywords: product.metaKeywords || undefined,
    alternates: { canonical: `${baseUrl}/product/${slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${baseUrlResolved}/product/${slug}`,
      images: seoImages.length ? seoImages : undefined,
    },
    twitter: {
      card: seoImages.length ? "summary_large_image" : "summary",
      title,
      description,
      images: seoImages.length ? seoImages.map((image) => image.url) : undefined,
    },
  };
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

type RelatedProduct = {
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
  href: string;
};

type ReviewItem = {
  id: number;
  rating: number;
  title?: string | null;
  body: string;
  createdAt: string;
  user: { name: string };
  images: Array<{ url: string; alt?: string | null }>;
};

function formatPKR(n: number) {
  return `PKR ${n.toLocaleString("en-PK")}`;
}

function parsePKRAmount(value?: string | null) {
  if (!value) return null;
  const amount = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) ? amount : null;
}

function schemaProductName(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= 150) return normalized;
  return `${normalized.slice(0, 147).trimEnd()}...`;
}

function normalizeVariants(
  raw: any,
  images: string[],
  imageAlts: string[],
  productName: string,
  price: string,
  compareAt?: string
): Variant[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [];
  }

  const fallbackImages = images.length ? images : [];
  const fallbackAlts = imageAlts.length ? imageAlts : [];
  const list = raw.map((v: any, idx: number) => {
    const vImages = Array.isArray(v?.images)
      ? v.images
          .map((img: any) => (typeof img === "string" ? img : img?.url))
          .filter(Boolean)
      : [];
    const vAlts = Array.isArray(v?.images)
      ? v.images
          .map((img: any) => (typeof img === "string" ? productName : img?.alt || productName))
          .filter(Boolean)
      : [];
    return {
      id: v?.id ? String(v.id) : `variant-${idx + 1}`,
      label: v?.label || `Variant ${idx + 1}`,
      colorCode: v?.colorCode || "#111827",
      images: vImages.length ? vImages : fallbackImages,
      imageAlts: vAlts.length ? vAlts : fallbackAlts,
      price,
      compareAt,
    } as Variant;
  });

  return list;
}

function collectVariantImageUrls(raw: unknown) {
  const urls = new Set<string>();
  if (!Array.isArray(raw)) return urls;

  for (const variant of raw) {
    if (!Array.isArray(variant?.images)) continue;
    for (const image of variant.images) {
      const url = typeof image === "string" ? image : image?.url;
      if (url) urls.add(url);
    }
  }

  return urls;
}

const RELATED_FALLBACK: RelatedProduct[] = [
  {
    id: "featured-product-one",
    name: "Featured Product",
    price: "PKR 1,650",
    compareAt: "PKR 1,950",
    badge: "-12%",
    rating: 4.7,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3",
    imageAlt: "Featured product",
    href: "/shop",
  },
  {
    id: "customer-favorite",
    name: "Customer Favorite",
    price: "PKR 850",
    compareAt: "PKR 1,050",
    badge: "Best Seller",
    rating: 4.6,
    reviews: 167,
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
    imageAlt: "Customer favorite product",
    href: "/shop",
  },
  {
    id: "new-arrival",
    name: "New Arrival",
    price: "PKR 1,950",
    compareAt: "PKR 2,250",
    badge: "New",
    rating: 4.8,
    reviews: 120,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    imageAlt: "New arrival product",
    href: "/shop",
  },
  {
    id: "limited-offer",
    name: "Limited Offer",
    price: "PKR 1,150",
    compareAt: "PKR 1,450",
    badge: "Deal",
    rating: 4.9,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa",
    imageAlt: "Limited offer product",
    href: "/shop",
  },
];

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  if (!slug) {
    notFound();
  }
  await redirectIfManaged(`/product/${slug}`);
  const [product, siteSettings, storeSettings] = await Promise.all([
    prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        images: true,
        category: true,
        faqItems: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
    prisma.storeSettings.findFirst({ orderBy: { id: "asc" } }),
  ]);

  const typedProduct = product as
    | (Prisma.ProductGetPayload<{
        include: {
          images: true;
          category: true;
          faqItems: { orderBy: { sortOrder: "asc" } };
        };
      }> & {
        brand?: string | null;
        isPrintable?: boolean | null;
        sizes?: unknown;
        variants?: unknown;
      })
    | null;

  if (!typedProduct) {
    notFound();
  }

  const sortedImages = [...typedProduct.images].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );
  const imageMedia = sortedImages.filter((img: any) => (img.mediaType ?? "image") === "image");
  const videoMedia = sortedImages.filter((img: any) => img.mediaType === "video");
  const variantImageUrls = collectVariantImageUrls(typedProduct.variants);
  const defaultGalleryImages = imageMedia.filter(
    (img, index) => index === 0 || !variantImageUrls.has(img.url)
  );
  const imageUrls = defaultGalleryImages.map((img) => img.url);
  const imageAlts = defaultGalleryImages.map((img) => img.alt || typedProduct.name);
  const defaultGalleryMedia: ProductMediaItem[] = [
    ...defaultGalleryImages.map((img) => ({
      type: "image" as const,
      url: img.url,
      alt: img.alt || typedProduct.name,
    })),
    ...videoMedia.map((video: any) => ({
      type: "video" as const,
      url: video.url,
      alt: video.alt || typedProduct.name,
      thumbnailUrl: video.thumbnailUrl || imageUrls[0],
    })),
  ];

  const price = formatPKR(Number(typedProduct.price));
  const compareAt = typedProduct.compareAt ? formatPKR(Number(typedProduct.compareAt)) : undefined;
  const catalogSettings = parseCatalogSettings(siteSettings?.catalogSettings);
  const shippingFee = storeSettings?.defaultShippingFee || "PKR 250";

  const sizeList = Array.isArray(typedProduct.sizes)
    ? typedProduct.sizes.filter((s) => typeof s === "string")
    : [];

  const apiVariants = normalizeVariants(typedProduct.variants, imageUrls, imageAlts, typedProduct.name, price, compareAt);
  const hasVariants = apiVariants.length > 0;
  const defaultImages = imageUrls.length ? imageUrls : ["/images/shopping.jpg"];
  const defaultAlts = imageAlts.length ? imageAlts : [typedProduct.name];
  const fallbackVariants: Variant[] = [
    {
      id: "default",
      label: "Default",
      colorCode: "#111827",
      images: defaultImages,
      imageAlts: defaultAlts,
      price,
      compareAt,
    },
  ];

  const reviewRows = await prisma.productReview.findMany({
    where: { productId: typedProduct.id, status: "APPROVED" },
    orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
    include: {
      user: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  const reviewItems: ReviewItem[] = reviewRows.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
    user: { name: r.user?.name || "Customer" },
    images: r.images.map((img) => ({ url: img.url, alt: img.alt || undefined })),
  }));
  const approvedReviewCount = reviewItems.length;
  const approvedRating =
    approvedReviewCount > 0
      ? Number(
          (
            reviewItems.reduce((total, review) => total + review.rating, 0) /
            approvedReviewCount
          ).toFixed(1)
        )
      : 0;
  const storedRating = Number(typedProduct.rating);
  const storedReviewCount = Number(typedProduct.reviewsCount);
  const fallbackRating =
    Number.isFinite(storedRating) && storedRating > 0
      ? Math.min(5, Math.max(1, Number(storedRating.toFixed(1))))
      : 0;
  const fallbackReviewCount =
    Number.isFinite(storedReviewCount) && storedReviewCount > 0
      ? Math.floor(storedReviewCount)
      : 0;
  // Approved review rows are the source of truth. The product summary fields are
  // retained as a fallback for feeds/APIs that only return aggregate review data.
  const hasFallbackAggregate = fallbackRating > 0 && fallbackReviewCount > 0;
  const displayRating = approvedReviewCount
    ? approvedRating
    : hasFallbackAggregate
      ? fallbackRating
      : 0;
  const displayReviewCount = approvedReviewCount
    ? approvedReviewCount
    : hasFallbackAggregate
      ? fallbackReviewCount
      : 0;

  const productData: ProductData = {
    id: String(typedProduct.id),
    slug,
    brand: typedProduct.brand || typedProduct.category?.name || catalogSettings.productBrandFallback,
    category: typedProduct.category?.name ?? "Products",
    name: typedProduct.name,
    rating: displayRating,
    reviews: displayReviewCount,
    reviewItems,
    shortDescription:
      typedProduct.shortDesc ??
      catalogSettings.productFallbackDescription,
    seoDescription: typedProduct.descriptionHtml || "<p>Product details will appear here.</p>",
    images: defaultImages,
    imageAlts: defaultAlts,
    media: defaultGalleryMedia.length ? defaultGalleryMedia : defaultImages.map((url, idx) => ({
      type: "image",
      url,
      alt: defaultAlts[idx] || typedProduct.name,
    })),
    sizes: sizeList,
    variants: hasVariants ? apiVariants : fallbackVariants,
    hasVariants,
    isPrintable: Boolean(typedProduct.isPrintable),
  };

  const categoryRelatedRows = await prisma.product.findMany({
    where: {
      categoryId: typedProduct.categoryId,
      slug: { not: slug },
      isActive: true,
    },
    take: 4,
    include: { images: true },
  });
  const missingRelatedCount = Math.max(0, 4 - categoryRelatedRows.length);
  const additionalRelatedRows = missingRelatedCount
    ? await prisma.product.findMany({
        where: {
          slug: { notIn: [slug, ...categoryRelatedRows.map((item) => item.slug)] },
          isActive: true,
        },
        orderBy: [{ isFeatured: "desc" }, { rating: "desc" }, { createdAt: "desc" }],
        take: missingRelatedCount,
        include: { images: true },
      })
    : [];
  const relatedRows = [...categoryRelatedRows, ...additionalRelatedRows];

  const relatedProducts: RelatedProduct[] =
    relatedRows.length > 0
      ? relatedRows.map((p) => ({
          ...toProductCardData(p, "/images/shopping.jpg"),
          href: `/product/${p.slug}`,
        }))
      : RELATED_FALLBACK;
  const baseUrlResolved = normalizeSiteUrl(siteSettings?.siteUrl);
  const pageUrl = `${baseUrlResolved}/product/${slug}`;
  const productImages = imageUrls.length ? imageUrls : ["/images/shopping.jpg"];
  const descriptionText = typedProduct.shortDesc || stripHtml(typedProduct.descriptionHtml || "");
  const priceValue = Number(typedProduct.price ?? 0);
  const schemaReviews = reviewItems.map((r) => ({
    author: r.user.name,
    ratingValue: r.rating,
    name: r.title || `${typedProduct.name} review`,
    reviewBody: r.body,
    datePublished: r.createdAt,
  }));
  const schemaBrand =
    typedProduct.brand?.trim() || catalogSettings.productBrandFallback || "Faisal Yamin";
  const schemaShippingPrice = parsePKRAmount(storeSettings?.defaultShippingFee) ?? 250;
  const schemaReturnDays = storeSettings?.returnsDays ?? 7;
  const schemaSellerName =
    storeSettings?.storeName?.trim() || siteSettings?.siteName?.trim() || "Faisal Yamin";
  const schemaColor = apiVariants.length
    ? apiVariants.map((variant) => variant.label.trim()).filter(Boolean).join(", ")
    : undefined;
  const schemaSize = sizeList.length ? sizeList.join(", ") : undefined;

  return (
    <div className="bg-white text-neutral-900">
      <Schema
        data={breadcrumbSchema([
          { name: "Home", item: baseUrlResolved },
          { name: "Shop", item: `${baseUrlResolved}/shop` },
          { name: typedProduct.name, item: pageUrl },
        ])}
      />
      <Schema
        data={productSchema({
          name: schemaProductName(typedProduct.name),
          description: descriptionText || catalogSettings.productFallbackDescription,
          id: `${pageUrl}#product`,
          sku: typedProduct.sku?.trim() || `SAH-${typedProduct.id}`,
          mpn: typedProduct.sku?.trim() || `SAH-${typedProduct.id}`,
          brand: schemaBrand,
          images: productImages.map((img) => absoluteUrl(img, baseUrlResolved)),
          url: pageUrl,
          color: schemaColor,
          size: schemaSize,
          additionalProperties: [
            ...(hasVariants
              ? [{ name: "Available variants", value: String(apiVariants.length) }]
              : []),
            ...(typedProduct.isPrintable
              ? [{ name: "Printable", value: "Yes" }]
              : []),
          ],
          price: priceValue,
          currency: "PKR",
          availability: typedProduct.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          category: typedProduct.category?.name ?? undefined,
          sellerName: schemaSellerName,
          sellerUrl: baseUrlResolved,
          sellerId: `${baseUrlResolved}/#organization`,
          shipping: {
            country: "PK",
            price: schemaShippingPrice,
            currency: "PKR",
            handlingMinDays: 0,
            handlingMaxDays: 1,
            transitMinDays: 2,
            transitMaxDays: 5,
          },
          returnPolicy: {
            country: "PK",
            days: schemaReturnDays,
            fees: "https://schema.org/ReturnShippingFees",
            method: "https://schema.org/ReturnByMail",
          },
          aggregateRating: displayReviewCount && displayRating
            ? { ratingValue: displayRating, reviewCount: displayReviewCount }
            : undefined,
          reviews: schemaReviews.length ? schemaReviews : undefined,
        })}
      />
      <ProductClient
        product={productData}
        catalogSettings={catalogSettings}
        shippingFee={shippingFee}
      />

      {/* RELATED PRODUCTS */}
      <div className="ma-pdp-aftercare w-full px-[2.75vw] pb-24 max-[700px]:px-[14px]">
        <FaqSection
          items={typedProduct.faqItems}
          title={renderCatalogTemplate(catalogSettings.productFaqTitleTemplate, {
            product: typedProduct.name,
          })}
          intro={catalogSettings.productFaqIntro}
          eyebrow="Product FAQs"
          includeSchema
          variant="soft"
          className="mt-14 lg:mt-16"
        />

        <div className="ma-pdp-related">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="font-serif text-4xl font-normal tracking-tight lg:text-5xl">
                {catalogSettings.relatedProductsTitle}
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                {catalogSettings.relatedProductsSubtitle}
              </p>
            </div>

            <Link
              href="/shop"
              className="hidden sm:inline text-sm font-medium text-neutral-900 hover:underline"
            >
              {catalogSettings.relatedProductsViewAllLabel}
            </Link>
          </div>

          <div className="product-card-grid mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} p={p} variant="maison" />
            ))}
          </div>

          <div className="mt-6 sm:hidden">
            <Link
              href="/shop"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              {catalogSettings.relatedProductsViewAllLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
