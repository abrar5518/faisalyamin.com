import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SESSION_COOKIE = "customer_session";
const SESSION_DAYS = 30;

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const test = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(hash), Buffer.from(test));
}

function getExpiryDate() {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);
  return expires;
}

async function createSession(userId: number, req: NextRequest) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = getExpiryDate();
  const userAgent = req.headers.get("user-agent") ?? null;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;

  const prismaAny = prisma as any;
  const session = await prismaAny.session.create({
    data: {
      userId,
      token,
      userAgent,
      ip,
      expiresAt,
    },
    select: { id: true, token: true, expiresAt: true },
  });

  return session;
}

function setSessionCookie(res: NextResponse, token: string, expiresAt: Date) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    secure: process.env.NODE_ENV === "production",
  });
}

function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

async function getSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const prismaAny = prisma as any;
  const session = await prismaAny.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    await prismaAny.session.delete({ where: { id: session.id } });
    return null;
  }

  await prismaAny.session.update({
    where: { id: session.id },
    data: { lastActive: new Date() },
  });

  return session;
}

async function requireCustomer(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.user) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }
  return { ok: true as const, user: session.user, session };
}

export {
  SESSION_COOKIE,
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  clearSessionCookie,
  getSession,
  requireCustomer,
};
