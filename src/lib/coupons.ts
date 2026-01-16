import type { Coupon } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CouponValidationResult = {
  ok: boolean;
  error?: string;
  coupon?: Coupon;
  code?: string;
  discount: number;
  freeShippingApplied?: boolean;
};

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

function toNumber(value: any, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function computeDiscount(
  coupon: Coupon,
  subtotal: number,
  shipping: number
) {
  const value = toNumber(coupon.value, 0);
  const maxDiscount = coupon.maxDiscount ? toNumber(coupon.maxDiscount, 0) : null;

  if (coupon.type === "FREE_SHIPPING") {
    return { discount: Math.max(0, shipping), freeShippingApplied: shipping > 0 };
  }

  if (coupon.type === "FIXED") {
    const raw = Math.max(0, value);
    const capped = Math.min(raw, subtotal + shipping);
    return { discount: capped };
  }

  const percent = Math.max(0, value);
  const raw = Math.round(subtotal * (percent / 100));
  const capped = Math.min(raw, maxDiscount ?? raw, subtotal + shipping);
  return { discount: Math.max(0, capped) };
}

export async function validateCoupon(params: {
  code: string;
  subtotal: number;
  shipping: number;
  customerEmail?: string;
  now?: Date;
}): Promise<CouponValidationResult> {
  const code = normalizeCouponCode(params.code);
  if (!code) {
    return { ok: false, error: "Coupon code is required.", discount: 0 };
  }

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) {
    return { ok: false, error: "Coupon not found.", discount: 0 };
  }

  if (!coupon.isActive) {
    return { ok: false, error: "Coupon is disabled.", discount: 0 };
  }

  const now = params.now ?? new Date();
  if (coupon.startsAt && now < coupon.startsAt) {
    return { ok: false, error: "Coupon is not active yet.", discount: 0 };
  }
  if (coupon.endsAt && now > coupon.endsAt) {
    return { ok: false, error: "Coupon has expired.", discount: 0 };
  }

  const minSubtotal = coupon.minSubtotal ? toNumber(coupon.minSubtotal, 0) : null;
  if (minSubtotal !== null && params.subtotal < minSubtotal) {
    return {
      ok: false,
      error: `Minimum order is ${minSubtotal.toLocaleString("en-PK")}.`,
      discount: 0,
    };
  }

  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined) {
    if (coupon.usedCount >= coupon.usageLimit) {
      return { ok: false, error: "Coupon usage limit reached.", discount: 0 };
    }
  }

  if (coupon.perCustomerLimit && params.customerEmail) {
    const count = await prisma.order.count({
      where: {
        couponCode: coupon.code,
        customer: { email: params.customerEmail },
      },
    });
    if (count >= coupon.perCustomerLimit) {
      return { ok: false, error: "Coupon already used for this customer.", discount: 0 };
    }
  }

  const { discount, freeShippingApplied } = computeDiscount(
    coupon,
    params.subtotal,
    params.shipping
  );

  return {
    ok: true,
    coupon,
    code: coupon.code,
    discount,
    freeShippingApplied,
  };
}
