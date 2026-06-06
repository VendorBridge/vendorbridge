"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { InvoiceStatus } from "@prisma/client";

export interface InvoiceFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function getInvoices(filters: InvoiceFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 10));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status as InvoiceStatus;
  }

  // If search is provided, find matching POs or Vendors first
  if (filters.search?.trim()) {
    const q = filters.search.trim();
    const [matchingPos, matchingVendors] = await Promise.all([
      db.purchaseOrder.findMany({
        where: { poNumber: { contains: q, mode: "insensitive" } },
        select: { id: true }
      }),
      db.vendor.findMany({
        where: { companyName: { contains: q, mode: "insensitive" } },
        select: { id: true }
      })
    ]);

    where.OR = [
      { invoiceNumber: { contains: q, mode: "insensitive" } },
      { poId: { in: matchingPos.map(p => p.id) } },
      { vendorId: { in: matchingVendors.map(v => v.id) } }
    ];
  }

  const [invoices, total] = await Promise.all([
    db.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.invoice.count({ where }),
  ]);

  // Fetch related vendors and POs manually
  const vendorIds = [...new Set(invoices.map(inv => inv.vendorId))];
  const poIds = [...new Set(invoices.map(inv => inv.poId))];

  const [vendors, pos] = await Promise.all([
    db.vendor.findMany({
      where: { id: { in: vendorIds } },
      select: { id: true, companyName: true }
    }),
    db.purchaseOrder.findMany({
      where: { id: { in: poIds } },
      select: { id: true, poNumber: true }
    })
  ]);

  const vendorMap = new Map(vendors.map(v => [v.id, v]));
  const poMap = new Map(pos.map(p => [p.id, p]));

  return {
    success: true as const,
    data: invoices.map(inv => {
      const vendor = vendorMap.get(inv.vendorId);
      const po = poMap.get(inv.poId);

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        poNumber: po?.poNumber ?? "N/A",
        vendor: vendor?.companyName ?? "Unknown Vendor",
        amount: inv.grandTotal.toNumber(),
        date: inv.invoiceDate.toISOString(),
        dueDate: inv.dueDate?.toISOString(),
        status: inv.status,
      };
    }),
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getInvoiceById(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized." };
  }

  const invoice = await db.invoice.findUnique({
    where: { id },
    // include related invoice items
    include: {
      items: true
    }
  });

  if (!invoice) {
    return { success: false as const, error: "Invoice not found." };
  }

  const [po, vendor] = await Promise.all([
    db.purchaseOrder.findUnique({ where: { id: invoice.poId } }),
    db.vendor.findUnique({ where: { id: invoice.vendorId } })
  ]);

  return {
    success: true as const,
    data: {
      ...invoice,
      invoiceDate: invoice.invoiceDate.toISOString(),
      dueDate: invoice.dueDate?.toISOString(),
      subtotal: invoice.subtotal.toNumber(),
      discountAmount: invoice.discountAmount.toNumber(),
      taxAmount: invoice.taxAmount.toNumber(),
      grandTotal: invoice.grandTotal.toNumber(),
      po: po ? {
        ...po,
        poDate: po.poDate.toISOString()
      } : null,
      vendor,
      items: invoice.items.map(item => ({
        ...item,
        quantity: item.quantity.toNumber(),
        unitPrice: item.unitPrice.toNumber(),
        lineTotal: item.lineSubtotal ? item.lineSubtotal.toNumber() : 0
      }))
    }
  };
}

export async function markInvoiceAsPaidAction(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false as const, error: "Unauthorized." };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (user?.role !== "ADMIN" && user?.role !== "MANAGER" && user?.role !== "PROCUREMENT_OFFICER") {
    return { success: false as const, error: "Unauthorized to mark invoices as paid." };
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const invoice = await tx.invoice.update({
        where: { id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        }
      });

      // Update purchase order status to FULFILLED
      await tx.purchaseOrder.update({
        where: { id: invoice.poId },
        data: { status: "FULFILLED" }
      });

      // Notify invoice creator (vendor)
      await tx.notification.create({
        data: {
          userId: invoice.createdBy,
          type: "INVOICE_PAID",
          title: "Invoice Paid",
          message: `Invoice ${invoice.invoiceNumber} has been marked as paid.`,
          entityType: "INVOICE",
          entityId: invoice.id
        }
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          entityType: "INVOICE",
          entityId: invoice.id,
          action: "PAID",
          actorId: userId,
          description: `Invoice ${invoice.invoiceNumber} marked as paid.`,
        }
      });

      return invoice;
    });

    return { success: true as const, data: { id: result.id, status: result.status } };
  } catch (err: any) {
    console.error(err);
    return { success: false as const, error: err.message || "Failed to update invoice." };
  }
}
