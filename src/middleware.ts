import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = "www.sahoolat.pk";
const ROOT_HOST = "sahoolat.pk";
const PRIVATE_PREFIXES = [
  "/admin",
  "/api",
  "/account",
  "/cart",
  "/checkout",
  "/login",
  "/logout",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/portal",
  "/search",
];

function withNoIndex(response: NextResponse) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export function middleware(req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = (forwardedHost || req.headers.get("host") || "").split(":")[0].toLowerCase();
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const protocol = (forwardedProto || req.nextUrl.protocol.replace(":", "")).toLowerCase();

  if ((host === ROOT_HOST || host === CANONICAL_HOST) && (host !== CANONICAL_HOST || protocol !== "https")) {
    const url = req.nextUrl.clone();
    url.protocol = "https";
    url.hostname = CANONICAL_HOST;
    return NextResponse.redirect(url, 301);
  }

  const { pathname } = req.nextUrl;
  const isPrivatePath = PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("admin_access_token")?.value;
    const expected = process.env.ADMIN_TOKEN || "";
    const isAuthed = !!token && !!expected && token === expected;

    if (pathname === "/admin/login") {
      if (isAuthed) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/dashboard";
        return withNoIndex(NextResponse.redirect(url));
      }
      return withNoIndex(NextResponse.next());
    }

    if (!isAuthed) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return withNoIndex(NextResponse.redirect(url));
    }

    return withNoIndex(NextResponse.next());
  }

  if (pathname.startsWith("/portal")) {
    const token = req.cookies.get("owner_access_token")?.value;
    const expected = process.env.OWNER_TOKEN || "";
    const isAuthed = !!token && !!expected && token === expected;

    if (pathname === "/portal/login") {
      if (isAuthed) {
        const url = req.nextUrl.clone();
        url.pathname = "/portal/dashboard";
        return withNoIndex(NextResponse.redirect(url));
      }
      return withNoIndex(NextResponse.next());
    }

    if (!isAuthed) {
      const url = req.nextUrl.clone();
      url.pathname = "/portal/login";
      return withNoIndex(NextResponse.redirect(url));
    }

    return withNoIndex(NextResponse.next());
  }

  return isPrivatePath ? withNoIndex(NextResponse.next()) : NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
