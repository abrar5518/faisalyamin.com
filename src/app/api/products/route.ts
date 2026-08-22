import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { toProductCardData } from "@/lib/productCardData";

const PRODUCT_FALLBACK_IMAGE = "/images/shopping.jpg";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const categorySlug = searchParams.get("categorySlug");
    const subcategorySlug = searchParams.get("subcategorySlug");
    const isSale = searchParams.get("isSale");
    const isFeatured = searchParams.get("isFeatured");
    const q = searchParams.get("q");
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "30");
    const sort = searchParams.get("sort") ?? "createdAt_desc";

    if (slug) {
      const item = await prisma.product.findFirst({
        where: { slug, isActive: true },
        include: {
          category: { select: { slug: true, name: true } },
          subcategory: { select: { slug: true } },
          productCategories: {
            include: { category: { select: { slug: true } } },
            orderBy: { id: "asc" },
          },
          productSubcategories: {
            include: { subcategory: { select: { slug: true } } },
            orderBy: { id: "asc" },
          },
          images: true,
        },
      });

      if (!item) {
        return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
      }

      const {
        categoryId,
        subcategoryId,
        category,
        subcategory,
        productCategories,
        productSubcategories,
        ...clean
      } = item;
      delete (clean as { sku?: string | null }).sku;
      const categorySlugs = productCategories.length
        ? productCategories.map((link) => link.category.slug)
        : [category.slug];
      const subcategorySlugs = productSubcategories.length
        ? productSubcategories.map((link) => link.subcategory.slug)
        : subcategory?.slug
          ? [subcategory.slug]
          : [];

      return NextResponse.json({
        ok: true,
        data: {
          ...clean,
          card: toProductCardData({ ...item, category: { name: category.name } }, PRODUCT_FALLBACK_IMAGE),
          categorySlug: category.slug,
          subcategorySlug: subcategory?.slug ?? null,
          categorySlugs,
          subcategorySlugs,
        },
      });
    }

    const andFilters: Prisma.ProductWhereInput[] = [];
    if (categorySlug) {
      andFilters.push({
        OR: [
          { category: { slug: categorySlug } },
          { productCategories: { some: { category: { slug: categorySlug } } } },
        ],
      });
    }
    if (subcategorySlug) {
      andFilters.push({
        OR: [
          { subcategory: { slug: subcategorySlug } },
          { productSubcategories: { some: { subcategory: { slug: subcategorySlug } } } },
        ],
      });
    }
    if (q) {
      andFilters.push({
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
          { shortDesc: { contains: q } },
        ],
      });
    }

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(andFilters.length ? { AND: andFilters } : {}),
      ...(isSale === "1" || isSale === "true" ? { isSale: true } : {}),
      ...(isFeatured === "1" || isFeatured === "true" ? { isFeatured: true } : {}),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === "price_asc"
        ? { price: "asc" }
        : sort === "price_desc"
        ? { price: "desc" }
        : sort === "rating_desc"
        ? { rating: "desc" }
        : sort === "createdAt_asc"
        ? { createdAt: "asc" }
        : { createdAt: "desc" };

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safePageSize =
      Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 100 ? pageSize : 30;

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
        include: {
          category: { select: { slug: true, name: true } },
          subcategory: { select: { slug: true } },
          productCategories: {
            include: { category: { select: { slug: true } } },
            orderBy: { id: "asc" },
          },
          productSubcategories: {
            include: { subcategory: { select: { slug: true } } },
            orderBy: { id: "asc" },
          },
          images: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    const data = items.map((item) => {
      const {
        categoryId,
        subcategoryId,
        category,
        subcategory,
        productCategories,
        productSubcategories,
        ...clean
      } = item;
      delete (clean as { sku?: string | null }).sku;
      const categorySlugs = productCategories.length
        ? productCategories.map((link) => link.category.slug)
        : [category.slug];
      const subcategorySlugs = productSubcategories.length
        ? productSubcategories.map((link) => link.subcategory.slug)
        : subcategory?.slug
          ? [subcategory.slug]
          : [];

      return {
        ...clean,
        card: toProductCardData({ ...item, category: { name: category.name } }, PRODUCT_FALLBACK_IMAGE),
        categorySlug: category.slug,
        subcategorySlug: subcategory?.slug ?? null,
        categorySlugs,
        subcategorySlugs,
      };
    });

    return NextResponse.json({
      ok: true,
      data,
      meta: { page: safePage, pageSize: safePageSize, total },
    });
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch products" }, { status: 500 });
  }
}
