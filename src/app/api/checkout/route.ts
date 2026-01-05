import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/customerAuth";

const ItemSchema = z.object({
  id: z.string().min(1),
  productId: z.number().int().optional(),
  slug: z.string().optional(),
  href: z.string().optional(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  qty: z.number().int().min(1),
  variantLabel: z.string().optional(),
  sizeLabel: z.string().optional(),
});

const CheckoutSchema = z.object({
  customer: z.object({
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().min(3),
  }),
  address: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    country: z.string().min(1),
    postalCode: z.string().optional(),
  }),
  shippingMethod: z.enum(["standard", "express"]),
  paymentMethod: z.literal("cod"),
  items: z.array(ItemSchema).min(1),
});

function parseMoney(value: string | number | null | undefined, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value) return fallback;
  const cleaned = String(value).replace(/[^0-9.]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : fallback;
}

function deriveSlug(item: z.infer<typeof ItemSchema>) {
  if (item.slug) return item.slug;
  if (item.href) {
    const match = item.href.match(/\/product\/([^/?#]+)/);
    if (match) return match[1];
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  try {
    const payload = CheckoutSchema.parse(await req.json());
    
    // Check if user is logged in
    const session = await getSession(req);
    const loggedInUserId = session?.user?.id;

    const slugs = payload.items
      .map((it) => deriveSlug(it))
      .filter((s): s is string => Boolean(s));

    const productsBySlug = slugs.length
      ? await prisma.product.findMany({
          where: { slug: { in: slugs } },
          select: { id: true, slug: true },
        })
      : [];

    const slugMap = new Map(productsBySlug.map((p) => [p.slug, p.id]));

    const unresolved: string[] = [];
    const items = payload.items.map((it) => {
      const productId = it.productId ?? (deriveSlug(it) ? slugMap.get(deriveSlug(it)!) : undefined);
      if (!productId) unresolved.push(it.id);
      return {
        productId: productId ?? 0,
        qty: it.qty,
        priceAtPurchase: it.price,
        variantLabel: it.variantLabel,
        sizeLabel: it.sizeLabel,
      };
    });

    if (unresolved.length) {
      return NextResponse.json(
        { ok: false, error: `Products not found: ${unresolved.join(", ")}` },
        { status: 400 }
      );
    }

    const subtotal = payload.items.reduce((sum, it) => sum + it.price * it.qty, 0);
    const storeSettings = await prisma.storeSettings.findFirst({ orderBy: { id: "asc" } });
    const freeShippingThreshold = parseMoney(storeSettings?.freeShippingThreshold, 1000);
    const defaultShippingFee = parseMoney(storeSettings?.defaultShippingFee, 500);
    const shipping = subtotal >= freeShippingThreshold ? 0 : defaultShippingFee;
    const total = Math.max(0, subtotal + shipping);

    const fullName = [payload.customer.firstName, payload.customer.lastName]
      .filter((x) => (x ?? "").trim().length > 0)
      .join(" ")
      .trim();

    // Create or update customer record
    // Always use email-based lookup since Customer table has separate IDs
    const customer = payload.customer.email
      ? await prisma.customer.upsert({
          where: { email: payload.customer.email },
          update: {
            name: fullName,
            phone: payload.customer.phone,
            address1: payload.address.line1,
            address2: payload.address.line2,
            city: payload.address.city,
            country: payload.address.country,
            postal: payload.address.postalCode,
          },
          create: {
            name: fullName,
            email: payload.customer.email,
            phone: payload.customer.phone,
            address1: payload.address.line1,
            address2: payload.address.line2,
            city: payload.address.city,
            country: payload.address.country,
            postal: payload.address.postalCode,
          },
        })
      : await prisma.customer.create({
          data: {
            name: fullName,
            phone: payload.customer.phone,
            address1: payload.address.line1,
            address2: payload.address.line2,
            city: payload.address.city,
            country: payload.address.country,
            postal: payload.address.postalCode,
          },
        });

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        status: "PENDING",
        subtotal,
        shipping,
        total,
        paymentMethod: "cod",
        items: {
          create: items.map((it) => ({
            productId: it.productId,
            qty: it.qty,
            priceAtPurchase: it.priceAtPurchase,
            variantLabel: it.variantLabel,
            sizeLabel: it.sizeLabel,
          })),
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, data: { orderId: String(order.id) } });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    console.error("POST /api/checkout error:", err);
    return NextResponse.json({ ok: false, error: "Checkout failed" }, { status: 500 });
  }
}
