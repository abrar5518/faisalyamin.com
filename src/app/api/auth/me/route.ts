import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/customerAuth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session?.user) {
      return NextResponse.json({ ok: false, user: null }, { status: 200 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        phone: session.user.phone,
      },
    });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json({ ok: false, user: null }, { status: 500 });
  }
}
