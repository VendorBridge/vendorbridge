import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ── GET /api/auth/check-email?email=... ───────────────
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ available: false, error: "Email is required." }, { status: 400 });
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return NextResponse.json({ available: false, error: "Invalid email format." }, { status: 400 });
  }

  try {
    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return NextResponse.json({ available: !existing });
  } catch (err) {
    console.error("[Check Email Error]", err);
    return NextResponse.json({ available: true }); // fail-open to not block registration
  }
}
