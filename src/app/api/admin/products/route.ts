import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";

const CreateProductSchema = z.object({
  categorySlug: z.string().min(2),
  subcategorySlug: z.string().min(2).optional(),

  name: z.string().min(2),
  slug: z.string().min(2),
  price: z.number().positive(),
  compareAt: z.number().positive().optional(),
  badge: z.string().optional(),

  rating: z.number().min(0).max(5).optional(),
  reviewsCount: z.number().int().min(0).optional(),

  shortDesc: z.string().optional(),
  descriptionHtml: z.string().min(10),

  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isSale: z.boolean().optional(),

  metaKeywords: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  indexable: z.boolean().optional(),
  sizes: z.array(z.string().min(1)).optional(),
  variants: z
    .array(
      z.object({
        id: z.string().min(1).optional(),
        label: z.string().min(1),
        colorCode: z.string().min(1),
        images: z
          .array(
            z.union([
              z.string().min(1),
              z.object({
                url: z.string().min(1),
                alt: z.string().optional(),
              }),
            ])
          )
          .optional(),
      })
    )
    .optional(),

  images: z
    .array(
      z.object({
        url: z.string().min(5),
        alt: z.string().optional(),
        sortOrder: z.number().int().min(0).optional(),
      })
    )
    .optional(),
});

const UpdateProductSchema = z.object({
  categorySlug: z.string().min(2).optional(),
  subcategorySlug: z.string().min(2).nullable().optional(),

  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  price: z.number().positive().optional(),
  compareAt: z.number().positive().optional(),
  badge: z.string().optional(),

  rating: z.number().min(0).max(5).optional(),
  reviewsCount: z.number().int().min(0).optional(),

  shortDesc: z.string().optional(),
  descriptionHtml: z.string().min(10).optional(),

  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isSale: z.boolean().optional(),

  metaKeywords: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  indexable: z.boolean().optional(),
  sizes: z.array(z.string().min(1)).optional(),
  variants: z
    .array(
      z.object({
        id: z.string().min(1).optional(),
        label: z.string().min(1),
        colorCode: z.string().min(1),
        images: z
          .array(
            z.union([
              z.string().min(1),
              z.object({
                url: z.string().min(1),
                alt: z.string().optional(),
              }),
            ])
          )
          .optional(),
      })
    )
    .optional(),

  images: z
    .array(
      z.object({
        url: z.string().min(5),
        alt: z.string().optional(),
        sortOrder: z.number().int().min(0).optional(),
      })
    )
    .optional(),
});

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const item = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: { select: { name: true, slug: true } },
          subcategory: { select: { name: true, slug: true } },
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
          categoryName: category.name,
          subcategoryName: subcategory?.name ?? null,
        },
      });
    }

    const items = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        images: true,
      },
    });

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
        categoryName: category.name,
        subcategoryName: subcategory?.name ?? null,
      };
    });

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("GET /api/admin/products error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await req.json();
    const data = CreateProductSchema.parse(body);

    // 1) Resolve category by slug -> id
    const categoryRecord = await prisma.category.findUnique({
      where: { slug: data.categorySlug },
      select: { id: true },
    });

    if (!categoryRecord) {
      return NextResponse.json(
        { ok: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // 2) Resolve optional subcategory by slug -> id (validate belongs to category)
    let subcategoryId: number | null = null;

    if (data.subcategorySlug) {
      const sub = await prisma.subcategory.findUnique({
        where: { slug: data.subcategorySlug },
        select: { id: true, categoryId: true },
      });

      if (!sub) {
        return NextResponse.json(
          { ok: false, error: "Subcategory not found" },
          { status: 404 }
        );
      }

      if (sub.categoryId !== categoryRecord.id) {
        return NextResponse.json(
          { ok: false, error: "Subcategory does not belong to category" },
          { status: 400 }
        );
      }

      subcategoryId = sub.id;
    }

    // 3) Create product (+ optional images) and return slugs (not ids)
    const created = await prisma.product.create({
      data: {
        categoryId: categoryRecord.id,
        subcategoryId,

        name: data.name,
        slug: data.slug,

        price: data.price,
        compareAt: data.compareAt,
        badge: data.badge,

        rating: data.rating ?? 0,
        reviewsCount: data.reviewsCount ?? 0,

        shortDesc: data.shortDesc,
        descriptionHtml: data.descriptionHtml,

        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        isSale: data.isSale ?? false,

        metaKeywords: data.metaKeywords,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        indexable: data.indexable ?? true,
        sizes: data.sizes,
        variants: data.variants,

        images: data.images?.length
          ? {
            create: data.images.map((img) => ({
              url: img.url,
              alt: img.alt,
              sortOrder: img.sortOrder ?? 0,
            })),
            }
          : undefined,
      },
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        images: true,
      },
    });

    const {
      categoryId,
      subcategoryId: _subId,
      category: createdCategory,
      subcategory: createdSubcategory,
      ...clean
    } = created;

    return NextResponse.json(
      {
        ok: true,
        data: {
          ...clean,
          categorySlug: createdCategory?.slug ?? data.categorySlug,
          subcategorySlug: createdSubcategory?.slug ?? null,
          categoryName: createdCategory?.name ?? null,
          subcategoryName: createdSubcategory?.name ?? null,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    if (err?.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "Slug already exists" },
        { status: 409 }
      );
    }

    console.error("POST /api/admin/products error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ ok: false, error: "slug is required" }, { status: 400 });
    }

    const body = await req.json();
    const data = UpdateProductSchema.parse(body);
    const {
      categorySlug: _categorySlug,
      subcategorySlug: _subcategorySlug,
      images,
      ...updateData
    } = data;

    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, categoryId: true },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
    }

    let categoryId = existing.categoryId;
    if (_categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: _categorySlug },
        select: { id: true },
      });

      if (!category) {
        return NextResponse.json({ ok: false, error: "Category not found" }, { status: 404 });
      }

      categoryId = category.id;
    }

    let subcategoryId: number | null | undefined = undefined;
    if (_subcategorySlug !== undefined) {
      if (_subcategorySlug === null) {
        subcategoryId = null;
      } else {
        const sub = await prisma.subcategory.findUnique({
          where: { slug: _subcategorySlug },
          select: { id: true, categoryId: true },
        });

        if (!sub) {
          return NextResponse.json({ ok: false, error: "Subcategory not found" }, { status: 404 });
        }

        if (sub.categoryId !== categoryId) {
          return NextResponse.json(
            { ok: false, error: "Subcategory does not belong to category" },
            { status: 400 }
          );
        }

        subcategoryId = sub.id;
      }
    }

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: {
        ...updateData,
        categoryId,
        subcategoryId,
        images: images
          ? {
              deleteMany: {},
              create: images.map((img) => ({
                url: img.url,
                alt: img.alt,
                sortOrder: img.sortOrder ?? 0,
              })),
            }
          : undefined,
      },
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        images: true,
      },
    });

    const {
      categoryId: _catId,
      subcategoryId: _subId,
      category,
      subcategory,
      ...clean
    } = updated;

    return NextResponse.json({
      ok: true,
      data: {
        ...clean,
        categorySlug: category.slug,
        subcategorySlug: subcategory?.slug ?? null,
        categoryName: category.name,
        subcategoryName: subcategory?.name ?? null,
      },
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    if (err?.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "Slug already exists" },
        { status: 409 }
      );
    }

    console.error("PUT /api/admin/products error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ ok: false, error: "slug is required" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id: existing.id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/products error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
