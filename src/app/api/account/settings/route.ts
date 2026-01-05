import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/customerAuth";

const SettingsSchema = z.object({
  emailOffers: z.boolean(),
  emailOrderUpdates: z.boolean(),
  whatsappUpdates: z.boolean(),
  currency: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const prismaAny = prisma as any;
  const settings = await prismaAny.userSettings.findUnique({
    where: { userId: auth.user.id },
  });

  return NextResponse.json({ ok: true, data: settings });
}

export async function PUT(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = SettingsSchema.parse(body);

    const prismaAny = prisma as any;
    const settings = await prismaAny.userSettings.upsert({
      where: { userId: auth.user.id },
      create: {
        userId: auth.user.id,
        emailOffers: data.emailOffers,
        emailOrderUpdates: data.emailOrderUpdates,
        whatsappUpdates: data.whatsappUpdates,
        currency: data.currency ?? null,
        language: data.language ?? null,
        timezone: data.timezone ?? null,
      },
      update: {
        emailOffers: data.emailOffers,
        emailOrderUpdates: data.emailOrderUpdates,
        whatsappUpdates: data.whatsappUpdates,
        currency: data.currency ?? null,
        language: data.language ?? null,
        timezone: data.timezone ?? null,
      },
    });

    return NextResponse.json({ ok: true, data: settings });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    console.error("PUT /api/account/settings error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update settings" }, { status: 500 });
  }
}
