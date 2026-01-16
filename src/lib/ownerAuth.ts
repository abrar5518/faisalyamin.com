import { NextRequest } from "next/server";

export function requireOwner(req: NextRequest) {
  const token =
    req.headers.get("x-owner-token") ||
    req.cookies.get("owner_access_token")?.value;
  const expected = process.env.OWNER_TOKEN || "";

  if (!token || !expected || token !== expected) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }

  return { ok: true as const };
}
