import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/customerAuth";

const ProfileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7).optional().or(z.literal("")),
  country: z.string().optional(),
  city: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const prismaAny = prisma as any;
  const user = await prismaAny.user.findUnique({
    where: { id: auth.user.id },
    select: { id: true, name: true, email: true, profile: true },
  });

  return NextResponse.json({ ok: true, data: user });
}

export async function PUT(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = ProfileSchema.parse(body);
    const email = data.email.toLowerCase();
    const phone = data.phone?.trim() || null;

    const prismaAny = prisma as any;
    const existing = await prismaAny.user.findUnique({
      where: { id: auth.user.id },
      select: { email: true },
    });

    const updated = await prismaAny.user.update({
      where: { id: auth.user.id },
      data: {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email,
        profile: {
          upsert: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              phone,
              country: data.country ?? null,
              city: data.city ?? null,
              company: data.company ?? null,
              notes: data.notes ?? null,
            },
            update: {
              firstName: data.firstName,
              lastName: data.lastName,
              phone,
              country: data.country ?? null,
              city: data.city ?? null,
              company: data.company ?? null,
              notes: data.notes ?? null,
            },
          },
        },
      },
      select: { id: true, name: true, email: true, profile: true },
    });

    if (existing?.email && existing.email !== email) {
      await prismaAny.customer.updateMany({
        where: { email: existing.email },
        data: { email },
      });
    }

    await prismaAny.customer.updateMany({
      where: { email },
      data: {
        name: `${data.firstName} ${data.lastName}`.trim(),
        phone,
      },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    if (err?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 409 });
    }

    console.error("PUT /api/account/profile error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update profile" }, { status: 500 });
  }
}
