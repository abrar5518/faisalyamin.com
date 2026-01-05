import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
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
    console.error("GET /api/categories error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}
