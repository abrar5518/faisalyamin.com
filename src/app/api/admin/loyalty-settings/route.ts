import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { normalizeSettings } from "@/lib/loyalty";

const LoyaltySettingsSchema = z.object({
  enabled: z.boolean().optional(),
  pointsPerCurrency: z.number().nonnegative().optional(),
  currencyPerPoint: z.number().nonnegative().optional(),
  minRedeemPoints: z.number().int().nonnegative().optional(),
  maxRedeemPercent: z.number().int().min(0).max(100).optional(),
});

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const settings = await prisma.loyaltySettings.findFirst({ orderBy: { id: "asc" } });
    return NextResponse.json({ ok: true, data: settings ? normalizeSettings(settings) : null });
  } catch (err) {
    console.error("GET /api/admin/loyalty-settings error:", err);
    return NextResponse.json({ ok: false, error: "Failed to load loyalty settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const payload = LoyaltySettingsSchema.parse(await req.json());
    const existing = await prisma.loyaltySettings.findFirst({ orderBy: { id: "asc" } });

    const data = {
      enabled: payload.enabled ?? existing?.enabled ?? true,
      pointsPerCurrency: payload.pointsPerCurrency ?? existing?.pointsPerCurrency ?? 0.01,
      currencyPerPoint: payload.currencyPerPoint ?? existing?.currencyPerPoint ?? 0.05,
      minRedeemPoints: payload.minRedeemPoints ?? existing?.minRedeemPoints ?? 100,
      maxRedeemPercent: payload.maxRedeemPercent ?? existing?.maxRedeemPercent ?? 50,
    };

    const saved = existing
      ? await prisma.loyaltySettings.update({ where: { id: existing.id }, data })
      : await prisma.loyaltySettings.create({ data });

    return NextResponse.json({ ok: true, data: normalizeSettings(saved) });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    console.error("PUT /api/admin/loyalty-settings error:", err);
    return NextResponse.json({ ok: false, error: "Failed to save loyalty settings" }, { status: 500 });
  }
}
