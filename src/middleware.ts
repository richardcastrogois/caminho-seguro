import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/api/auth/login",
  "/api/auth/demo-login",
  "/api/auth/logout",
  "/api/public",
  "/api/health",
  "/api/institutions",
  "/_next",
  "/favicon.ico",
];

/**
 * Essas rotas administrativas não usam o JWT comum da aplicação.
 * Elas possuem autenticação própria por meio do header:
 *
 * x-blockchain-admin-secret
 */
const blockchainAdminPaths = [
  "/api/blockchain/faucet",
  "/api/blockchain/submit",
  "/api/blockchain/retry",
  "/api/blockchain/reconcile",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next();
  }

  const isBlockchainAdminPath = blockchainAdminPaths.some((path) => pathname === path);

  if (isBlockchainAdminPath && request.method === "POST") {
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
        {
          ok: false,
          error: "Token de autenticação necessário.",
        },
        {
          status: 401,
        },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
