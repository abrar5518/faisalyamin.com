import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateCoupon } from "@/lib/coupons";

const CouponValidateSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  customerEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const payload = CouponValidateSchema.parse(await req.json());
    const result = await validateCoupon({
      code: payload.code,
      subtotal: payload.subtotal,
      shipping: payload.shipping,
      customerEmail: payload.customerEmail,
    });

    if (!result.ok || !result.coupon) {
      return NextResponse.json(
        { ok: false, error: result.error || "Invalid coupon." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        code: result.code,
        description: result.coupon.description,
        type: result.coupon.type,
        value: Number(result.coupon.value),
        discount: result.discount,
        minSubtotal: result.coupon.minSubtotal ? Number(result.coupon.minSubtotal) : null,
        maxDiscount: result.coupon.maxDiscount ? Number(result.coupon.maxDiscount) : null,
        freeShippingApplied: result.freeShippingApplied ?? false,
      },
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    console.error("POST /api/coupons/validate error:", err);
    return NextResponse.json({ ok: false, error: "Failed to validate coupon." }, { status: 500 });
  }
}
