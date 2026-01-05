import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const users = await prisma.user.findMany({
      where: { role: { in: ["CUSTOMER", "STAFF"] } },
      include: { profile: true },
      orderBy: { createdAt: "desc" },
    });

    const emails = users.map((u) => u.email).filter(Boolean);
    const customers = await prisma.customer.findMany({
      where: { email: { in: emails } },
      include: { orders: true },
    });

    const customerByEmail = new Map(customers.map((c) => [c.email ?? "", c]));

    const data = users.map((u) => {
      const customer = customerByEmail.get(u.email) ?? null;
      const orders = customer?.orders ?? [];
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
      const lastOrderAt = orders
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.createdAt;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.profile?.phone ?? customer?.phone ?? null,
        city: u.profile?.city ?? customer?.city ?? null,
        country: u.profile?.country ?? customer?.country ?? null,
        totalOrders,
        totalSpent,
        lastOrderAt,
        createdAt: u.createdAt,
      };
    });

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("GET /api/admin/customers error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch customers" }, { status: 500 });
  }
}
