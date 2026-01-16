import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/customerAuth";

const ReviewSchema = z.object({
  slug: z.string().min(2).optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(10).max(2000),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        alt: z.string().max(160).optional(),
      })
    )
    .max(6)
    .optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
  }

  const reviews = await prisma.productReview.findMany({
    where: { productId: product.id, status: "APPROVED" },
    orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
    include: {
      user: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  const payload = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt,
    user: { name: r.user?.name || "Customer" },
    images: r.images.map((img) => ({ url: img.url, alt: img.alt })),
  }));

  return NextResponse.json({ ok: true, data: payload });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = ReviewSchema.parse(body);
    const { slug: paramSlug } = await params;
    const slug = paramSlug || data.slug;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
    }

    const existing = await prisma.productReview.findFirst({
      where: { productId: product.id, userId: auth.user.id },
      select: { id: true },
    });

    if (existing) {
      await prisma.productReview.update({
        where: { id: existing.id },
        data: {
          rating: data.rating,
          title: data.title,
          body: data.body,
          status: "PENDING",
          approvedAt: null,
          images: {
            deleteMany: {},
            create:
              data.images?.map((img, idx) => ({
                url: img.url,
                alt: img.alt,
                sortOrder: idx,
              })) ?? [],
          },
        },
      });
    } else {
      await prisma.productReview.create({
        data: {
          productId: product.id,
          userId: auth.user.id,
          rating: data.rating,
          title: data.title,
          body: data.body,
          images: {
            create:
              data.images?.map((img, idx) => ({
                url: img.url,
                alt: img.alt,
                sortOrder: idx,
              })) ?? [],
          },
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    console.error("POST /api/products/[slug]/reviews error:", err);
    return NextResponse.json({ ok: false, error: "Failed to submit review" }, { status: 500 });
  }
}
