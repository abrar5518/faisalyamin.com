import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { recomputeProductRating } from "@/lib/reviews";

const UpdateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id: paramId } = await params;
  const idParam =
    paramId || req.nextUrl.pathname.split("/").filter(Boolean).slice(-1)[0];
  const id = Number(idParam || 0);
  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ ok: false, error: "Invalid review id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const data = UpdateSchema.parse(body);

    const existing = await prisma.productReview.findUnique({
      where: { id },
      select: { id: true, productId: true },
    });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Review not found" }, { status: 404 });
    }

    await prisma.productReview.update({
      where: { id },
      data: {
        status: data.status,
        approvedAt: data.status === "APPROVED" ? new Date() : null,
      },
    });

    await recomputeProductRating(existing.productId);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    console.error("PUT /api/admin/reviews/[id] error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id: paramId } = await params;
  const idParam =
    paramId || req.nextUrl.pathname.split("/").filter(Boolean).slice(-1)[0];
  const id = Number(idParam || 0);
  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ ok: false, error: "Invalid review id" }, { status: 400 });
  }

  try {
    const existing = await prisma.productReview.findUnique({
      where: { id },
      select: { id: true, productId: true },
    });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Review not found" }, { status: 404 });
    }

    await prisma.productReview.delete({ where: { id } });
    await recomputeProductRating(existing.productId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/reviews/[id] error:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete review" }, { status: 500 });
  }
}
