import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("admin_access_token")?.value;
    const expected = process.env.ADMIN_TOKEN || "";
    const isAuthed = !!token && !!expected && token === expected;

    if (pathname === "/admin/login") {
      if (isAuthed) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/dashboard";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    if (!isAuthed) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/portal")) {
    const token = req.cookies.get("owner_access_token")?.value;
    const expected = process.env.OWNER_TOKEN || "";
    const isAuthed = !!token && !!expected && token === expected;

    if (pathname === "/portal/login") {
      if (isAuthed) {
        const url = req.nextUrl.clone();
        url.pathname = "/portal/dashboard";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    if (!isAuthed) {
      const url = req.nextUrl.clone();
      url.pathname = "/portal/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
