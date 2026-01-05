import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireCustomer, verifyPassword } from "@/lib/customerAuth";

const PasswordSchema = z.object({
  currentPassword: z.string().min(4),
  newPassword: z.string().min(6),
});

export async function PUT(req: NextRequest) {
  const auth = await requireCustomer(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = PasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { passwordHash: true },
    });

    if (!user || !verifyPassword(data.currentPassword, user.passwordHash)) {
      return NextResponse.json({ ok: false, error: "Incorrect current password" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: auth.user.id },
      data: { passwordHash: hashPassword(data.newPassword) },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    console.error("PUT /api/account/security/password error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update password" }, { status: 500 });
  }
}
