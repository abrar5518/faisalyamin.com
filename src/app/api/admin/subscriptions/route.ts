import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
    });

    const data = subscribers.map((s) => ({
      id: s.id,
      email: s.email,
      name: s.name ?? null,
      source: s.source ?? null,
      ip: s.ip ?? null,
      userAgent: s.userAgent ?? null,
      isActive: s.isActive,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("GET /api/admin/subscriptions error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}
