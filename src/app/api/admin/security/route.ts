import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";
import { randomBytes, scryptSync } from "crypto";

const UpdateSecuritySchema = z.object({
  currentEmail: z.string().email(),
  name: z.string().min(2).optional(),
  newEmail: z.string().email().optional(),
  newPassword: z.string().min(4).optional(),
});

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = UpdateSecuritySchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.currentEmail },
      select: { id: true },
    });

    if (!user) {
      if (!data.newPassword) {
        return NextResponse.json(
          { ok: false, error: "New password required to create admin user" },
          { status: 400 }
        );
      }

      const created = await prisma.user.create({
        data: {
          name: data.name ?? "Admin",
          email: data.newEmail ?? data.currentEmail,
          passwordHash: hashPassword(data.newPassword),
          role: "ADMIN",
        },
        select: { id: true, name: true, email: true },
      });

      return NextResponse.json({ ok: true, data: created }, { status: 201 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        email: data.newEmail,
        passwordHash: data.newPassword ? hashPassword(data.newPassword) : undefined,
      },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    if (err?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 409 });
    }

    console.error("PUT /api/admin/security error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update admin security" }, { status: 500 });
  }
}
