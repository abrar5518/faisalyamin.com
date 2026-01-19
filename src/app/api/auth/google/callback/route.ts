import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  hashPassword,
  setSessionCookie,
} from "@/lib/customerAuth";

const STATE_COOKIE = "google_oauth_state";

function normalizeBaseUrl(req: NextRequest) {
  const raw = process.env.SITE_URL?.trim();
  if (raw && process.env.NODE_ENV === "production") {
    return raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`;
  }
  return req.nextUrl.origin;
}

function decodeState(value: string | undefined) {
  if (!value) return null;
  try {
    const json = Buffer.from(value, "base64url").toString("utf8");
    return JSON.parse(json) as { state?: string; next?: string };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const baseUrl = normalizeBaseUrl(req);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", baseUrl));
  }

  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieValue = req.cookies.get(STATE_COOKIE)?.value;
  const statePayload = decodeState(cookieValue);

  if (!code || !state || !statePayload?.state || statePayload.state !== state) {
    const res = NextResponse.redirect(new URL("/login?error=oauth_state", baseUrl));
    res.cookies.set(STATE_COOKIE, "", { path: "/", expires: new Date(0) });
    return res;
  }

  const nextPath = statePayload.next && statePayload.next.startsWith("/")
    ? statePayload.next
    : "/account";

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }).toString(),
    });

    const token = await tokenRes.json();
    if (!tokenRes.ok || !token.access_token) {
      throw new Error("token_exchange_failed");
    }

    const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const profile = await profileRes.json();

    if (!profileRes.ok || !profile.email) {
      throw new Error("profile_fetch_failed");
    }

    const email = String(profile.email).toLowerCase();
    const name = profile.name || email.split("@")[0] || "Customer";

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, name: true },
    });

    if (existing && existing.role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/login?error=oauth_role", baseUrl));
    }

    const user = existing
      ? existing
      : await prisma.user.create({
          data: {
            name,
            email,
            role: "CUSTOMER",
            passwordHash: hashPassword(randomBytes(32).toString("hex")),
          },
        });

    const session = await createSession(user.id, req);
    const res = NextResponse.redirect(new URL(nextPath, baseUrl));
    setSessionCookie(res, session.token, session.expiresAt);
    res.cookies.set(STATE_COOKIE, "", { path: "/", expires: new Date(0) });
    return res;
  } catch (err) {
    console.error("GET /api/auth/google/callback error:", err);
    const res = NextResponse.redirect(new URL("/login?error=oauth_failed", baseUrl));
    res.cookies.set(STATE_COOKIE, "", { path: "/", expires: new Date(0) });
    return res;
  }
}
