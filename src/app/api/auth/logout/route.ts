import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, SESSION_COOKIE } from "@/lib/customerAuth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    const prismaAny = prisma as any;
    await prismaAny.session.deleteMany({ where: { token } });
  }

  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
