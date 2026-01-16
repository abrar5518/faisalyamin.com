import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await ctx.params;
    const userId = Number(id);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ ok: false, error: "Invalid customer id" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "Customer not found" }, { status: 404 });
    }

    // Find customer by email (Customer table has separate IDs from User table)
    const customer = await prisma.customer.findFirst({
      where: { email: user.email },
      include: {
        orders: {
          include: {
            items: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const addresses = await prisma.accountAddress.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });

    const data = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.profile?.phone ?? customer?.phone ?? null,
      city: user.profile?.city ?? customer?.city ?? null,
      country: user.profile?.country ?? customer?.country ?? null,
      loyaltyPoints: customer?.loyaltyPoints ?? 0,
      createdAt: user.createdAt,
      notes: user.profile?.notes ?? null,
      addresses: addresses.map((a) => ({
        label: a.label ?? "Address",
        line1: a.address1,
        city: a.city,
        province: a.state ?? null,
        country: a.country,
        postalCode: a.postalCode ?? null,
      })),
      orders: (customer?.orders ?? []).map((o) => ({
        id: o.id,
        createdAt: o.createdAt,
        total: Number(o.total),
        paymentStatus: o.paymentMethod ? "paid" : "pending",
        fulfillment:
          o.status === "CANCELLED"
            ? "cancelled"
            : o.status === "SHIPPED"
            ? "shipped"
            : "processing",
      })),
    };

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("GET /api/admin/customers/[id] error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch customer" }, { status: 500 });
  }
}
