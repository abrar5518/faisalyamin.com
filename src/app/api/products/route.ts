import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const categorySlug = searchParams.get("categorySlug");
    const subcategorySlug = searchParams.get("subcategorySlug");
    const isSale = searchParams.get("isSale");
    const isFeatured = searchParams.get("isFeatured");
    const isActive = searchParams.get("isActive");
    const q = searchParams.get("q");
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "20");
    const sort = searchParams.get("sort") ?? "createdAt_desc";

    if (slug) {
      const item = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: { select: { slug: true } },
          subcategory: { select: { slug: true } },
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
        ...clean
      } = item;

      return NextResponse.json({
        ok: true,
        data: {
          ...clean,
          categorySlug: category.slug,
          subcategorySlug: subcategory?.slug ?? null,
        },
      });
    }

    const where =
      categorySlug || subcategorySlug || q || isSale || isFeatured || isActive
        ? {
            ...(categorySlug ? { category: { slug: categorySlug } } : {}),
            ...(subcategorySlug ? { subcategory: { slug: subcategorySlug } } : {}),
            ...(isSale === "1" || isSale === "true" ? { isSale: true } : {}),
            ...(isFeatured === "1" || isFeatured === "true" ? { isFeatured: true } : {}),
            ...(isActive === "0" || isActive === "false"
              ? { isActive: false }
              : isActive === "1" || isActive === "true"
              ? { isActive: true }
              : {}),
            ...(q
              ? {
                  OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { slug: { contains: q, mode: "insensitive" } },
                    { shortDesc: { contains: q, mode: "insensitive" } },
                  ],
                }
              : {}),
          }
        : undefined;

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
      Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 100 ? pageSize : 20;

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
        include: {
          category: { select: { slug: true } },
          subcategory: { select: { slug: true } },
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
        ...clean
      } = item;

      return {
        ...clean,
        categorySlug: category.slug,
        subcategorySlug: subcategory?.slug ?? null,
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
