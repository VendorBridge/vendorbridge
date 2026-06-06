import { auth } from "@/lib/auth";
import { ROLE_REDIRECTS } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─────────────────────────────────────────────────────
// Route configuration
// ─────────────────────────────────────────────────────
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/rfqs",
  "/approvals",
  "/quotations",
  "/vendors",
  "/invoices",
  "/reports",
];

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// ─────────────────────────────────────────────────────
// Next.js 16 uses "proxy" convention (replaces middleware).
// This file is kept as middleware.ts for compatibility —
// rename to proxy.ts if upgrading to Next.js 16's new convention.
// ─────────────────────────────────────────────────────
export default auth(function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Auth is attached to the request by NextAuth's auth() wrapper
  const session = (req as NextRequest & { auth?: { user?: { role?: string } } | null }).auth;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  // Redirect authenticated users away from login page
  if (isPublicRoute && session?.user) {
    const role = session.user.role ?? "PROCUREMENT_OFFICER";
    const redirectTo = ROLE_REDIRECTS[role] ?? "/dashboard";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
