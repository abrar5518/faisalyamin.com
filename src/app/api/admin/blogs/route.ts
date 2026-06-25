import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";
import { serializeBlogTags } from "@/lib/blogContent";

const BlogProductSelectionSchema = z.object({
  productId: z.number().int().positive(),
  placement: z.enum(["top", "middle", "bottom"]),
  sortOrder: z.number().int().min(0).optional(),
});

const FaqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const CreateBlogSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  coverAlt: z.string().optional(),
  contentHtml: z.string().min(10),
  category: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  authorId: z.number().int().positive().nullable().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().optional(),
  productSelections: z.array(BlogProductSelectionSchema).optional(),
  faqItems: z.array(FaqItemSchema).optional(),
});

const UpdateBlogSchema = z.object({
  title: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  coverAlt: z.string().optional(),
  contentHtml: z.string().min(10).optional(),
  category: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  authorId: z.number().int().positive().nullable().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().nullable().optional(),
  productSelections: z.array(BlogProductSelectionSchema).optional(),
  faqItems: z.array(FaqItemSchema).optional(),
});

function faqCreateData(faqItems?: Array<{ question: string; answer: string }>) {
  return faqItems?.map((item, idx) => ({
    question: item.question,
    answer: item.answer,
    sortOrder: idx,
  }));
}

function parseDate(input?: string | null) {
  if (!input) return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const item = await prisma.blog.findUnique({
        where: { slug },
        include: {
          blogProducts: {
            orderBy: { sortOrder: "asc" },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  compareAt: true,
                  isActive: true,
                  images: {
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                  },
                },
              },
            },
          },
          faqItems: { orderBy: { sortOrder: "asc" } },
          author: {
            select: { id: true, name: true, slug: true, role: true, avatar: true },
          },
        },
      });
      if (!item) {
        return NextResponse.json({ ok: false, error: "Blog not found" }, { status: 404 });
      }

      const productSelections = item.blogProducts.map((row) => ({
        productId: row.productId,
        placement: row.placement.toLowerCase(),
        sortOrder: row.sortOrder,
        product: row.product,
      }));

      return NextResponse.json({ ok: true, data: { ...item, productSelections } });
    }

    const items = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, slug: true } },
        _count: { select: { faqItems: true, blogProducts: true } },
      },
    });
    return NextResponse.json({ ok: true, data: items });
  } catch (err) {
    console.error("GET /api/admin/blogs error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = CreateBlogSchema.parse(body);
    const publishedAt = parseDate(data.publishedAt);
    const productSelections = data.productSelections ?? [];

    const created = await prisma.blog.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        coverAlt: data.coverAlt,
        contentHtml: data.contentHtml,
        category: data.category?.trim() || null,
        tags: serializeBlogTags(data.tags),
        authorId: data.authorId ?? null,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        isPublished: data.isPublished ?? false,
        publishedAt:
          data.isPublished === true
            ? publishedAt ?? new Date()
            : publishedAt ?? null,
        blogProducts: productSelections.length
          ? {
              create: productSelections.map((p, idx) => ({
                productId: p.productId,
                placement: p.placement.toUpperCase() as any,
                sortOrder: p.sortOrder ?? idx,
              })),
            }
          : undefined,
        faqItems: data.faqItems?.length
          ? { create: faqCreateData(data.faqItems) }
          : undefined,
      },
      include: { faqItems: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    if (err?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Blog slug already exists" }, { status: 409 });
    }

    console.error("POST /api/admin/blogs error:", err);
    return NextResponse.json({ ok: false, error: "Failed to create blog" }, { status: 500 });
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
    const data = UpdateBlogSchema.parse(body);
    const publishedAt = parseDate(data.publishedAt ?? undefined);
    const productSelections = data.productSelections;
    const faqItems = data.faqItems;

    const existing = await prisma.blog.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: "Blog not found" }, { status: 404 });
    }

    const updated = await prisma.blog.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        coverAlt: data.coverAlt,
        contentHtml: data.contentHtml,
        category: typeof data.category === "string" ? data.category.trim() || null : undefined,
        tags: data.tags === undefined ? undefined : serializeBlogTags(data.tags),
        authorId: data.authorId === undefined ? undefined : data.authorId,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        isPublished: data.isPublished,
        publishedAt:
          data.isPublished === true
            ? publishedAt ?? new Date()
            : data.isPublished === false
            ? null
            : publishedAt,
        blogProducts: productSelections
          ? {
              deleteMany: {},
              create: productSelections.map((p, idx) => ({
                productId: p.productId,
                placement: p.placement.toUpperCase() as any,
                sortOrder: p.sortOrder ?? idx,
              })),
            }
          : undefined,
        faqItems: faqItems
          ? {
              deleteMany: {},
              create: faqCreateData(faqItems),
            }
          : undefined,
      },
      include: { faqItems: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    if (err?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Blog slug already exists" }, { status: 409 });
    }

    console.error("PUT /api/admin/blogs error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update blog" }, { status: 500 });
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

    const existing = await prisma.blog.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: "Blog not found" }, { status: 404 });
    }

    await prisma.blog.delete({ where: { id: existing.id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/blogs error:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete blog" }, { status: 500 });
  }
}
