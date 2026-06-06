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
// TEMPORARY: Auth middleware disabled for development.
// Uncomment the block below once login flow is ready.
// ─────────────────────────────────────────────────────

// export default auth(function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;
//   const session = (req as NextRequest & { auth?: { user?: { role?: string } } | null }).auth;
//
//   const isPublicRoute = PUBLIC_ROUTES.some(
//     (route) => pathname === route || pathname.startsWith(route + "/")
//   );
//   const isProtectedRoute = PROTECTED_PREFIXES.some(
//     (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
//   );
//
//   // Redirect authenticated users away from login page
//   if (isPublicRoute && session?.user) {
//     const role = session.user.role ?? "PROCUREMENT_OFFICER";
//     const redirectTo = ROLE_REDIRECTS[role] ?? "/dashboard";
//     return NextResponse.redirect(new URL(redirectTo, req.url));
//   }
//
//   // Redirect unauthenticated users to login
//   if (isProtectedRoute && !session?.user) {
//     const loginUrl = new URL("/login", req.url);
//     loginUrl.searchParams.set("callbackUrl", pathname);
//     return NextResponse.redirect(loginUrl);
//   }
//
//   return NextResponse.next();
// });

export default function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// ─────────────────────────────────────────────────────
// 📌 AFTER LOGIN PAGE IS FULLY WORKING — DO THIS:
// ─────────────────────────────────────────────────────
//
// Step 1: Uncomment the imports at the top of this file:
//         import { auth } from "@/lib/auth";
//         import { ROLE_REDIRECTS } from "@/lib/auth";
//
// Step 2: Uncomment PROTECTED_PREFIXES and PUBLIC_ROUTES arrays.
//
// Step 3: Uncomment the full `export default auth(function middleware(...))` block above.
//
// Step 4: DELETE the temporary passthrough function:
//         export default function middleware(req: NextRequest) {
//           return NextResponse.next();
//         }
//
// Step 5: Test by visiting /dashboard without logging in — it should
//         redirect you to /login. After logging in, it should redirect
//         you back to the correct dashboard based on your role.
//
// That's it! Auth protection will be fully active again.
// ─────────────────────────────────────────────────────
