import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SubscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  source: z.string().optional(),
});

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null;
  }
  return req.headers.get("x-real-ip");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = SubscribeSchema.parse(body);
    const email = data.email.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
    }

    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent");

    const subscriber = await prisma.subscriber.upsert({
      where: { email },
      create: {
        email,
        name: data.name?.trim() || undefined,
        source: data.source?.trim() || "footer",
        ip: ip || undefined,
        userAgent: userAgent || undefined,
        isActive: true,
      },
      update: {
        name: data.name?.trim() || undefined,
        source: data.source?.trim() || undefined,
        ip: ip || undefined,
        userAgent: userAgent || undefined,
        isActive: true,
      },
    });

    return NextResponse.json({ ok: true, data: { id: subscriber.id, email: subscriber.email } });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    console.error("POST /api/subscriptions error:", err);
    return NextResponse.json({ ok: false, error: "Failed to subscribe" }, { status: 500 });
  }
}
