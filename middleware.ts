import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const unlocked = req.cookies.get("app_unlocked")?.value === "1";
  const { pathname } = req.nextUrl;

  // Cho phép trang login và API auth đi qua
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Nếu chưa unlock thì redirect về login
  if (!unlocked) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
