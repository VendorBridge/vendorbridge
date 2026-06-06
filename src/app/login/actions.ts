"use server";

import { signIn } from "@/lib/auth";
import { ROLE_REDIRECTS } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper to check if an error is a Next.js redirect exception
function isRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as any).digest === "string" &&
    (err as any).digest.startsWith("NEXT_REDIRECT")
  );
}

// ─────────────────────────────────────────────────────
// In-memory rate limiter
// Key: email (lowercase), Value: { count, lockedUntil }
// ─────────────────────────────────────────────────────
const rateLimitMap = new Map<
  string,
  { count: number; lockedUntil: number | null }
>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(email: string): {
  allowed: boolean;
  remainingMs?: number;
  attemptsLeft?: number;
} {
  const now = Date.now();
  const key = email.toLowerCase().trim();
  const entry = rateLimitMap.get(key);

  if (!entry) return { allowed: true, attemptsLeft: MAX_ATTEMPTS };

  // Currently locked out
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { allowed: false, remainingMs: entry.lockedUntil - now };
  }

  // Lockout expired — reset
  if (entry.lockedUntil && now >= entry.lockedUntil) {
    rateLimitMap.delete(key);
    return { allowed: true, attemptsLeft: MAX_ATTEMPTS };
  }

  return {
    allowed: entry.count < MAX_ATTEMPTS,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - entry.count),
  };
}

function recordFailedAttempt(email: string) {
  const key = email.toLowerCase().trim();
  const entry = rateLimitMap.get(key) ?? { count: 0, lockedUntil: null };
  entry.count += 1;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
  }

  rateLimitMap.set(key, entry);
}

function clearAttempts(email: string) {
  rateLimitMap.delete(email.toLowerCase().trim());
}

// ─────────────────────────────────────────────────────
// Login action return types
// ─────────────────────────────────────────────────────
export type LoginError =
  | { type: "INVALID_CREDENTIALS"; message: string }
  | { type: "ACCOUNT_INACTIVE"; message: string }
  | { type: "ACCOUNT_SUSPENDED"; message: string }
  | { type: "RATE_LIMITED"; message: string; remainingMs: number }
  | { type: "UNKNOWN"; message: string };

export type LoginResult =
  | { success: true; redirectTo: string }
  | { success: false; error: LoginError };

// ─────────────────────────────────────────────────────
// Main login action
// ─────────────────────────────────────────────────────
export async function loginAction(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  if (!email || !password) {
    return {
      success: false,
      error: {
        type: "INVALID_CREDENTIALS",
        message: "Email and password are required.",
      },
    };
  }

  // Check rate limit before attempting login
  const rateCheck = checkRateLimit(email);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: {
        type: "RATE_LIMITED",
        message: "Too many failed attempts. Please try again later.",
        remainingMs: rateCheck.remainingMs ?? LOCKOUT_DURATION_MS,
      },
    };
  }

  try {
    // 1. Pre-fetch user's role to determine role-based redirect
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });
    const role = user?.role ?? "PROCUREMENT_OFFICER";
    const redirectTo = ROLE_REDIRECTS[role] ?? "/dashboard";

    // 2. Perform NextAuth signIn with explicit redirectTo target
    await signIn("credentials", {
      email,
      password,
      remember: remember ? "true" : "false",
      redirectTo,
    });

    // Success — clear rate limit
    clearAttempts(email);

    return { success: true, redirectTo };
  } catch (err) {
    if (isRedirectError(err)) {
      // Clear attempts on success redirect
      clearAttempts(email);
      throw err; // Re-throw redirect so Next.js handles navigation
    }

    if (err instanceof AuthError) {
      const cause = err.cause?.err?.message ?? err.type ?? "";

      if (cause === "ACCOUNT_INACTIVE") {
        return {
          success: false,
          error: {
            type: "ACCOUNT_INACTIVE",
            message:
              "Your account is inactive. Please contact your administrator.",
          },
        };
      }

      if (cause === "ACCOUNT_SUSPENDED") {
        return {
          success: false,
          error: {
            type: "ACCOUNT_SUSPENDED",
            message:
              "Your account has been suspended. Please contact support.",
          },
        };
      }

      // Record failed attempt
      recordFailedAttempt(email);

      // Re-check rate limit for updated count
      const updatedCheck = checkRateLimit(email);
      if (!updatedCheck.allowed) {
        return {
          success: false,
          error: {
            type: "RATE_LIMITED",
            message: `Too many failed attempts. Account locked for 15 minutes.`,
            remainingMs: updatedCheck.remainingMs ?? LOCKOUT_DURATION_MS,
          },
        };
      }

      const attemptsLeft = updatedCheck.attemptsLeft ?? 0;
      return {
        success: false,
        error: {
          type: "INVALID_CREDENTIALS",
          message:
            attemptsLeft > 0
              ? `Invalid email or password. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining.`
              : "Invalid email or password.",
        },
      };
    }

    console.error("[Login Action Error]", err);
    return {
      success: false,
      error: {
        type: "UNKNOWN",
        message: "An unexpected error occurred. Please try again.",
      },
    };
  }
}

// ─────────────────────────────────────────────────────
// Forgot password action (placeholder)
// ─────────────────────────────────────────────────────
export async function forgotPasswordAction(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();

  if (!email) {
    return { success: false, message: "Email is required." };
  }

  // TODO: Implement actual email sending logic
  // 1. Generate reset token
  // 2. Store in users.reset_token + users.reset_token_expires
  // 3. Send email with reset link

  return {
    success: true,
    message:
      "If an account exists with that email, you will receive a reset link shortly.",
  };
}
