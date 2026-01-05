import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { z } from "zod";

const SiteSettingsSchema = z.object({
  siteName: z.string().optional().nullable(),
  siteUrl: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  logoAlt: z.string().optional().nullable(),
  siteIconUrl: z.string().optional().nullable(),
  siteIconAlt: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const settings = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
    return NextResponse.json({ ok: true, data: settings });
  } catch (err) {
    console.error("GET /api/admin/site-settings error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch site settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = SiteSettingsSchema.parse(body);

    const existing = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
    const updated = existing
      ? await prisma.siteSettings.update({
          where: { id: existing.id },
          data,
        })
      : await prisma.siteSettings.create({ data });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    console.error("PUT /api/admin/site-settings error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update site settings" }, { status: 500 });
  }
}
