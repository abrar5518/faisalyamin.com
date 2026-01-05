import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/customerAuth";

function statusLabel(status: string) {
  if (status === "DELIVERED") return "Delivered";
  if (status === "OUT_FOR_DELIVERY") return "Out for Delivery";
  if (status === "SHIPPED") return "Shipped";
  if (status === "READY_TO_SHIP") return "Ready to Ship";
  if (status === "PROCESSING") return "Processing";
  if (status === "CONFIRMED") return "Confirmed";
  if (status === "PAID") return "Paid (Legacy)"; // Show exact status
  if (status === "CANCELLED") return "Cancelled";
  if (status === "REFUNDED") return "Refunded";
  return "Pending";
}

export async function GET(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  // Find customer by email (Customer table has separate IDs from User table)
  const customer = await prisma.customer.findFirst({
    where: { email: auth.user.email },
  });

  if (!customer) {
    return NextResponse.json({ ok: true, data: [] });
  }

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const data = orders.map((order) => ({
    id: order.id,
    createdAt: order.createdAt,
    status: statusLabel(order.status),
    total: Number(order.total),
    itemsCount: order.items.reduce((sum, it) => sum + it.qty, 0),
    destination: [customer.city, customer.country].filter(Boolean).join(", "),
  }));

  return NextResponse.json({ ok: true, data });
}
