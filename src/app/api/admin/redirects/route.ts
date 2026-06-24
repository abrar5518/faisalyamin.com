import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { normalizeRedirectDestination, normalizeRedirectSource } from "@/lib/redirects";

const RedirectSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
  permanent: z.boolean().optional(),
  isActive: z.boolean().optional(),
  note: z.string().optional().nullable(),
});

function cleanRedirectPayload(body: unknown) {
  const data = RedirectSchema.parse(body);
  const source = normalizeRedirectSource(data.source);
  const destination = normalizeRedirectDestination(data.destination);

  if (!source || source === "/") {
    throw new Error("Source must be a specific path, not the homepage.");
  }
  if (!destination) {
    throw new Error("Destination is required.");
  }
  if (source === destination) {
    throw new Error("Source and destination cannot be the same.");
  }

  return {
    source,
    destination,
    permanent: data.permanent ?? true,
    isActive: data.isActive ?? true,
    note: data.note?.trim() || null,
  };
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const redirects = await prisma.redirectRule.findMany({
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    });
    return NextResponse.json({ ok: true, data: redirects });
  } catch (err) {
    console.error("GET /api/admin/redirects error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch redirects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const data = cleanRedirectPayload(await req.json());
    const created = await prisma.redirectRule.create({ data });
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "A redirect with this source already exists." }, { status: 409 });
    }
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || "Failed to create redirect" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid redirect id" }, { status: 400 });
    }

    const data = cleanRedirectPayload(await req.json());
    const updated = await prisma.redirectRule.update({ where: { id }, data });
    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "A redirect with this source already exists." }, { status: 409 });
    }
    if (err?.code === "P2025") {
      return NextResponse.json({ ok: false, error: "Redirect not found" }, { status: 404 });
    }
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || "Failed to update redirect" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid redirect id" }, { status: 400 });
    }

    await prisma.redirectRule.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ ok: false, error: "Redirect not found" }, { status: 404 });
    }
    console.error("DELETE /api/admin/redirects error:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete redirect" }, { status: 500 });
  }
}
