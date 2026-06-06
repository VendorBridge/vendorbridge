"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ApprovalStatus } from "@prisma/client";

export interface ApprovalFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function getApprovals(filters: ApprovalFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 10));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status as ApprovalStatus;
  }

  // If search is provided, find matching RFQs or Vendors first
  if (filters.search?.trim()) {
    const q = filters.search.trim();
    const [matchingRfqs, matchingVendors] = await Promise.all([
      db.rfq.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { rfqNumber: { contains: q, mode: "insensitive" } }
          ]
        },
        select: { id: true }
      }),
      db.vendor.findMany({
        where: { companyName: { contains: q, mode: "insensitive" } },
        select: { id: true }
      })
    ]);

    where.OR = [
      { rfqId: { in: matchingRfqs.map(r => r.id) } },
      { vendorId: { in: matchingVendors.map(v => v.id) } }
    ];
  }

  const [approvals, total] = await Promise.all([
    db.approval.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.approval.count({ where }),
  ]);

  // Fetch related data manually
  const rfqIds = [...new Set(approvals.map(a => a.rfqId))];
  const vendorIds = [...new Set(approvals.map(a => a.vendorId))];
  const quotationIds = [...new Set(approvals.map(a => a.quotationId))];

  const [rfqs, vendors, quotations] = await Promise.all([
    db.rfq.findMany({ where: { id: { in: rfqIds } }, select: { id: true, title: true, rfqNumber: true } }),
    db.vendor.findMany({ where: { id: { in: vendorIds } }, select: { id: true, companyName: true } }),
    db.quotation.findMany({ where: { id: { in: quotationIds } }, select: { id: true, grandTotal: true, quotationNumber: true } })
  ]);

  const rfqMap = new Map(rfqs.map(r => [r.id, r]));
  const vendorMap = new Map(vendors.map(v => [v.id, v]));
  const quotationMap = new Map(quotations.map(q => [q.id, q]));

  return {
    success: true as const,
    data: approvals.map(app => {
      const rfq = rfqMap.get(app.rfqId);
      const vendor = vendorMap.get(app.vendorId);
      const quotation = quotationMap.get(app.quotationId);

      return {
        id: app.id,
        rfqTitle: rfq?.title ?? "Unknown RFQ",
        rfqNumber: rfq?.rfqNumber ?? "N/A",
        vendor: vendor?.companyName ?? "Unknown Vendor",
        quotationNumber: quotation?.quotationNumber ?? "N/A",
        amount: quotation ? quotation.grandTotal.toNumber() : 0,
        status: app.status,
        createdAt: app.createdAt.toISOString(),
        priority: app.priority,
      };
    }),
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getApprovalById(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized." };
  }

  const approval = await db.approval.findUnique({
    where: { id }
  });
  if (!approval) {
    return { success: false as const, error: "Approval request not found." };
  }

  const [rfq, vendor, quotation] = await Promise.all([
    db.rfq.findUnique({ where: { id: approval.rfqId } }),
    db.vendor.findUnique({ where: { id: approval.vendorId } }),
    db.quotation.findUnique({
      where: { id: approval.quotationId },
      // include related quotation items
      include: { items: true }
    })
  ]);

  return {
    success: true as const,
    data: {
      ...approval,
      timeline: typeof approval.timeline === "string" ? JSON.parse(approval.timeline) : approval.timeline,
      rfq,
      vendor,
      quotation: quotation ? {
        ...quotation,
        subtotal: quotation.subtotal.toNumber(),
        discountAmount: quotation.discountAmount.toNumber(),
        taxAmount: quotation.taxAmount.toNumber(),
        grandTotal: quotation.grandTotal.toNumber(),
        items: quotation.items.map(item => ({
          ...item,
          quantity: item.quantity.toNumber(),
          unitPrice: item.unitPrice.toNumber(),
          lineTotal: item.lineTotal ? item.lineTotal.toNumber() : 0
        }))
      } : null
    }
  };
}

export async function approveApprovalAction(id: string, remarks?: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false as const, error: "Unauthorized." };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (user?.role !== "MANAGER" && user?.role !== "ADMIN") {
    return { success: false as const, error: "Only managers or admins can approve requests." };
  }

  const approval = await db.approval.findUnique({
    where: { id }
  });

  if (!approval) {
    return { success: false as const, error: "Approval request not found." };
  }

  if (approval.status !== "PENDING") {
    return { success: false as const, error: `This request is already ${approval.status.toLowerCase()}.` };
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Update approval status
      await tx.approval.update({
        where: { id },
        data: {
          status: "APPROVED",
          decisionBy: userId,
          decisionAt: new Date(),
          remarks: remarks || null
        }
      });

      // 2. Update RFQ status
      await tx.rfq.update({
        where: { id: approval.rfqId },
        data: { status: "AWARDED" }
      });

      // 3. Update Quotation status
      const quotation = await tx.quotation.update({
        where: { id: approval.quotationId },
        data: { status: "ACCEPTED" }
      });

      // 4. Reject other quotations for the same RFQ
      await tx.quotation.updateMany({
        where: { rfqId: approval.rfqId, id: { not: approval.quotationId } },
        data: { status: "REJECTED" }
      });

      // 5. Generate PO
      const poCount = await tx.purchaseOrder.count();
      const poNumber = `PO-${new Date().getFullYear()}-${String(poCount + 1).padStart(4, '0')}`;

      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          poNumber,
          quotationId: approval.quotationId,
          rfqId: approval.rfqId,
          vendorId: approval.vendorId,
          approvalId: approval.id,
          status: "ISSUED",
          grandTotal: quotation.grandTotal,
          subtotal: quotation.subtotal,
          discountAmount: quotation.discountAmount,
          taxPct: quotation.taxPct,
          taxAmount: quotation.taxAmount,
          paymentTerms: quotation.paymentTerms,
          deliveryTerms: quotation.deliveryTerms,
          createdBy: userId
        }
      });

      // 6. Generate PO Items
      const quotationItems = await tx.quotationItem.findMany({
        where: { quotationId: approval.quotationId }
      });

      await tx.poItem.createMany({
        data: quotationItems.map((item, idx) => ({
          poId: purchaseOrder.id,
          quotationItemId: item.id,
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          sortOrder: item.sortOrder ?? idx
        }))
      });

      // 7. Notify requestor
      await tx.notification.create({
        data: {
          userId: approval.requestedBy,
          type: "APPROVAL_GRANTED",
          title: "Approval Granted",
          message: `Approval has been granted for RFQ. Purchase Order ${poNumber} has been issued.`,
          entityType: "PURCHASE_ORDER",
          entityId: purchaseOrder.id
        }
      });

      // 8. Log Activity
      await tx.activityLog.create({
        data: {
          entityType: "APPROVAL",
          entityId: approval.id,
          action: "APPROVED",
          actorId: userId,
          description: `Approval request granted. PO ${poNumber} generated.`,
          metadata: { poId: purchaseOrder.id, poNumber }
        }
      });

      return { success: true as const, poId: purchaseOrder.id };
    });

    return result;
  } catch (err: any) {
    console.error("Error during approval transaction:", err);
    return { success: false as const, error: err.message || "An unexpected error occurred during approval." };
  }
}

export async function rejectApprovalAction(id: string, remarks?: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false as const, error: "Unauthorized." };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (user?.role !== "MANAGER" && user?.role !== "ADMIN") {
    return { success: false as const, error: "Only managers or admins can reject requests." };
  }

  const approval = await db.approval.findUnique({
    where: { id }
  });

  if (!approval) {
    return { success: false as const, error: "Approval request not found." };
  }

  if (approval.status !== "PENDING") {
    return { success: false as const, error: `This request is already ${approval.status.toLowerCase()}.` };
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Update approval status
      await tx.approval.update({
        where: { id },
        data: {
          status: "REJECTED",
          decisionBy: userId,
          decisionAt: new Date(),
          remarks: remarks || null
        }
      });

      // 2. Update RFQ status back to PUBLISHED
      await tx.rfq.update({
        where: { id: approval.rfqId },
        data: { status: "PUBLISHED" }
      });

      // 3. Update Quotation status to REJECTED
      await tx.quotation.update({
        where: { id: approval.quotationId },
        data: { status: "REJECTED" }
      });

      // 4. Notify requestor
      await tx.notification.create({
        data: {
          userId: approval.requestedBy,
          type: "APPROVAL_REJECTED",
          title: "Approval Rejected",
          message: `Approval request was rejected. ${remarks ? `Remarks: ${remarks}` : ""}`,
          entityType: "APPROVAL",
          entityId: approval.id
        }
      });

      // 5. Log Activity
      await tx.activityLog.create({
        data: {
          entityType: "APPROVAL",
          entityId: approval.id,
          action: "REJECTED",
          actorId: userId,
          description: `Approval request rejected. Remarks: ${remarks || "None"}`,
        }
      });

      return { success: true as const };
    });

    return result;
  } catch (err: any) {
    console.error("Error during rejection transaction:", err);
    return { success: false as const, error: err.message || "An unexpected error occurred during rejection." };
  }
}
