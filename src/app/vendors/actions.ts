"use server";

import { db } from "@/lib/db";
import { validateVendorForm, type VendorFormData } from "@/lib/validation";
import { STATUS_TAB_MAP, type StatusTab } from "@/lib/vendors";
import type { VendorCategory, VendorStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

export interface VendorFilters {
  search?: string;
  category?: VendorCategory | "";
  statusTab?: StatusTab;
  page?: number;
  limit?: number;
}

function buildWhere(filters: VendorFilters) {
  const where: {
    OR?: Array<Record<string, unknown>>;
    category?: VendorCategory;
    status?: VendorStatus;
  } = {};

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { companyName: { contains: q, mode: "insensitive" } },
      { gstNumber: { contains: q, mode: "insensitive" } },
      { contactEmail: { contains: q, mode: "insensitive" } },
      { contactPhone: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.statusTab && filters.statusTab !== "ALL") {
    where.status = STATUS_TAB_MAP[filters.statusTab];
  }

  return where;
}

export async function getVendors(filters: VendorFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 10));
  const skip = (page - 1) * limit;
  const where = buildWhere(filters);

  const [vendors, total, counts] = await Promise.all([
    db.vendor.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        companyName: true,
        category: true,
        gstNumber: true,
        contactPhone: true,
        contactEmail: true,
        status: true,
        rating: true,
      },
    }),
    db.vendor.count({ where }),
    Promise.all([
      db.vendor.count(),
      db.vendor.count({ where: { status: "ACTIVE" } }),
      db.vendor.count({ where: { status: "PENDING_VERIFICATION" } }),
      db.vendor.count({ where: { status: "BLACKLISTED" } }),
    ]),
  ]);

  return {
    vendors: vendors.map((v) => ({
      ...v,
      rating: v.rating != null ? Number(v.rating) : null,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    counts: {
      all: counts[0],
      active: counts[1],
      pending: counts[2],
      blocked: counts[3],
    },
  };
}

export async function createVendor(data: Partial<VendorFormData>) {
  const validation = validateVendorForm(data);
  if (!validation.success) {
    return { success: false as const, errors: validation.errors };
  }

  const form = validation.data!;

  const existingGst = await db.vendor.findFirst({
    where: { gstNumber: form.gstNumber },
    select: { id: true },
  });
  if (existingGst) {
    return {
      success: false as const,
      errors: [{ field: "gstNumber", message: "A vendor with this GST number already exists." }],
    };
  }

  let userId: string | undefined;

  if (form.createUserAccount && form.contactEmail) {
    const existingUser = await db.user.findUnique({
      where: { email: form.contactEmail },
      select: { id: true },
    });

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const nameParts = (form.contactName ?? form.companyName).split(" ");
      const firstName = nameParts[0] ?? "Vendor";
      const lastName = nameParts.slice(1).join(" ") || "Contact";
      const tempPassword = await bcrypt.hash("Vendor@123", 12);

      const user = await db.user.create({
        data: {
          email: form.contactEmail,
          passwordHash: tempPassword,
          firstName,
          lastName,
          role: "VENDOR",
        },
      });
      userId = user.id;
    }
  }

  const vendor = await db.vendor.create({
    data: {
      companyName: form.companyName,
      category: form.category,
      status: form.status ?? "PENDING_VERIFICATION",
      contactName: form.contactName,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      gstNumber: form.gstNumber,
      panNumber: form.panNumber,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2,
      city: form.city,
      state: form.state,
      country: form.country,
      pincode: form.pincode,
      bankName: form.bankName,
      bankAccountNo: form.bankAccountNo,
      bankIfsc: form.bankIfsc,
      notes: form.notes,
      userId,
    },
  });

  return { success: true as const, vendor: { id: vendor.id, companyName: vendor.companyName } };
}

export async function updateVendorStatus(id: string, status: VendorStatus) {
  const valid: VendorStatus[] = ["ACTIVE", "INACTIVE", "PENDING_VERIFICATION", "BLACKLISTED"];
  if (!valid.includes(status)) {
    return { success: false as const, error: "Invalid status." };
  }

  await db.vendor.update({ where: { id }, data: { status } });
  return { success: true as const };
}

export async function deleteVendor(id: string) {
  await db.vendor.update({
    where: { id },
    data: { status: "INACTIVE" },
  });
  return { success: true as const };
}
