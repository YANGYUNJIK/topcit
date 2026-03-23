import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/teacher/login")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/teacher")) {
    const auth = request.cookies.get("teacher-auth")?.value;

    if (auth !== "ok") {
      return NextResponse.redirect(new URL("/teacher/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher/:path*"],
};
