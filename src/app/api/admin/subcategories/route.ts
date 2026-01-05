import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";

const CreateSubcategorySchema = z.object({
  categorySlug: z.string().min(2), // slug se resolve hoga
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  descriptionHtml: z.string().optional(),
  image: z.string().min(1).optional(),
  imageAlt: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

const UpdateSubcategorySchema = z.object({
  categorySlug: z.string().min(2).optional(),
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  descriptionHtml: z.string().optional(),
  image: z.string().min(1).optional(),
  imageAlt: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const item = await prisma.subcategory.findUnique({
        where: { slug },
        include: { category: { select: { name: true, slug: true } } },
      });

      if (!item) {
        return NextResponse.json({ ok: false, error: "Subcategory not found" }, { status: 404 });
      }

      return NextResponse.json({ ok: true, data: item });
    }

    const items = await prisma.subcategory.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json({ ok: true, data: items });
  } catch (err) {
    console.error("GET /api/admin/subcategories error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch subcategories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = CreateSubcategorySchema.parse(body);

    const category = await prisma.category.findUnique({
      where: { slug: data.categorySlug },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json({ ok: false, error: "Category not found" }, { status: 404 });
    }

    const created = await prisma.subcategory.create({
      data: {
        categoryId: category.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        descriptionHtml: data.descriptionHtml,
        image: data.image,
        imageAlt: data.imageAlt,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
      },
      include: { category: { select: { name: true, slug: true } } },
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    if (err?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Subcategory slug already exists" }, { status: 409 });
    }

    console.error("POST /api/admin/subcategories error:", err);
    return NextResponse.json({ ok: false, error: "Failed to create subcategory" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ ok: false, error: "slug is required" }, { status: 400 });
    }

    const body = await req.json();
    const data = UpdateSubcategorySchema.parse(body);
    const { categorySlug, ...updateData } = data;

    const existing = await prisma.subcategory.findUnique({
      where: { slug },
      select: { id: true, categoryId: true },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: "Subcategory not found" }, { status: 404 });
    }

    let categoryId = existing.categoryId;
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      });

      if (!category) {
        return NextResponse.json({ ok: false, error: "Category not found" }, { status: 404 });
      }

      categoryId = category.id;
    }

    const updated = await prisma.subcategory.update({
      where: { id: existing.id },
      data: {
        ...updateData,
        categoryId,
      },
      include: { category: { select: { name: true, slug: true } } },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    if (err?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Subcategory slug already exists" }, { status: 409 });
    }

    console.error("PUT /api/admin/subcategories error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update subcategory" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ ok: false, error: "slug is required" }, { status: 400 });
    }

    const existing = await prisma.subcategory.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: "Subcategory not found" }, { status: 404 });
    }

    const productCount = await prisma.product.count({ where: { subcategoryId: existing.id } });
    if (productCount > 0) {
      return NextResponse.json(
        { ok: false, error: "Subcategory has products. Delete products first." },
        { status: 409 }
      );
    }

    await prisma.subcategory.delete({ where: { id: existing.id } });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === "P2003") {
      return NextResponse.json(
        { ok: false, error: "Subcategory is in use by related records" },
        { status: 409 }
      );
    }

    console.error("DELETE /api/admin/subcategories error:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete subcategory" }, { status: 500 });
  }
}
