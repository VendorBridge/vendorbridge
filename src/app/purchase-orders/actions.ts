"use server";

import { db } from "@/lib/db";
import { PoStatus } from "@prisma/client";

export interface POFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function getPurchaseOrders(filters: POFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 10));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status as PoStatus;
  }

  // If search is provided, find matching POs or Vendors first
  if (filters.search?.trim()) {
    const q = filters.search.trim();
    const matchingVendors = await db.vendor.findMany({
      where: { companyName: { contains: q, mode: "insensitive" } },
      select: { id: true }
    });

    where.OR = [
      { poNumber: { contains: q, mode: "insensitive" } },
      { vendorId: { in: matchingVendors.map(v => v.id) } }
    ];
  }

  const [pos, total] = await Promise.all([
    db.purchaseOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.purchaseOrder.count({ where }),
  ]);

  // Fetch related vendors manually
  const vendorIds = [...new Set(pos.map(po => po.vendorId))];
  const vendors = await db.vendor.findMany({
    where: { id: { in: vendorIds } },
    select: { id: true, companyName: true, contactEmail: true }
  });

  const vendorMap = new Map(vendors.map(v => [v.id, v]));

  return {
    success: true as const,
    data: pos.map(po => {
      const vendor = vendorMap.get(po.vendorId);
      return {
        id: po.id,
        poNumber: po.poNumber,
        vendor: vendor?.companyName ?? "Unknown Vendor",
        vendorEmail: vendor?.contactEmail ?? "",
        date: po.poDate.toISOString(),
        amount: po.grandTotal.toNumber(),
        status: po.status,
      };
    }),
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getPurchaseOrderById(id: string) {
  const po = await db.purchaseOrder.findUnique({
    where: { id },
  });

  if (!po) return null;

  const [vendor, rfq, items] = await Promise.all([
    db.vendor.findUnique({ where: { id: po.vendorId } }),
    db.rfq.findUnique({ where: { id: po.rfqId } }),
    db.poItem.findMany({ where: { poId: id } }),
  ]);

  // Check if an invoice has already been generated for this PO
  const invoice = await db.invoice.findFirst({
    where: { poId: id },
    select: { id: true, invoiceNumber: true }
  });

  return {
    ...po,
    poDate: po.poDate.toISOString(),
    expectedDelivery: po.expectedDelivery?.toISOString() || null,
    subtotal: po.subtotal.toNumber(),
    discountAmount: po.discountAmount.toNumber(),
    taxAmount: po.taxAmount.toNumber(),
    grandTotal: po.grandTotal.toNumber(),
    vendor,
    rfq,
    items: items.map(item => ({
      ...item,
      quantity: item.quantity.toNumber(),
      unitPrice: item.unitPrice.toNumber(),
      lineTotal: item.lineTotal ? item.lineTotal.toNumber() : 0,
    })),
    invoice,
  };
}

