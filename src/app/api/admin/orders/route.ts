import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

function formatMoney(value: number) {
  return `PKR ${value.toLocaleString("en-PK")}`;
}

function mapPaymentStatus(status: string) {
  if (status === "PAID") return "paid";
  if (status === "CANCELLED") return "failed";
  return "pending";
}

function mapFulfillment(status: string) {
  if (status === "SHIPPED") return "shipped";
  if (status === "CANCELLED") return "cancelled";
  return "unfulfilled";
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const rows = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: true,
      },
    });

    const data = rows.map((o) => ({
      id: String(o.id),
      createdAt: o.createdAt.toISOString().slice(0, 10),
      customerName: o.customer?.name ?? "Guest",
      customerPhone: o.customer?.phone ?? undefined,
      total: formatMoney(Number(o.subtotal) + Number(o.shipping)),
      paymentStatus: mapPaymentStatus(o.status),
      fulfillment: mapFulfillment(o.status),
      itemsCount: o.items.length,
    }));

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("GET /api/admin/orders error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}
