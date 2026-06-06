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

export async function createInvoiceFromPoAction(poId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false as const, error: "Unauthorized." };
  }

  // Check if PO exists
  const po = await db.purchaseOrder.findUnique({
    where: { id: poId }
  });

  if (!po) {
    return { success: false as const, error: "Purchase Order not found." };
  }

  // Check if invoice already exists
  const existingInvoice = await db.invoice.findFirst({
    where: { poId },
    select: { id: true, invoiceNumber: true }
  });

  if (existingInvoice) {
    return { success: true as const, invoiceId: existingInvoice.id };
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const invoiceCount = await tx.invoice.count();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

      // Due date is PO date + 30 days
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      // Create invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          poId,
          vendorId: po.vendorId,
          rfqId: po.rfqId,
          status: "ISSUED",
          invoiceDate: new Date(),
          dueDate,
          subtotal: po.subtotal,
          discountAmount: po.discountAmount,
          taxPct: po.taxPct,
          taxAmount: po.taxAmount,
          grandTotal: po.grandTotal,
          paymentTerms: po.paymentTerms,
          createdBy: userId,
        }
      });

      // Get PO items
      const poItems = await tx.poItem.findMany({
        where: { poId }
      });

      // Create invoice items
      await tx.invoiceItem.createMany({
        data: poItems.map((item, idx) => ({
          invoiceId: invoice.id,
          poItemId: item.id,
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          taxPct: po.taxPct,
          lineSubtotal: item.lineTotal,
          sortOrder: item.sortOrder ?? idx,
        }))
      });

      // Update PO status to ACKNOWLEDGED
      await tx.purchaseOrder.update({
        where: { id: poId },
        data: { status: "ACKNOWLEDGED" }
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          entityType: "INVOICE",
          entityId: invoice.id,
          action: "CREATED",
          actorId: userId,
          description: `Invoice ${invoiceNumber} generated from PO ${po.poNumber}.`,
        }
      });

      return invoice;
    });

    return { success: true as const, invoiceId: result.id };
  } catch (err: any) {
    console.error(err);
    return { success: false as const, error: err.message || "Failed to create invoice from PO." };
  }
}

export async function sendInvoiceEmailAction(invoiceId: string, email: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false as const, error: "Unauthorized." };
  }

  try {
    const invoice = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        emailSentTo: email,
        emailSentAt: new Date(),
      }
    });

    // Create activity log
    await db.activityLog.create({
      data: {
        entityType: "INVOICE",
        entityId: invoiceId,
        action: "UPDATED",
        actorId: userId,
        description: `Invoice ${invoice.invoiceNumber} sent via email to ${email}.`,
      }
    });

    return { success: true as const, email, sentAt: invoice.emailSentAt?.toISOString() };
  } catch (err: any) {
    console.error(err);
    return { success: false as const, error: err.message || "Failed to update invoice email status." };
  }
}

export async function recordInvoicePrintAction(invoiceId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false as const, error: "Unauthorized." };
  }

  try {
    const invoice = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        printedAt: new Date(),
      }
    });

    // Create activity log
    await db.activityLog.create({
      data: {
        entityType: "INVOICE",
        entityId: invoiceId,
        action: "UPDATED",
        actorId: userId,
        description: `Invoice ${invoice.invoiceNumber} printed/downloaded.`,
      }
    });

    return { success: true as const, printedAt: invoice.printedAt?.toISOString() };
  } catch (err: any) {
    console.error(err);
    return { success: false as const, error: err.message || "Failed to record invoice print status." };
  }
}


