import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/customerAuth";

const WishlistSchema = z.object({
  productId: z.number().int().positive(),
});

function formatPKR(n: number) {
  return `PKR ${n.toLocaleString("en-PK")}`;
}

export async function GET(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const url = new URL(req.url);
  const productIdParam = url.searchParams.get("productId");
  const prismaAny = prisma as any;

  if (productIdParam) {
    const productId = Number(productIdParam);
    if (!Number.isFinite(productId)) {
      return NextResponse.json({ ok: false, error: "Invalid productId" }, { status: 400 });
    }

    const existing = await prismaAny.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: auth.user.id,
          productId,
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, data: { inWishlist: !!existing } });
  }

  const rows = await prismaAny.wishlistItem.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: { images: true },
      },
    },
  });

  const items = rows.map((row: any) => {
    const product = row.product;
    const images = [...(product?.images ?? [])].sort(
      (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
    const img = images[0]?.url || "/images/shopping.jpg";
    const imgAlt = images[0]?.alt || product?.name || "Product image";
    const priceValue = Number(product?.price ?? 0);
    const compareAtValue = product?.compareAt ? Number(product.compareAt) : null;

    return {
      id: product?.slug ? String(product.slug) : String(product?.id ?? ""),
      productId: Number(product?.id ?? 0),
      name: product?.name ?? "Product",
      price: formatPKR(priceValue),
      compareAt: compareAtValue ? formatPKR(compareAtValue) : undefined,
      badge: product?.badge ?? undefined,
      rating: product?.rating ?? 0,
      reviews: product?.reviewsCount ?? 0,
      image: img,
      imageAlt: imgAlt,
      href: product?.slug ? `/product/${product.slug}` : "/shop",
    };
  });

  return NextResponse.json({ ok: true, data: items });
}

export async function POST(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = WishlistSchema.parse(body);

    const prismaAny = prisma as any;
    const product = await prismaAny.product.findUnique({
      where: { id: data.productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
    }

    const item = await prismaAny.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: auth.user.id,
          productId: data.productId,
        },
      },
      create: { userId: auth.user.id, productId: data.productId },
      update: {},
      select: { id: true },
    });

    return NextResponse.json({ ok: true, data: item }, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    console.error("POST /api/account/wishlist error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update wishlist" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const productIdRaw = body?.productId;
    const productId = Number(productIdRaw);
    const prismaAny = prisma as any;

    const result = await prismaAny.wishlistItem.deleteMany({
      where: {
        userId: auth.user.id,
        ...(Number.isFinite(productId) ? { productId } : {}),
      },
    });

    return NextResponse.json({ ok: true, data: { deleted: result.count } });
  } catch (err: any) {
    console.error("DELETE /api/account/wishlist error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update wishlist" }, { status: 500 });
  }
}
