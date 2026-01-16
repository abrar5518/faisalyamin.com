import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const productSlug = searchParams.get("product");

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (productSlug) {
      where.product = { slug: productSlug };
    }

    const rows = await prisma.productReview.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      include: {
        product: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, name: true, email: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    const data = rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      status: r.status,
      createdAt: r.createdAt,
      approvedAt: r.approvedAt,
      product: r.product,
      user: r.user,
      images: r.images.map((img) => ({ url: img.url, alt: img.alt })),
    }));

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("GET /api/admin/reviews error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch reviews" }, { status: 500 });
  }
}
