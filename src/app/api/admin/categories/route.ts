import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";

const CreateCategorySchema = z.object({
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

const UpdateCategorySchema = z.object({
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
      const item = await prisma.category.findUnique({
        where: { slug },
        include: {
          subcategories: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              image: true,
              imageAlt: true,
              metaKeywords: true,
            },
          },
        },
      });

      if (!item) {
        return NextResponse.json({ ok: false, error: "Category not found" }, { status: 404 });
      }

      return NextResponse.json({ ok: true, data: item });
    }

    const items = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            imageAlt: true,
            metaKeywords: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, data: items });
  } catch (err) {
    console.error("GET /api/admin/categories error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = CreateCategorySchema.parse(body);

    const created = await prisma.category.create({
      data: {
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
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    if (err?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Category slug already exists" }, { status: 409 });
    }

    console.error("POST /api/admin/categories error:", err);
    return NextResponse.json({ ok: false, error: "Failed to create category" }, { status: 500 });
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
    const data = UpdateCategorySchema.parse(body);

    const existing = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: "Category not found" }, { status: 404 });
    }

    const updated = await prisma.category.update({
      where: { id: existing.id },
      data,
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    if (err?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Category slug already exists" }, { status: 409 });
    }

    console.error("PUT /api/admin/categories error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update category" }, { status: 500 });
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

    const existing = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: "Category not found" }, { status: 404 });
    }

    const productCount = await prisma.product.count({ where: { categoryId: existing.id } });
    if (productCount > 0) {
      return NextResponse.json(
        { ok: false, error: "Category has products. Delete products first." },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id: existing.id } });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === "P2003") {
      return NextResponse.json(
        { ok: false, error: "Category is in use by related records" },
        { status: 409 }
      );
    }

    console.error("DELETE /api/admin/categories error:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete category" }, { status: 500 });
  }
}
