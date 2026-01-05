import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  setSessionCookie,
  verifyPassword,
} from "@/lib/customerAuth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      select: { id: true, email: true, name: true, passwordHash: true, role: true },
    });

    if (!user || !verifyPassword(data.password, user.passwordHash)) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    if (user.role !== "CUSTOMER") {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    const session = await createSession(user.id, req);
    const res = NextResponse.json({ ok: true, data: { id: user.id, email: user.email, name: user.name } });
    setSessionCookie(res, session.token, session.expiresAt);
    return res;
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    console.error("POST /api/auth/login error:", err);
    return NextResponse.json({ ok: false, error: "Login failed" }, { status: 500 });
  }
}
