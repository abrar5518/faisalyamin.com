import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, setSessionCookie } from "@/lib/customerAuth";

const SignupSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = SignupSchema.parse(body);
    const email = data.email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 409 });
    }

    const prismaAny = prisma as any;
    const user = await prismaAny.user.create({
      data: {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email,
        passwordHash: hashPassword(data.password),
        role: "CUSTOMER",
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        },
        settings: { create: {} },
      },
      select: { id: true, email: true, name: true },
    });

    const session = await createSession(user.id, req);
    const res = NextResponse.json({ ok: true, data: user });
    setSessionCookie(res, session.token, session.expiresAt);
    return res;
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    if (err?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 409 });
    }

    console.error("POST /api/auth/signup error:", err);
    return NextResponse.json({ ok: false, error: "Signup failed" }, { status: 500 });
  }
}
