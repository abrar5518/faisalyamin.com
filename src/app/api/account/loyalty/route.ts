import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/customerAuth";
import { getLoyaltySettings, computeRedeemablePoints } from "@/lib/loyalty";

export async function GET(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const user = auth.user;
    const customer = user?.email
      ? await prisma.customer.findUnique({ where: { email: user.email } })
      : null;

    const points = customer?.loyaltyPoints ?? 0;
    const settings = await getLoyaltySettings();

    return NextResponse.json({
      ok: true,
      data: {
        points,
        settings,
        maxRedeemPoints: computeRedeemablePoints({
          availablePoints: points,
          subtotal: 0,
          rule: settings,
        }),
      },
    });
  } catch (err) {
    console.error("GET /api/account/loyalty error:", err);
    return NextResponse.json({ ok: false, error: "Failed to load loyalty data" }, { status: 500 });
  }
}
