import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";

const CreateProductSchema = z.object({
  categorySlug: z.string().min(2),
  subcategorySlug: z.string().min(2).optional(),
  categorySlugs: z.array(z.string().min(2)).optional(),
  subcategorySlugs: z.array(z.string().min(2)).optional(),

  name: z.string().min(2),
  slug: z.string().min(2),
  brand: z.string().optional(),
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
  categorySlugs: z.array(z.string().min(2)).optional(),
  subcategorySlugs: z.array(z.string().min(2)).optional(),

  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  brand: z.string().optional(),
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

function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

async function resolveCategoryIds(slugs: string[]) {
  const categories = await prisma.category.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const found = new Set(categories.map((category) => category.slug));
  const missing = slugs.filter((slug) => !found.has(slug));
  return { categories, missing };
}

async function resolveSubcategoryIds(slugs: string[], categoryIds: number[]) {
  const subcategories = await prisma.subcategory.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, categoryId: true },
  });
  const found = new Set(subcategories.map((subcategory) => subcategory.slug));
  const missing = slugs.filter((slug) => !found.has(slug));
  const allowedCategoryIds = new Set(categoryIds);
  const invalid = subcategories.filter((subcategory) => !allowedCategoryIds.has(subcategory.categoryId));
  return { subcategories, missing, invalid };
}

function productCategoryData(categoryIds: number[]) {
  return categoryIds.map((categoryId) => ({ categoryId }));
}

function productSubcategoryData(subcategoryIds: number[]) {
  return subcategoryIds.map((subcategoryId) => ({ subcategoryId }));
}

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
          productCategories: {
            include: { category: { select: { name: true, slug: true } } },
            orderBy: { id: "asc" },
          },
          productSubcategories: {
            include: { subcategory: { select: { name: true, slug: true } } },
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
      const categories = productCategories.length
        ? productCategories.map((link) => link.category)
        : [category];
      const subcategories = productSubcategories.length
        ? productSubcategories.map((link) => link.subcategory)
        : subcategory
          ? [subcategory]
          : [];

      return NextResponse.json({
        ok: true,
        data: {
          ...clean,
          categorySlug: category.slug,
          subcategorySlug: subcategory?.slug ?? null,
          categoryName: category.name,
          subcategoryName: subcategory?.name ?? null,
          categorySlugs: categories.map((c) => c.slug),
          subcategorySlugs: subcategories.map((s) => s.slug),
          categoryNames: categories.map((c) => c.name),
          subcategoryNames: subcategories.map((s) => s.name),
        },
      });
    }

    const items = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        productCategories: {
          include: { category: { select: { name: true, slug: true } } },
          orderBy: { id: "asc" },
        },
        productSubcategories: {
          include: { subcategory: { select: { name: true, slug: true } } },
          orderBy: { id: "asc" },
        },
        images: true,
      },
    });

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
      const categories = productCategories.length
        ? productCategories.map((link) => link.category)
        : [category];
      const subcategories = productSubcategories.length
        ? productSubcategories.map((link) => link.subcategory)
        : subcategory
          ? [subcategory]
          : [];

      return {
        ...clean,
        categorySlug: category.slug,
        subcategorySlug: subcategory?.slug ?? null,
        categoryName: category.name,
        subcategoryName: subcategory?.name ?? null,
        categorySlugs: categories.map((c) => c.slug),
        subcategorySlugs: subcategories.map((s) => s.slug),
        categoryNames: categories.map((c) => c.name),
        subcategoryNames: subcategories.map((s) => s.name),
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

    const categorySlugs = uniqueStrings([...(data.categorySlugs ?? []), data.categorySlug]);
    const { categories, missing: missingCategories } = await resolveCategoryIds(categorySlugs);
    if (missingCategories.length || categories.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const categoryRecord = categories.find((category) => category.slug === data.categorySlug) ?? categories[0];
    const categoryIds = categories.map((category) => category.id);
    const subcategorySlugs = uniqueStrings([...(data.subcategorySlugs ?? []), data.subcategorySlug]);
    let subcategoryId: number | null = null;
    let subcategoryIds: number[] = [];

    if (subcategorySlugs.length > 0) {
      const {
        subcategories,
        missing: missingSubcategories,
        invalid,
      } = await resolveSubcategoryIds(subcategorySlugs, categoryIds);
      if (missingSubcategories.length) {
        return NextResponse.json(
          { ok: false, error: "Subcategory not found" },
          { status: 404 }
        );
      }
      if (invalid.length) {
        return NextResponse.json(
          { ok: false, error: "Subcategory does not belong to selected categories" },
          { status: 400 }
        );
      }

      subcategoryIds = subcategories.map((subcategory) => subcategory.id);
      subcategoryId =
        subcategories.find((subcategory) => subcategory.slug === data.subcategorySlug)?.id ??
        subcategories[0]?.id ??
        null;
    }

    // 3) Create product (+ optional images) and return slugs (not ids)
    const created = await prisma.product.create({
      data: {
        categoryId: categoryRecord.id,
        subcategoryId,

        name: data.name,
        slug: data.slug,
        brand: data.brand,

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
        productCategories: {
          create: productCategoryData(categoryIds),
        },
        productSubcategories: subcategoryIds.length
          ? {
              create: productSubcategoryData(subcategoryIds),
            }
          : undefined,
      },
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        productCategories: {
          include: { category: { select: { name: true, slug: true } } },
          orderBy: { id: "asc" },
        },
        productSubcategories: {
          include: { subcategory: { select: { name: true, slug: true } } },
          orderBy: { id: "asc" },
        },
        images: true,
      },
    });

    const {
      categoryId,
      subcategoryId: _subId,
      category: createdCategory,
      subcategory: createdSubcategory,
      productCategories,
      productSubcategories,
      ...clean
    } = created;
    const createdCategories = productCategories.map((link) => link.category);
    const createdSubcategories = productSubcategories.map((link) => link.subcategory);

    return NextResponse.json(
      {
        ok: true,
        data: {
          ...clean,
          categorySlug: createdCategory?.slug ?? data.categorySlug,
          subcategorySlug: createdSubcategory?.slug ?? null,
          categoryName: createdCategory?.name ?? null,
          subcategoryName: createdSubcategory?.name ?? null,
          categorySlugs: createdCategories.map((category) => category.slug),
          subcategorySlugs: createdSubcategories.map((subcategory) => subcategory.slug),
          categoryNames: createdCategories.map((category) => category.name),
          subcategoryNames: createdSubcategories.map((subcategory) => subcategory.name),
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
      categorySlugs: _categorySlugs,
      subcategorySlugs: _subcategorySlugs,
      images,
      ...updateData
    } = data;

    const existing = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        categoryId: true,
        subcategoryId: true,
        productCategories: { select: { categoryId: true } },
        productSubcategories: { select: { subcategoryId: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
    }

    let categoryId = existing.categoryId;
    let categoryIds = existing.productCategories.length
      ? existing.productCategories.map((link) => link.categoryId)
      : [existing.categoryId];
    const shouldSyncCategories = _categorySlugs !== undefined || _categorySlug !== undefined;
    if (shouldSyncCategories) {
      const slugs = uniqueStrings([...(_categorySlugs ?? []), _categorySlug]);
      const { categories, missing } = await resolveCategoryIds(slugs);
      if (missing.length || categories.length === 0) {
        return NextResponse.json({ ok: false, error: "Category not found" }, { status: 404 });
      }

      categoryIds = categories.map((category) => category.id);
      categoryId = categories.find((category) => category.slug === _categorySlug)?.id ?? categories[0].id;
    }

    let subcategoryId: number | null | undefined = undefined;
    let subcategoryIds = existing.productSubcategories.length
      ? existing.productSubcategories.map((link) => link.subcategoryId)
      : existing.subcategoryId
        ? [existing.subcategoryId]
        : [];
    const shouldSyncSubcategories = _subcategorySlugs !== undefined || _subcategorySlug !== undefined;
    if (shouldSyncSubcategories) {
      if (_subcategorySlug === null && _subcategorySlugs === undefined) {
        subcategoryId = null;
        subcategoryIds = [];
      } else {
        const slugs = uniqueStrings([...(_subcategorySlugs ?? []), _subcategorySlug]);
        if (slugs.length === 0) {
          subcategoryId = null;
          subcategoryIds = [];
        } else {
          const { subcategories, missing, invalid } = await resolveSubcategoryIds(slugs, categoryIds);
          if (missing.length) {
            return NextResponse.json({ ok: false, error: "Subcategory not found" }, { status: 404 });
          }
          if (invalid.length) {
            return NextResponse.json(
              { ok: false, error: "Subcategory does not belong to selected categories" },
              { status: 400 }
            );
          }

          subcategoryIds = subcategories.map((subcategory) => subcategory.id);
          subcategoryId =
            subcategories.find((subcategory) => subcategory.slug === _subcategorySlug)?.id ??
            subcategories[0]?.id ??
            null;
        }
      }
    }

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: {
        ...updateData,
        categoryId,
        subcategoryId,
        productCategories: shouldSyncCategories
          ? {
              deleteMany: {},
              create: productCategoryData(categoryIds),
            }
          : undefined,
        productSubcategories: shouldSyncSubcategories || shouldSyncCategories
          ? {
              deleteMany: {},
              create: productSubcategoryData(subcategoryIds),
            }
          : undefined,
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
        productCategories: {
          include: { category: { select: { name: true, slug: true } } },
          orderBy: { id: "asc" },
        },
        productSubcategories: {
          include: { subcategory: { select: { name: true, slug: true } } },
          orderBy: { id: "asc" },
        },
        images: true,
      },
    });

    const {
      categoryId: _catId,
      subcategoryId: _subId,
      category,
      subcategory,
      productCategories,
      productSubcategories,
      ...clean
    } = updated;
    const categories = productCategories.map((link) => link.category);
    const subcategories = productSubcategories.map((link) => link.subcategory);

    return NextResponse.json({
      ok: true,
      data: {
        ...clean,
        categorySlug: category.slug,
        subcategorySlug: subcategory?.slug ?? null,
        categoryName: category.name,
        subcategoryName: subcategory?.name ?? null,
        categorySlugs: categories.map((c) => c.slug),
        subcategorySlugs: subcategories.map((s) => s.slug),
        categoryNames: categories.map((c) => c.name),
        subcategoryNames: subcategories.map((s) => s.name),
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
