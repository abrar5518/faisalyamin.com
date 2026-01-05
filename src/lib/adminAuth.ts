import { NextRequest } from "next/server";

export function requireAdmin(req: NextRequest) {
  const token =
    req.headers.get("x-admin-token") ||
    req.cookies.get("admin_access_token")?.value;

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }

  return { ok: true as const };
}
