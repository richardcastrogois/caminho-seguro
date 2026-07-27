import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/api/auth/login",
  "/api/public",
  "/api/health",
  "/api/institutions",
  "/_next",
  "/favicon.ico",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (isPublic) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/events") && request.method === "GET") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/blockchain") && request.method === "GET") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { ok: false, error: "Token de autenticação necessário" },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
