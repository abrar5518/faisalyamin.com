import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { normalizeCouponCode } from "@/lib/coupons";

const CreateCouponSchema = z.object({
  code: z.string().min(2).max(30),
  description: z.string().optional(),
  type: z.enum(["PERCENT", "FIXED", "FREE_SHIPPING"]),
  value: z.number().nonnegative(),
  minSubtotal: z.number().nonnegative().optional(),
  maxDiscount: z.number().nonnegative().optional(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  usageLimit: z.number().int().positive().optional(),
  perCustomerLimit: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

const UpdateCouponSchema = CreateCouponSchema.partial();

function parseDateInput(value?: string | null) {
  if (value === undefined) return undefined;
  if (value === null || value.trim() === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date value.");
  }
  return date;
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const coupon = await prisma.coupon.findUnique({
        where: { id: Number(id) },
      });

      if (!coupon) {
        return NextResponse.json({ ok: false, error: "Coupon not found" }, { status: 404 });
      }

      return NextResponse.json({ ok: true, data: coupon });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, data: coupons });
  } catch (err) {
    console.error("GET /api/admin/coupons error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = CreateCouponSchema.parse(await req.json());
    const code = normalizeCouponCode(body.code);
    const startsAt = parseDateInput(body.startsAt);
    const endsAt = parseDateInput(body.endsAt);
    const value = body.type === "FREE_SHIPPING" ? 0 : body.value;

    const created = await prisma.coupon.create({
      data: {
        code,
        description: body.description || undefined,
        type: body.type,
        value,
        minSubtotal: body.minSubtotal ?? undefined,
        maxDiscount: body.maxDiscount ?? undefined,
        startsAt: startsAt ?? undefined,
        endsAt: endsAt ?? undefined,
        usageLimit: body.usageLimit ?? undefined,
        perCustomerLimit: body.perCustomerLimit ?? undefined,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    if (err?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Coupon code already exists" }, { status: 409 });
    }
    if (err?.message === "Invalid date value.") {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    console.error("POST /api/admin/coupons error:", err);
    return NextResponse.json({ ok: false, error: "Failed to create coupon" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
    }

    const body = UpdateCouponSchema.parse(await req.json());
    const data: any = {};

    if (body.code !== undefined) data.code = normalizeCouponCode(body.code);
    if (body.description !== undefined) data.description = body.description || null;
    if (body.type !== undefined) data.type = body.type;
    if (body.value !== undefined) data.value = body.type === "FREE_SHIPPING" ? 0 : body.value;
    if (body.type === "FREE_SHIPPING" && body.value === undefined) data.value = 0;
    if (body.minSubtotal !== undefined) data.minSubtotal = body.minSubtotal ?? null;
    if (body.maxDiscount !== undefined) data.maxDiscount = body.maxDiscount ?? null;
    if (body.usageLimit !== undefined) data.usageLimit = body.usageLimit ?? null;
    if (body.perCustomerLimit !== undefined) data.perCustomerLimit = body.perCustomerLimit ?? null;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    if (body.startsAt !== undefined) data.startsAt = parseDateInput(body.startsAt);
    if (body.endsAt !== undefined) data.endsAt = parseDateInput(body.endsAt);

    const updated = await prisma.coupon.update({
      where: { id: Number(id) },
      data,
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    if (err?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Coupon code already exists" }, { status: 409 });
    }
    if (err?.message === "Invalid date value.") {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    console.error("PUT /api/admin/coupons error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
    }

    await prisma.coupon.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/coupons error:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete coupon" }, { status: 500 });
  }
}
