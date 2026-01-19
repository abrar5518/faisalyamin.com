import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const STATE_COOKIE = "google_oauth_state";
const STATE_MAX_AGE = 60 * 5;

function normalizeBaseUrl(req: NextRequest) {
  const raw = process.env.SITE_URL?.trim();
  if (raw && process.env.NODE_ENV === "production") {
    return raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`;
  }
  return req.nextUrl.origin;
}

function encodeState(payload: { state: string; next: string }) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export async function GET(req: NextRequest) {
  const baseUrl = normalizeBaseUrl(req);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", baseUrl));
  }

  const nextParam = req.nextUrl.searchParams.get("next") || "/account";
  const nextPath = nextParam.startsWith("/") ? nextParam : "/account";

  const state = randomBytes(16).toString("hex");
  const statePayload = encodeState({ state, next: nextPath });

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", `${baseUrl}/api/auth/google/callback`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(STATE_COOKIE, statePayload, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: STATE_MAX_AGE,
  });
  return res;
}
