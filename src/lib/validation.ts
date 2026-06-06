// ─────────────────────────────────────────────────────
// Zod Validation Schemas — VendorBridge Registration
// ─────────────────────────────────────────────────────

// NOTE: Zod is not listed in package.json but we implement
// manual validation compatible with the project's tech stack.
// This file exports both Zod-style interfaces and a manual
// validator that mirrors the Zod API surface.

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  additionalInfo?: string;
  password: string;
  confirmPassword: string;
  role: "PROCUREMENT_OFFICER" | "VENDOR" | "MANAGER" | "ADMIN";
  avatarUrl?: string;
  termsAccepted: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
  data?: RegisterFormData;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterForm(data: Partial<RegisterFormData>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.firstName?.trim()) {
    errors.push({ field: "firstName", message: "First name is required." });
  } else if (data.firstName.trim().length > 100) {
    errors.push({ field: "firstName", message: "First name must be under 100 characters." });
  }

  if (!data.lastName?.trim()) {
    errors.push({ field: "lastName", message: "Last name is required." });
  } else if (data.lastName.trim().length > 100) {
    errors.push({ field: "lastName", message: "Last name must be under 100 characters." });
  }

  if (!data.email?.trim()) {
    errors.push({ field: "email", message: "Email is required." });
  } else if (!EMAIL_RE.test(data.email.trim())) {
    errors.push({ field: "email", message: "Please enter a valid email address." });
  }

  if (data.phone && data.phone.length > 30) {
    errors.push({ field: "phone", message: "Phone number must be under 30 characters." });
  }

  if (!data.password) {
    errors.push({ field: "password", message: "Password is required." });
  } else if (data.password.length < 8) {
    errors.push({ field: "password", message: "Password must be at least 8 characters." });
  }

  if (!data.confirmPassword) {
    errors.push({ field: "confirmPassword", message: "Please confirm your password." });
  } else if (data.password !== data.confirmPassword) {
    errors.push({ field: "confirmPassword", message: "Passwords do not match." });
  }

  const validRoles = ["PROCUREMENT_OFFICER", "VENDOR", "MANAGER", "ADMIN"];
  if (!data.role || !validRoles.includes(data.role)) {
    errors.push({ field: "role", message: "Please select a valid role." });
  }

  if (!data.termsAccepted) {
    errors.push({ field: "termsAccepted", message: "You must accept the terms of service." });
  }

  if (errors.length > 0) return { success: false, errors };

  return {
    success: true,
    errors: [],
    data: data as RegisterFormData,
  };
}

// ── Password strength ──────────────────────────────────
export type PasswordStrength = "empty" | "weak" | "fair" | "good" | "strong";

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0–4
  label: string;
  color: string;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  if (password.length === 0) return { strength: "empty", score: 0, label: "", color: "", checks };

  const map: Record<number, { strength: PasswordStrength; label: string; color: string }> = {
    0: { strength: "weak", label: "Very Weak", color: "#ef4444" },
    1: { strength: "weak", label: "Weak", color: "#f97316" },
    2: { strength: "fair", label: "Fair", color: "#eab308" },
    3: { strength: "good", label: "Good", color: "#22c55e" },
    4: { strength: "strong", label: "Strong", color: "#6C3FF5" },
    5: { strength: "strong", label: "Very Strong", color: "#6C3FF5" },
  };

  const entry = map[score] ?? map[5];
  return { ...entry, score, checks };
}
