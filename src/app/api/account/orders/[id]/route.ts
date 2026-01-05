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

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await ctx.params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId)) {
    return NextResponse.json({ ok: false, error: "Invalid order id" }, { status: 400 });
  }

  // Find customer by email (Customer table has separate IDs from User table)
  const customer = await prisma.customer.findFirst({
    where: { email: auth.user.email },
  });

  if (!customer) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId: customer.id },
    include: {
      items: {
        include: {
          product: {
            include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }

  const items = order.items.map((item) => ({
    id: item.productId,
    name: item.product.name,
    image: item.product.images[0]?.url ?? "",
    qty: item.qty,
    price: Number(item.priceAtPurchase),
    slug: item.product.slug,
  }));

  const data = {
    id: order.id,
    createdAt: order.createdAt,
    status: statusLabel(order.status),
    statusRaw: order.status,
    trackingId: order.trackingId ?? undefined,
    courierName: order.courierName ?? undefined,
    estimatedDelivery: order.estimatedDelivery?.toISOString().slice(0, 10) ?? undefined,
    deliveredAt: order.deliveredAt?.toISOString() ?? undefined,
    adminNotes: order.adminNotes ?? undefined,
    paymentMethod: order.paymentMethod ?? "Cash on delivery",
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    total: Number(order.total),
    items,
    customer: {
      name: customer.name,
      phone: customer.phone,
      address1: customer.address1,
      address2: customer.address2,
      city: customer.city,
      country: customer.country,
    },
  };

  return NextResponse.json({ ok: true, data });
}
