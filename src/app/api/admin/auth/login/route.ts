import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { scryptSync, timingSafeEqual } from "crypto";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
});

function verifyPassword(password: string, stored: string) {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const test = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(hash), Buffer.from(test));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, email: true, passwordHash: true, role: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    if (!verifyPassword(data.password, user.passwordHash)) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    const token = process.env.ADMIN_TOKEN || "";
    if (!token) {
      return NextResponse.json({ ok: false, error: "ADMIN_TOKEN not configured" }, { status: 500 });
    }

    const res = NextResponse.json({ ok: true, token, data: { email: user.email } });
    res.cookies.set("admin_access_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return res;
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    console.error("POST /api/admin/auth/login error:", err);
    return NextResponse.json({ ok: false, error: "Login failed" }, { status: 500 });
  }
}
