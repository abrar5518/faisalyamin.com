import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

function formatMoney(value: number) {
  return `PKR ${value.toLocaleString("en-PK")}`;
}

function mapPaymentStatus(status: string) {
  if (status === "CONFIRMED" || status === "PROCESSING" || status === "READY_TO_SHIP" || status === "SHIPPED" || status === "OUT_FOR_DELIVERY" || status === "DELIVERED") return "paid";
  if (status === "CANCELLED" || status === "REFUNDED") return "failed";
  return "pending";
}

function mapFulfillment(status: string) {
  if (status === "DELIVERED") return "delivered";
  if (status === "SHIPPED" || status === "OUT_FOR_DELIVERY") return "shipped";
  if (status === "CANCELLED" || status === "REFUNDED") return "cancelled";
  if (status === "CONFIRMED" || status === "PROCESSING" || status === "READY_TO_SHIP") return "processing";
  return "unfulfilled";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ ok: false, error: "Invalid order id" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    const data = {
      id: String(order.id),
      createdAt: order.createdAt.toISOString().slice(0, 10),
      status: order.status,
      trackingId: order.trackingId ?? undefined,
      courierName: order.courierName ?? undefined,
      estimatedDelivery: order.estimatedDelivery?.toISOString().slice(0, 10) ?? undefined,
      deliveredAt: order.deliveredAt?.toISOString().slice(0, 10) ?? undefined,
      adminNotes: order.adminNotes ?? undefined,
      customer: {
        name: order.customer?.name ?? "Guest",
        email: order.customer?.email ?? undefined,
        phone: order.customer?.phone ?? undefined,
      },
      shippingAddress: {
        line1: order.customer?.address1 ?? "",
        line2: order.customer?.address2 ?? undefined,
        city: order.customer?.city ?? "",
        province: order.customer?.state ?? undefined,
        country: order.customer?.country ?? "",
        postalCode: order.customer?.postal ?? undefined,
      },
      paymentStatus: mapPaymentStatus(order.status),
      fulfillment: mapFulfillment(order.status),
      totals: {
        subtotal: formatMoney(Number(order.subtotal)),
        shipping: formatMoney(Number(order.shipping)),
        discount: formatMoney(0),
        total: formatMoney(Number(order.subtotal) + Number(order.shipping)),
      },
      items: order.items.map((it) => {
        const img = it.product.images?.[0]?.url ?? "";
        return {
          productId: String(it.productId),
          name: it.product.name,
          price: formatMoney(Number(it.priceAtPurchase)),
          qty: it.qty,
          image: img,
          isDropship: false,
          variantLabel: it.variantLabel ?? undefined,
          sizeLabel: it.sizeLabel ?? undefined,
          printText: it.printText ?? undefined,
          printFileUrl: it.printFileUrl ?? undefined,
          printFileName: it.printFileName ?? undefined,
        };
      }),
    };

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("GET /api/admin/orders/:id error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch order" }, { status: 500 });
  }
}

// Support both old and new statuses during migration
const STATUS_VALUES = [
  "PENDING",
  "PAID",           // Old status - will be migrated
  "CONFIRMED",
  "PROCESSING",
  "READY_TO_SHIP",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ ok: false, error: "Invalid order id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const status = String(body?.status || "").toUpperCase();
    
    // Validate status if provided
    if (body?.status && !STATUS_VALUES.includes(status as typeof STATUS_VALUES[number])) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }

    // Build update data
    const updateData: any = {};
    if (body?.status) updateData.status = status;
    if (body?.trackingId !== undefined) updateData.trackingId = body.trackingId || null;
    if (body?.courierName !== undefined) updateData.courierName = body.courierName || null;
    if (body?.estimatedDelivery !== undefined) {
      updateData.estimatedDelivery = body.estimatedDelivery ? new Date(body.estimatedDelivery) : null;
    }
    if (body?.adminNotes !== undefined) updateData.adminNotes = body.adminNotes || null;
    
    // Auto-set deliveredAt when status changes to DELIVERED
    if (status === "DELIVERED" && !body?.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      select: { 
        id: true, 
        status: true, 
        trackingId: true, 
        courierName: true, 
        estimatedDelivery: true,
        deliveredAt: true,
        adminNotes: true,
      },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    console.error("PATCH /api/admin/orders/:id error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update order" }, { status: 500 });
  }
}
