import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateRegisterForm } from "@/lib/validation";
import { sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

// ── In-memory IP rate limiter (3 registrations / hour / IP) ──
const ipAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_REG_PER_HOUR = 3;
const ONE_HOUR_MS = 60 * 60 * 1000;

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkIpRateLimit(ip: string): { allowed: boolean } {
  const now = Date.now();
  const entry = ipAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipAttempts.set(ip, { count: 1, resetAt: now + ONE_HOUR_MS });
    return { allowed: true };
  }
  if (entry.count >= MAX_REG_PER_HOUR) return { allowed: false };
  entry.count += 1;
  return { allowed: true };
}

// ── POST /api/auth/register ────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const ip = getIp(req);
    if (!checkIpRateLimit(ip).allowed) {
      return NextResponse.json(
        { success: false, error: "Too many registration attempts. Try again in an hour." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = validateRegisterForm(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 422 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      country,
      additionalInfo,
      password,
      role,
      avatarUrl,
    } = validation.data!;

    // Check email uniqueness
    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          errors: [{ field: "email", message: "This email is already registered." }],
        },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Generate email verification token
    const emailVerifyToken = randomBytes(32).toString("hex");

    // Create user
    const user = await db.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        passwordHash: password_hash,
        role: role as "ADMIN" | "PROCUREMENT_OFFICER" | "VENDOR" | "MANAGER",
        status: "ACTIVE",
        country: country?.trim() || null,
        additionalInfo: additionalInfo?.trim() || null,
        avatarUrl: avatarUrl || null,
        emailVerified: false,
        emailVerifyToken,
      },
      select: { id: true, email: true, firstName: true },
    });

    // Send verification email (console.log for demo)
    await sendVerificationEmail({
      to: user.email,
      firstName: user.firstName,
      token: emailVerifyToken,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful! Please check your email to verify your account.",
        userId: user.id,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Register API Error]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
