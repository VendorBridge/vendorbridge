"use server";

import { db } from "@/lib/db";
import { validateRegisterForm, type RegisterFormData } from "@/lib/validation";
import { sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export interface RegisterActionResult {
  success: boolean;
  message?: string;
  errors?: { field: string; message: string }[];
}

export async function registerAction(data: RegisterFormData): Promise<RegisterActionResult> {
  try {
    const validation = validateRegisterForm(data);
    if (!validation.success) {
      return { success: false, errors: validation.errors };
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

    // Check if email already exists
    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true },
    });

    if (existing) {
      return {
        success: false,
        errors: [{ field: "email", message: "This email is already registered." }],
      };
    }

    // Hash password with bcryptjs
    const password_hash = await bcrypt.hash(password, 12);

    // Generate random verification token
    const emailVerifyToken = randomBytes(32).toString("hex");

    // Create user in database
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

    // Send verification email
    await sendVerificationEmail({
      to: user.email,
      firstName: user.firstName,
      token: emailVerifyToken,
    });

    return {
      success: true,
      message: "Verification email sent! Please check your inbox.",
    };
  } catch (err) {
    console.error("[Register Server Action Error]", err);
    return {
      success: false,
      errors: [{ field: "global", message: "An unexpected database error occurred." }],
    };
  }
}
