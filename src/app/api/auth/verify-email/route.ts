import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ── GET /api/auth/verify-email?token=... ─────────────
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.redirect(new URL("/register/verify-email?error=missing_token", req.url));
  }

  try {
    const user = await db.user.findFirst({
      where: { emailVerifyToken: token, emailVerified: false },
      select: { id: true, email: true, firstName: true },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/register/verify-email?error=invalid_or_expired", req.url)
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
      },
    });

    return NextResponse.redirect(
      new URL(`/login?verified=true&email=${encodeURIComponent(user.email)}`, req.url)
    );
  } catch (err) {
    console.error("[Verify Email Error]", err);
    return NextResponse.redirect(new URL("/register/verify-email?error=server_error", req.url));
  }
}
