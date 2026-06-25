import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import {
  mapReusableBlock,
  normalizeReusableBlockSlug,
  serializeReusableBlockItems,
} from "@/lib/reusableBlocks";

const BlockItemSchema = z.object({
  title: z.string().optional().default(""),
  text: z.string().optional().default(""),
});

const BlockSchema = z.object({
  title: z.string().min(2),
  slug: z.string().optional().nullable(),
  type: z.string().optional().default("trust"),
  placement: z.string().optional().default("general"),
  eyebrow: z.string().optional().nullable(),
  bodyHtml: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  primaryLabel: z.string().optional().nullable(),
  primaryHref: z.string().optional().nullable(),
  secondaryLabel: z.string().optional().nullable(),
  secondaryHref: z.string().optional().nullable(),
  items: z.array(BlockItemSchema).optional().default([]),
  isEnabled: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

function getSlug(data: { slug?: string | null; title: string }) {
  return normalizeReusableBlockSlug(data.slug || data.title);
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  try {
    if (slug) {
      const block = await prisma.reusableBlock.findUnique({ where: { slug } });
      if (!block) {
        return NextResponse.json({ ok: false, error: "Reusable block not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, data: mapReusableBlock(block) });
    }

    const blocks = await prisma.reusableBlock.findMany({
      orderBy: [{ placement: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ ok: true, data: blocks.map(mapReusableBlock) });
  } catch (error) {
    console.error("GET /api/admin/reusable-blocks error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch reusable blocks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const data = BlockSchema.parse(await req.json());
    const slug = getSlug(data);
    if (!slug) {
      return NextResponse.json({ ok: false, error: "Slug is required" }, { status: 400 });
    }

    const block = await prisma.reusableBlock.create({
      data: {
        title: data.title.trim(),
        slug,
        type: data.type.trim() || "trust",
        placement: data.placement.trim() || "general",
        eyebrow: data.eyebrow?.trim() || null,
        bodyHtml: data.bodyHtml?.trim() || null,
        icon: data.icon?.trim() || null,
        primaryLabel: data.primaryLabel?.trim() || null,
        primaryHref: data.primaryHref?.trim() || null,
        secondaryLabel: data.secondaryLabel?.trim() || null,
        secondaryHref: data.secondaryHref?.trim() || null,
        itemsJson: serializeReusableBlockItems(data.items),
        isEnabled: data.isEnabled,
        sortOrder: data.sortOrder,
      },
    });

    return NextResponse.json({ ok: true, data: mapReusableBlock(block) }, { status: 201 });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: error.errors }, { status: 400 });
    }
    if (error?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Reusable block slug already exists" }, { status: 409 });
    }
    console.error("POST /api/admin/reusable-blocks error:", error);
    return NextResponse.json({ ok: false, error: "Failed to create reusable block" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const currentSlug = searchParams.get("slug");
    if (!currentSlug) {
      return NextResponse.json({ ok: false, error: "slug is required" }, { status: 400 });
    }

    const data = BlockSchema.parse(await req.json());
    const slug = getSlug(data);
    const existing = await prisma.reusableBlock.findUnique({ where: { slug: currentSlug } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Reusable block not found" }, { status: 404 });
    }

    const block = await prisma.reusableBlock.update({
      where: { id: existing.id },
      data: {
        title: data.title.trim(),
        slug,
        type: data.type.trim() || "trust",
        placement: data.placement.trim() || "general",
        eyebrow: data.eyebrow?.trim() || null,
        bodyHtml: data.bodyHtml?.trim() || null,
        icon: data.icon?.trim() || null,
        primaryLabel: data.primaryLabel?.trim() || null,
        primaryHref: data.primaryHref?.trim() || null,
        secondaryLabel: data.secondaryLabel?.trim() || null,
        secondaryHref: data.secondaryHref?.trim() || null,
        itemsJson: serializeReusableBlockItems(data.items),
        isEnabled: data.isEnabled,
        sortOrder: data.sortOrder,
      },
    });

    return NextResponse.json({ ok: true, data: mapReusableBlock(block) });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: error.errors }, { status: 400 });
    }
    if (error?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Reusable block slug already exists" }, { status: 409 });
    }
    console.error("PUT /api/admin/reusable-blocks error:", error);
    return NextResponse.json({ ok: false, error: "Failed to update reusable block" }, { status: 500 });
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
    await prisma.reusableBlock.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/reusable-blocks error:", error);
    return NextResponse.json({ ok: false, error: "Failed to delete reusable block" }, { status: 500 });
  }
}
