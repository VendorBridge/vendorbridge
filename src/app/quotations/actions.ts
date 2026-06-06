"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { QuotationStatus, NotificationType } from "@prisma/client";

// Get vendor associated with the current user session
async function getCurrentVendor() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.vendor.findFirst({
    where: { userId: session.user.id },
  });
}

// Get all RFQ invitations for the logged-in vendor
export async function getVendorInvitations() {
  const vendor = await getCurrentVendor();
  if (!vendor) {
    return { success: false as const, error: "Unauthorized or not a Vendor user." };
  }

  const invitations = await db.rfqVendor.findMany({
    where: { vendorId: vendor.id },
    orderBy: { invitedAt: "desc" },
  });

  const rfqIds = [...new Set(invitations.map(i => i.rfqId))];
  const rfqs = await db.rfq.findMany({
    where: { id: { in: rfqIds } },
    select: {
      id: true,
      rfqNumber: true,
      title: true,
      status: true,
      deadline: true,
      category: true,
      createdAt: true,
    }
  });

  const rfqMap = new Map(rfqs.map(r => [r.id, r]));

  // Fetch already submitted quotations for these RFQs by this vendor
  const submittedQuotes = await db.quotation.findMany({
    where: {
      vendorId: vendor.id,
      rfqId: { in: invitations.map((i) => i.rfqId) },
    },
    select: {
      rfqId: true,
      id: true,
      quotationNumber: true,
      status: true,
      grandTotal: true,
      submittedAt: true,
    },
  });

  const quoteMap = new Map(submittedQuotes.map((q) => [q.rfqId, q]));

  const data = invitations.map((invite) => {
    const quote = quoteMap.get(invite.rfqId);
    const rfq = rfqMap.get(invite.rfqId);

    if (!rfq) return null;

    return {
      rfqId: invite.rfqId,
      rfqNumber: rfq.rfqNumber,
      title: rfq.title,
      status: rfq.status,
      deadline: rfq.deadline.toISOString(),
      category: rfq.category,
      invitedAt: invite.invitedAt.toISOString(),
      hasSubmitted: !!quote,
      quotation: quote
        ? {
            id: quote.id,
            quotationNumber: quote.quotationNumber,
            status: quote.status,
            grandTotal: Number(quote.grandTotal),
            submittedAt: quote.submittedAt?.toISOString() ?? null,
          }
        : null,
    };
  }).filter(Boolean);

  return { success: true as const, invitations: data, vendorName: vendor.companyName };
}

// Get specific RFQ details for bidding
export async function getRfqForBidding(rfqId: string) {
  const vendor = await getCurrentVendor();
  if (!vendor) {
    return { success: false as const, error: "Unauthorized or not a Vendor user." };
  }

  // Verify vendor is invited to this RFQ
  const invitation = await db.rfqVendor.findUnique({
    where: { rfqId_vendorId: { rfqId, vendorId: vendor.id } },
  });

  if (!invitation) {
    return { success: false as const, error: "You are not invited to bid on this RFQ." };
  }

  const rfq = await db.rfq.findUnique({
    where: { id: rfqId },
  });

  if (!rfq) {
    return { success: false as const, error: "RFQ not found." };
  }

  const rfqItems = await db.rfqItem.findMany({
    where: { rfqId },
    orderBy: { sortOrder: "asc" },
  });

  if (rfq.status !== "PUBLISHED") {
    return { success: false as const, error: "This RFQ is no longer open for bidding." };
  }

  // Check if a quotation already exists
  const existingQuotation = await db.quotation.findFirst({
    where: { rfqId, vendorId: vendor.id },
  });

  let existingItems: any[] = [];
  if (existingQuotation) {
    existingItems = await db.quotationItem.findMany({
      where: { quotationId: existingQuotation.id },
      orderBy: { sortOrder: "asc" },
    });
  }

  return {
    success: true as const,
    rfq: {
      id: rfq.id,
      rfqNumber: rfq.rfqNumber,
      title: rfq.title,
      deadline: rfq.deadline.toISOString(),
      category: rfq.category,
      description: rfq.description,
      items: rfqItems.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        description: item.description,
        quantity: Number(item.quantity),
        unit: item.unit,
        estimatedUnitPrice: item.estimatedUnitPrice ? Number(item.estimatedUnitPrice) : null,
      })),
    },
    existingQuotation: existingQuotation
      ? {
          id: existingQuotation.id,
          quotationNumber: existingQuotation.quotationNumber,
          status: existingQuotation.status,
          subtotal: Number(existingQuotation.subtotal),
          taxPct: Number(existingQuotation.taxPct),
          taxAmount: Number(existingQuotation.taxAmount),
          grandTotal: Number(existingQuotation.grandTotal),
          deliveryDays: existingQuotation.deliveryDays,
          vendorNotes: existingQuotation.vendorNotes,
          items: existingItems.map((item) => ({
            id: item.id,
            rfqItemId: item.rfqItemId,
            itemName: item.itemName,
            quantity: Number(item.quantity),
            unit: item.unit,
            unitPrice: Number(item.unitPrice),
            lineTotal: Number(item.lineTotal),
          })),
        }
      : null,
  };
}

export interface QuotationPayload {
  rfqId: string;
  subtotal: number;
  taxPct: number;
  taxAmount: number;
  grandTotal: number;
  deliveryDays: number;
  vendorNotes?: string;
  isDraft?: boolean;
  items: Array<{
    rfqItemId?: string;
    itemName: string;
    description?: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
  }>;
}

// Submit or save a draft quotation
export async function submitQuotation(payload: QuotationPayload) {
  const session = await auth();
  const vendor = await getCurrentVendor();
  if (!session?.user?.id || !vendor) {
    return { success: false as const, error: "Unauthorized or not a Vendor user." };
  }

  const rfqId = payload.rfqId;

  // Verify invitation
  const invitation = await db.rfqVendor.findUnique({
    where: { rfqId_vendorId: { rfqId, vendorId: vendor.id } },
  });

  if (!invitation) {
    return { success: false as const, error: "You are not invited to bid on this RFQ." };
  }

  const rfq = await db.rfq.findUnique({
    where: { id: rfqId },
    select: { id: true, rfqNumber: true, title: true, createdBy: true, status: true },
  });

  if (!rfq || rfq.status !== "PUBLISHED") {
    return { success: false as const, error: "RFQ is no longer open for bidding." };
  }

  const isDraft = payload.isDraft ?? false;

  return db.$transaction(async (tx) => {
    // Check for existing quotation
    const existing = await tx.quotation.findFirst({
      where: { rfqId, vendorId: vendor.id },
      select: { id: true, quotationNumber: true, revision: true },
    });

    let quotationId = existing?.id;
    let quotationNumber = existing?.quotationNumber;
    let revision = existing?.revision ?? 1;

    if (existing) {
      // If it exists, we are updating or submitting a draft revision
      if (!isDraft) {
        revision += 1;
      }
      await tx.quotationItem.deleteMany({ where: { quotationId: existing.id } });
    } else {
      // Create new quotation number
      const qCount = await tx.quotation.count();
      const year = new Date().getFullYear();
      quotationNumber = `QTN-${year}-${String(qCount + 1).padStart(5, "0")}`;
    }

    const quotationData = {
      rfqId,
      vendorId: vendor.id,
      quotationNumber: quotationNumber!,
      status: (isDraft ? "DRAFT" : "SUBMITTED") as QuotationStatus,
      subtotal: payload.subtotal,
      taxPct: payload.taxPct,
      taxAmount: payload.taxAmount,
      grandTotal: payload.grandTotal,
      deliveryDays: payload.deliveryDays,
      vendorNotes: payload.vendorNotes ?? null,
      submittedAt: isDraft ? null : new Date(),
      submittedBy: session!.user!.id as string,
      revision,
    };

    let quotation;
    if (existing) {
      quotation = await tx.quotation.update({
        where: { id: existing.id },
        data: quotationData,
      });
    } else {
      quotation = await tx.quotation.create({
        data: quotationData,
      });
      quotationId = quotation.id;
    }

    // Insert quotation line items
    await tx.quotationItem.createMany({
      data: payload.items.map((item, index) => ({
        quotationId: quotationId!,
        rfqItemId: item.rfqItemId ?? null,
        itemName: item.itemName,
        description: item.description ?? null,
        quantity: item.quantity,
        unit: item.unit ?? null,
        unitPrice: item.unitPrice,
        lineTotal: item.quantity * item.unitPrice, // Manually calculate lineTotal since database constraints are removed
        sortOrder: index,
      })),
    });

    if (!isDraft) {
      // Update RFQ quotation count
      await tx.rfq.update({
        where: { id: rfqId },
        data: { quotationCount: { increment: existing ? 0 : 1 } },
      });

      // Create notification for the procurement officer who created the RFQ
      await tx.notification.create({
        data: {
          userId: rfq.createdBy,
          type: "QUOTATION_RECEIVED",
          title: `Quotation Received: ${quotationNumber}`,
          message: `${vendor.companyName} has submitted a quotation for RFQ ${rfq.rfqNumber}. Total Amount: ₹${payload.grandTotal.toLocaleString("en-IN")}.`,
          entityType: "QUOTATION",
          entityId: quotationId!,
        },
      });

      // Create activity log
      await tx.activityLog.create({
        data: {
          entityType: "QUOTATION",
          entityId: quotationId!,
          action: "SUBMITTED",
          actorId: session!.user!.id as string,
          description: `Quotation ${quotationNumber} submitted by ${vendor.companyName} for RFQ ${rfq.rfqNumber} (Rev ${revision}).`,
        },
      });
    }

    return {
      success: true as const,
      quotation: { id: quotationId!, quotationNumber, status: quotationData.status },
    };
  });
}
