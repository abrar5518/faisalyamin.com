import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductClient, { ProductData, Variant } from "./ProductClient";
import Schema from "@/components/seo/Schema";
import { absoluteUrl, breadcrumbSchema, productSchema, stripHtml } from "@/components/seo/schemas";

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const product = (await prisma.product.findUnique({
    where: { slug },
    include: { images: true },
  })) as {
    name: string;
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    shortDesc?: string | null;
    images?: Array<{ url: string; sortOrder?: number | null }>;
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
  const rawImage = sortedImages[0]?.url;
  const ogImage = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${baseUrlResolved}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`
    : undefined;
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
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
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

const RELATED_FALLBACK: RelatedProduct[] = [
  {
    id: "omega-seamaster-300m",
    name: "Omega Seamaster Diver 300M",
    price: "PKR 21,500",
    compareAt: "PKR 24,000",
    badge: "-12%",
    rating: 4.7,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3",
    imageAlt: "Omega Seamaster Diver 300M",
    href: "/product/omega-seamaster-300m",
  },
  {
    id: "cartier-santos",
    name: "Cartier Santos Medium",
    price: "PKR 29,500",
    compareAt: "PKR 32,000",
    badge: "Best Seller",
    rating: 4.6,
    reviews: 167,
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
    imageAlt: "Cartier Santos Medium",
    href: "/product/cartier-santos",
  },
  {
    id: "jlc-reverso",
    name: "Jaeger-LeCoultre Reverso",
    price: "PKR 41,800",
    compareAt: "PKR 45,500",
    badge: "Classic",
    rating: 4.8,
    reviews: 120,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    imageAlt: "Jaeger-LeCoultre Reverso",
    href: "/product/jlc-reverso",
  },
  {
    id: "ap-royal-oak",
    name: "Audemars Piguet Royal Oak",
    price: "PKR 189,000",
    compareAt: "PKR 205,000",
    badge: "Limited",
    rating: 4.9,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa",
    imageAlt: "Audemars Piguet Royal Oak",
    href: "/product/ap-royal-oak",
  },
];

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  if (!slug) {
    notFound();
  }
  const [product, siteSettings] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: { images: true, category: true },
    }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
  ]);

  const typedProduct = product as
    | (Prisma.ProductGetPayload<{ include: { images: true; category: true } }> & {
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
  const imageUrls = sortedImages.map((img) => img.url);
  const imageAlts = sortedImages.map((img) => img.alt || typedProduct.name);

  const price = formatPKR(Number(typedProduct.price));
  const compareAt = typedProduct.compareAt ? formatPKR(Number(typedProduct.compareAt)) : undefined;

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

  const productData: ProductData = {
    id: String(typedProduct.id),
    slug,
    brand: typedProduct.category?.name ?? "LuxStore",
    name: typedProduct.name,
    rating: typedProduct.rating ?? 0,
    reviews: typedProduct.reviewsCount ?? 0,
    reviewItems,
    shortDescription:
      typedProduct.shortDesc ??
      "A premium product with verified authenticity and quality checks.",
    seoDescription: typedProduct.descriptionHtml || "<p>Product details will appear here.</p>",
    sizes: sizeList,
    variants: hasVariants ? apiVariants : fallbackVariants,
    hasVariants,
  };

  const relatedRows = await prisma.product.findMany({
    where: {
      categoryId: typedProduct.categoryId,
      slug: { not: slug },
      isActive: true,
    },
    take: 4,
    include: { images: true },
  });

  const relatedProducts: RelatedProduct[] =
    relatedRows.length > 0
      ? relatedRows.map((p) => {
          const imgs = [...p.images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
          const img = imgs[0]?.url || "/images/shopping.jpg";
          const imgAlt = imgs[0]?.alt || p.name;
          return {
            id: p.slug,
            name: p.name,
            price: formatPKR(Number(p.price)),
            compareAt: p.compareAt ? formatPKR(Number(p.compareAt)) : undefined,
            badge: p.badge ?? undefined,
            rating: p.rating ?? 0,
            reviews: p.reviewsCount ?? 0,
            image: img,
            imageAlt: imgAlt,
            href: `/product/${p.slug}`,
          };
        })
      : RELATED_FALLBACK;
  const baseUrlResolved = (siteSettings?.siteUrl || process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const pageUrl = `${baseUrlResolved}/product/${slug}`;
  const productImages = imageUrls.length ? imageUrls : ["/images/shopping.jpg"];
  const descriptionText = typedProduct.shortDesc || stripHtml(typedProduct.descriptionHtml || "");
  const priceValue = Number(typedProduct.price ?? 0);
  const reviewsCount = typedProduct.reviewsCount ?? 0;
  const schemaReviews = reviewItems.slice(0, 4).map((r) => ({
    author: r.user.name,
    ratingValue: r.rating,
    reviewBody: r.body,
    datePublished: r.createdAt,
  }));

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
          name: typedProduct.name,
          description: descriptionText || "Premium product details.",
          sku: String(typedProduct.id),
          brand: typedProduct.category?.name ?? "LuxStore",
          images: productImages.map((img) => absoluteUrl(img, baseUrlResolved)),
          url: pageUrl,
          price: priceValue,
          currency: "PKR",
          availability: typedProduct.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          category: typedProduct.category?.name ?? undefined,
          aggregateRating: reviewsCount
            ? { ratingValue: typedProduct.rating ?? 0, reviewCount: reviewsCount }
            : undefined,
          reviews: schemaReviews.length ? schemaReviews : undefined,
        })}
      />
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">Home</Link>
            <span className="text-neutral-300">/</span>
            <Link className="hover:text-neutral-900" href="/shop">Shop</Link>
            <span className="text-neutral-300">/</span>
            <span className="line-clamp-1 text-neutral-900">{typedProduct.name}</span>
          </div>
        </div>
      </div>

      <ProductClient product={productData} />

      {/* RELATED PRODUCTS */}
      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 pb-24">
        <div className="mt-14 lg:mt-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Related products</h2>
              <p className="mt-2 text-sm text-neutral-600">
                Similar picks customers often compare with this item.
              </p>
            </div>

            <Link
              href="/shop"
              className="hidden sm:inline text-sm font-medium text-neutral-900 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 grid gap-3 max-[420px]:grid-cols-1 min-[421px]:grid-cols-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} p={p} variant="sale" />
            ))}
          </div>

          <div className="mt-6 sm:hidden">
            <Link
              href="/shop"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              View all products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
