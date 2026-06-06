// ─────────────────────────────────────────────────────
// Zod Validation Schemas — VendorBridge Registration
// ─────────────────────────────────────────────────────

import type { VendorCategory, VendorStatus } from "@prisma/client";

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

export interface ValidationResult<T = RegisterFormData> {
  success: boolean;
  errors: ValidationError[];
  data?: T;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterForm(data: Partial<RegisterFormData>): ValidationResult<RegisterFormData> {
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

// ── Vendor form validation ─────────────────────────────
export interface VendorFormData {
  companyName: string;
  category: VendorCategory;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  gstNumber: string;
  panNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  notes?: string;
  status?: VendorStatus;
  createUserAccount?: boolean;
}

const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const VENDOR_CATEGORIES = [
  "IT_HARDWARE", "IT_SOFTWARE", "FURNITURE", "STATIONERY",
  "LOGISTICS", "FACILITY", "MARKETING", "FINANCE", "OTHER",
] as const;

const VENDOR_STATUSES = [
  "ACTIVE", "INACTIVE", "PENDING_VERIFICATION", "BLACKLISTED",
] as const;

export function validateVendorForm(data: Partial<VendorFormData>): ValidationResult<VendorFormData> {
  const errors: ValidationError[] = [];

  if (!data.companyName?.trim()) {
    errors.push({ field: "companyName", message: "Company name is required." });
  } else if (data.companyName.trim().length > 200) {
    errors.push({ field: "companyName", message: "Company name must be under 200 characters." });
  }

  if (!data.category || !VENDOR_CATEGORIES.includes(data.category as typeof VENDOR_CATEGORIES[number])) {
    errors.push({ field: "category", message: "Please select a valid category." });
  }

  if (!data.gstNumber?.trim()) {
    errors.push({ field: "gstNumber", message: "GST number is required." });
  } else if (!GST_RE.test(data.gstNumber.trim().toUpperCase())) {
    errors.push({ field: "gstNumber", message: "Invalid GST format (e.g. 27AABCT1234A1ZP)." });
  }

  if (data.contactEmail?.trim() && !EMAIL_RE.test(data.contactEmail.trim())) {
    errors.push({ field: "contactEmail", message: "Please enter a valid email address." });
  }

  if (data.panNumber?.trim() && !PAN_RE.test(data.panNumber.trim().toUpperCase())) {
    errors.push({ field: "panNumber", message: "Invalid PAN format (e.g. ABCDE1234F)." });
  }

  if (data.bankIfsc?.trim() && !IFSC_RE.test(data.bankIfsc.trim().toUpperCase())) {
    errors.push({ field: "bankIfsc", message: "Invalid IFSC format (e.g. HDFC0001234)." });
  }

  if (data.status && !VENDOR_STATUSES.includes(data.status as typeof VENDOR_STATUSES[number])) {
    errors.push({ field: "status", message: "Please select a valid status." });
  }

  if (errors.length > 0) return { success: false, errors };

  return {
    success: true,
    errors: [],
    data: {
      ...data,
      companyName: data.companyName!.trim(),
      gstNumber: data.gstNumber!.trim().toUpperCase(),
      panNumber: data.panNumber?.trim().toUpperCase(),
      bankIfsc: data.bankIfsc?.trim().toUpperCase(),
      contactEmail: data.contactEmail?.trim().toLowerCase(),
      status: data.status ?? "PENDING_VERIFICATION",
    } as VendorFormData,
  };
}
