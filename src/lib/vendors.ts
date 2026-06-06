import { VendorCategory, VendorStatus } from "@prisma/client";

export const VENDOR_CATEGORIES = Object.values(VendorCategory);

export const CATEGORY_LABELS: Record<VendorCategory, string> = {
  IT_HARDWARE: "IT Hardware",
  IT_SOFTWARE: "IT Software",
  FURNITURE: "Furniture",
  STATIONERY: "Stationery",
  LOGISTICS: "Logistics",
  FACILITY: "Facility Services",
  MARKETING: "Marketing",
  FINANCE: "Finance",
  OTHER: "Other",
};

export const STATUS_LABELS: Record<VendorStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  PENDING_VERIFICATION: "Pending",
  BLACKLISTED: "Blacklisted",
};

export type StatusTab = "ALL" | "ACTIVE" | "PENDING" | "BLOCKED";

export const STATUS_TAB_MAP: Record<Exclude<StatusTab, "ALL">, VendorStatus> = {
  ACTIVE: "ACTIVE",
  PENDING: "PENDING_VERIFICATION",
  BLOCKED: "BLACKLISTED",
};

export function formatCategory(category: VendorCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function formatStatus(status: VendorStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function formatRating(rating: number | null | undefined): string {
  if (rating == null || Number.isNaN(rating)) return "—";
  return Number(rating).toFixed(1);
}

export interface VendorListItem {
  id: string;
  companyName: string;
  category: VendorCategory;
  gstNumber: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  status: VendorStatus;
  rating: number | null;
}

export interface VendorFormInput {
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
