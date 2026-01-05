import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { z } from "zod";

const StoreSettingsSchema = z.object({
  storeName: z.string().optional().nullable(),
  storeDomain: z.string().optional().nullable(),
  freeShippingThreshold: z.string().optional().nullable(),
  defaultShippingFee: z.string().optional().nullable(),
  returnsDays: z.number().int().min(0).optional().nullable(),
  codEnabled: z.boolean().optional(),
  cardEnabled: z.boolean().optional(),
  gatewayName: z.string().optional().nullable(),
  cryptoEnabled: z.boolean().optional(),
  siteTitle: z.string().optional().nullable(),
  siteMetaDesc: z.string().optional().nullable(),
  indexable: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const settings = await prisma.storeSettings.findFirst({ orderBy: { id: "asc" } });
    return NextResponse.json({ ok: true, data: settings });
  } catch (err) {
    console.error("GET /api/admin/store-settings error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch store settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = StoreSettingsSchema.parse(body);

    const existing = await prisma.storeSettings.findFirst({ orderBy: { id: "asc" } });
    const updated = existing
      ? await prisma.storeSettings.update({
          where: { id: existing.id },
          data,
        })
      : await prisma.storeSettings.create({ data });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    console.error("PUT /api/admin/store-settings error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update store settings" }, { status: 500 });
  }
}
