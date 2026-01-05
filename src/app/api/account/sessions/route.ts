import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/customerAuth";

export async function GET(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const prismaAny = prisma as any;
  const sessions = await prismaAny.session.findMany({
    where: { userId: auth.user.id },
    orderBy: { lastActive: "desc" },
  });

  const data = sessions.map((s: any) => ({
    id: s.id,
    userAgent: s.userAgent,
    ip: s.ip,
    lastActive: s.lastActive,
    createdAt: s.createdAt,
    current: s.id === auth.session.id,
  }));

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const prismaAny = prisma as any;

    if (body?.allOthers) {
      await prismaAny.session.deleteMany({
        where: { userId: auth.user.id, id: { not: auth.session.id } },
      });
      return NextResponse.json({ ok: true });
    }

    const id = Number(body?.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ ok: false, error: "Session id required" }, { status: 400 });
    }

    await prismaAny.session.deleteMany({
      where: { id, userId: auth.user.id },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/account/sessions error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update sessions" }, { status: 500 });
  }
}
