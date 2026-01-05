import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/customerAuth";

export async function GET(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const prismaAny = prisma as any;
  const user = await prismaAny.user.findUnique({
    where: { id: auth.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      profile: true,
      settings: true,
    },
  });

  return NextResponse.json({
    ok: true,
    data: user,
  });
}
