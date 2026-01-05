import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const categorySlug = searchParams.get("categorySlug");

    if (slug) {
      const item = await prisma.subcategory.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          descriptionHtml: true,
          image: true,
          imageAlt: true,
          metaTitle: true,
          metaDescription: true,
          metaKeywords: true,
          category: { select: { id: true, name: true, slug: true } },
        },
      });

      if (!item) {
        return NextResponse.json({ ok: false, error: "Subcategory not found" }, { status: 404 });
      }

      return NextResponse.json({ ok: true, data: item });
    }

    const where = categorySlug ? { category: { slug: categorySlug } } : undefined;

    const items = await prisma.subcategory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        descriptionHtml: true,
        image: true,
        imageAlt: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ ok: true, data: items });
  } catch (err) {
    console.error("GET /api/subcategories error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch subcategories" }, { status: 500 });
  }
}
