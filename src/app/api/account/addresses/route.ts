import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/customerAuth";

const AddressSchema = z.object({
  id: z.number().optional(),
  label: z.string().optional(),
  fullName: z.string().min(2),
  phone: z.string().min(7).optional().or(z.literal("")),
  address1: z.string().min(4),
  address2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  country: z.string().min(2),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const prismaAny = prisma as any;
  const addresses = await prismaAny.accountAddress.findMany({
    where: { userId: auth.user.id },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json({ ok: true, data: addresses });
}

export async function POST(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = AddressSchema.parse(body);

    const prismaAny = prisma as any;
    const created = await prismaAny.accountAddress.create({
      data: {
        userId: auth.user.id,
        label: data.label ?? null,
        fullName: data.fullName,
        phone: data.phone?.trim() || null,
        address1: data.address1,
        address2: data.address2 ?? null,
        city: data.city,
        state: data.state ?? null,
        country: data.country,
        postalCode: data.postalCode ?? null,
        notes: data.notes ?? null,
        isDefault: Boolean(data.isDefault),
      },
    });

    if (created.isDefault) {
      await prismaAny.accountAddress.updateMany({
        where: { userId: auth.user.id, id: { not: created.id } },
        data: { isDefault: false },
      });
    }

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    console.error("POST /api/account/addresses error:", err);
    return NextResponse.json({ ok: false, error: "Failed to add address" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = AddressSchema.parse(body);
    if (!data.id) {
      return NextResponse.json({ ok: false, error: "Address id required" }, { status: 400 });
    }

    const prismaAny = prisma as any;
    const existing = await prismaAny.accountAddress.findFirst({
      where: { id: data.id, userId: auth.user.id },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: "Address not found" }, { status: 404 });
    }

    const updated = await prismaAny.accountAddress.update({
      where: { id: data.id },
      data: {
        label: data.label ?? null,
        fullName: data.fullName,
        phone: data.phone?.trim() || null,
        address1: data.address1,
        address2: data.address2 ?? null,
        city: data.city,
        state: data.state ?? null,
        country: data.country,
        postalCode: data.postalCode ?? null,
        notes: data.notes ?? null,
        isDefault: Boolean(data.isDefault),
      },
    });

    if (updated.isDefault) {
      await prismaAny.accountAddress.updateMany({
        where: { userId: auth.user.id, id: { not: updated.id } },
        data: { isDefault: false },
      });
    }

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    console.error("PUT /api/account/addresses error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const id = Number(body?.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ ok: false, error: "Address id required" }, { status: 400 });
    }

    const prismaAny = prisma as any;
    await prismaAny.accountAddress.deleteMany({
      where: { id, userId: auth.user.id },
    });

    const remaining = await prismaAny.accountAddress.findMany({
      where: { userId: auth.user.id },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });

    if (remaining.length > 0 && !remaining.some((a: any) => a.isDefault)) {
      await prismaAny.accountAddress.update({
        where: { id: remaining[0].id },
        data: { isDefault: true },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/account/addresses error:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete address" }, { status: 500 });
  }
}
