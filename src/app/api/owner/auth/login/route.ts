import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const LoginSchema = z.object({
  token: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = LoginSchema.parse(body);

    const expected = process.env.OWNER_TOKEN || "";
    if (!expected) {
      return NextResponse.json({ ok: false, error: "OWNER_TOKEN not configured" }, { status: 500 });
    }

    if (data.token !== expected) {
      return NextResponse.json({ ok: false, error: "Invalid owner token" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("owner_access_token", expected, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return res;
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    console.error("POST /api/owner/auth/login error:", err);
    return NextResponse.json({ ok: false, error: "Login failed" }, { status: 500 });
  }
}
