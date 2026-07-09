import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/customerAuth";
import { getLoyaltySettings, clampRedeem, computeEarnedPoints } from "@/lib/loyalty";
import { validateCoupon } from "@/lib/coupons";

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
  printText: z.string().max(500).optional(),
  printFileUrl: z.string().max(2000).optional(),
  printFileName: z.string().max(255).optional(),
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
  couponCode: z.string().optional(),
  redeemPoints: z.number().int().nonnegative().optional(),
});


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
        printText: it.printText?.trim() || undefined,
        printFileUrl: it.printFileUrl?.trim() || undefined,
        printFileName: it.printFileName?.trim() || undefined,
      };
    });

    if (unresolved.length) {
      return NextResponse.json(
        { ok: false, error: `Products not found: ${unresolved.join(", ")}` },
        { status: 400 }
      );
    }

    const subtotal = payload.items.reduce((sum, it) => sum + it.price * it.qty, 0);
    const shipping = subtotal > 0 ? 250 : 0;
    let discount = 0;
    let normalizedCoupon: string | null = null;
    let couponDiscountForLoyalty = 0;
    let loyaltyDiscount = 0;
    let loyaltyPointsRedeemed = 0;
    let loyaltyPointsEarned = 0;

    if (payload.couponCode) {
      const validation = await validateCoupon({
        code: payload.couponCode,
        subtotal,
        shipping,
        customerEmail: payload.customer.email,
      });

      if (!validation.ok || !validation.coupon) {
        return NextResponse.json(
          { ok: false, error: validation.error || "Invalid coupon." },
          { status: 400 }
        );
      }

      discount = validation.discount;
      couponDiscountForLoyalty = validation.freeShippingApplied ? 0 : discount;
      normalizedCoupon = validation.code ?? validation.coupon.code;
    }

    const loyaltySettings = await getLoyaltySettings();
    const isLoggedIn = Boolean(loggedInUserId);
    if (payload.redeemPoints && payload.redeemPoints > 0) {
      if (!isLoggedIn) {
        return NextResponse.json(
          { ok: false, error: "Login required to redeem points." },
          { status: 401 }
        );
      }
      if (!payload.customer.email) {
        return NextResponse.json({ ok: false, error: "Email required for redemption." }, { status: 400 });
      }
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: payload.customer.email },
      });
      const availablePoints = existingCustomer?.loyaltyPoints ?? 0;
      const redeem = clampRedeem({
        requestedPoints: payload.redeemPoints,
        availablePoints,
        subtotal: Math.max(0, subtotal - couponDiscountForLoyalty),
        rule: loyaltySettings,
      });
      if (redeem.redeemPoints <= 0) {
        return NextResponse.json({ ok: false, error: "Not enough points to redeem." }, { status: 400 });
      }
      loyaltyPointsRedeemed = redeem.redeemPoints;
      loyaltyDiscount = redeem.redeemValue;
    }

    const netSubtotal = Math.max(0, subtotal - couponDiscountForLoyalty - loyaltyDiscount);
    loyaltyPointsEarned = computeEarnedPoints(netSubtotal, loyaltySettings);
    const total = Math.max(0, subtotal + shipping - discount - loyaltyDiscount);

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

    const order = await prisma.$transaction(async (tx) => {
      if (normalizedCoupon) {
        await tx.coupon.update({
          where: { code: normalizedCoupon },
          data: { usedCount: { increment: 1 } },
        });
      }

      if (payload.customer.email && loyaltySettings.enabled) {
        const deltaPoints = loyaltyPointsEarned - loyaltyPointsRedeemed;
        if (deltaPoints !== 0) {
          await tx.customer.update({
            where: { email: payload.customer.email },
            data: { loyaltyPoints: { increment: deltaPoints } },
          });
        }
      }

      return tx.order.create({
        data: {
          customerId: customer.id,
          status: "PENDING",
          subtotal,
          shipping,
          discount,
          loyaltyDiscount,
          loyaltyPointsRedeemed,
          loyaltyPointsEarned,
          total,
          paymentMethod: "cod",
          couponCode: normalizedCoupon ?? undefined,
          items: {
            create: items.map((it) => ({
              productId: it.productId,
              qty: it.qty,
              priceAtPurchase: it.priceAtPurchase,
              variantLabel: it.variantLabel,
              sizeLabel: it.sizeLabel,
              printText: it.printText,
              printFileUrl: it.printFileUrl,
              printFileName: it.printFileName,
            })),
          },
        },
        select: { id: true },
      });
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
