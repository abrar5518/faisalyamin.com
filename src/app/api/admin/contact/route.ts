import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { z } from "zod";

const ContactSchema = z.object({
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  hoursWeekdays: z.string().optional(),
  hoursWeekend: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const contact = await prisma.contact.findFirst({ orderBy: { id: "asc" } });
    return NextResponse.json({ ok: true, data: contact });
  } catch (err) {
    console.error("GET /api/admin/contact error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch contact" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = ContactSchema.parse(body);

    const existing = await prisma.contact.findFirst({ orderBy: { id: "asc" } });
    const updated = existing
      ? await prisma.contact.update({
          where: { id: existing.id },
          data,
        })
      : await prisma.contact.create({ data });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    console.error("PUT /api/admin/contact error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update contact" }, { status: 500 });
  }
}
