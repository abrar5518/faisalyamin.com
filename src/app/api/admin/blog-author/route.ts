import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

const AuthorSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  role: z.string().optional(),
  avatar: z.string().optional(),
  bioHtml: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

const DEFAULT_AUTHOR = {
  name: "Store Editorial",
  slug: "store-editorial",
  role: "Ecommerce Team",
  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  bioHtml:
    "<p>We share buying guides, product tips, and practical shopping advice for customers.</p>",
  metaTitle: "Store Editorial",
  metaDescription: "Buying guides, product tips, and shopping advice.",
  metaKeywords: "store editorial, shopping guides, ecommerce",
};

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const author = await prisma.blogAuthor.findFirst({ orderBy: { id: "asc" } });
    return NextResponse.json({ ok: true, data: author ?? DEFAULT_AUTHOR });
  } catch (err) {
    console.error("GET /api/admin/blog-author error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch author" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = AuthorSchema.parse(body);

    const existing = await prisma.blogAuthor.findFirst({ orderBy: { id: "asc" } });

    const saved = existing
      ? await prisma.blogAuthor.update({
          where: { id: existing.id },
          data: {
            name: data.name,
            slug: data.slug,
            role: data.role,
            avatar: data.avatar,
            bioHtml: data.bioHtml,
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            metaKeywords: data.metaKeywords,
          },
        })
      : await prisma.blogAuthor.create({
          data: {
            name: data.name,
            slug: data.slug,
            role: data.role,
            avatar: data.avatar,
            bioHtml: data.bioHtml,
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            metaKeywords: data.metaKeywords,
          },
        });

    return NextResponse.json({ ok: true, data: saved });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    if (err?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Author slug already exists" }, { status: 409 });
    }

    console.error("PUT /api/admin/blog-author error:", err);
    return NextResponse.json({ ok: false, error: "Failed to save author" }, { status: 500 });
  }
}
