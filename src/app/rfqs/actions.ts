"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { RfqListItem, RfqStats, RfqStatusTab, RfqTabCounts } from "@/lib/rfqs";
import type { RfqStatus } from "@prisma/client";

export interface RFQFilters {
  search?: string;
  status?: RfqStatusTab;
  page?: number;
  limit?: number;
}

export interface PaginatedRFQs {
  data: RfqListItem[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
  stats: RfqStats;
  counts: RfqTabCounts;
}

function buildWhere(filters: RFQFilters) {
  const where: {
    OR?: Array<Record<string, unknown>>;
    status?: RfqStatus;
  } = {};

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { rfqNumber: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  return where;
}

function serializeRfq(
  rfq: {
    id: string;
    rfqNumber: string;
    title: string;
    status: RfqStatus;
    deadline: Date;
    quotationCount: number;
    createdAt: Date;
    createdBy: string;
  },
  userMap: Map<string, { id: string; firstName: string; lastName: string }>
): RfqListItem {
  const user = userMap.get(rfq.createdBy) ?? {
    id: rfq.createdBy,
    firstName: "Unknown",
    lastName: "User",
  };

  return {
    id: rfq.id,
    rfqNumber: rfq.rfqNumber,
    title: rfq.title,
    status: rfq.status,
    deadline: rfq.deadline.toISOString(),
    quotationCount: rfq.quotationCount,
    createdAt: rfq.createdAt.toISOString(),
    createdBy: user,
  };
}

export async function getRFQs(filters: RFQFilters = {}): Promise<PaginatedRFQs> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 10));
  const skip = (page - 1) * limit;
  const where = buildWhere(filters);

  const [rfqs, total, statusCounts] = await Promise.all([
    db.rfq.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        rfqNumber: true,
        title: true,
        status: true,
        deadline: true,
        quotationCount: true,
        createdAt: true,
        createdBy: true,
      },
    }),
    db.rfq.count({ where }),
    Promise.all([
      db.rfq.count(),
      db.rfq.count({ where: { status: "DRAFT" } }),
      db.rfq.count({ where: { status: "PUBLISHED" } }),
      db.rfq.count({ where: { status: "CLOSED" } }),
      db.rfq.count({ where: { status: "CANCELLED" } }),
      db.rfq.count({ where: { status: "AWARDED" } }),
    ]),
  ]);

  const creatorIds = [...new Set(rfqs.map((rfq) => rfq.createdBy))];
  const creators = creatorIds.length
    ? await db.user.findMany({
        where: { id: { in: creatorIds } },
        select: { id: true, firstName: true, lastName: true },
      })
    : [];

  const userMap = new Map(creators.map((user) => [user.id, user]));
  const [all, draft, published, closed, cancelled, awarded] = statusCounts;

  return {
    data: rfqs.map((rfq) => serializeRfq(rfq, userMap)),
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    },
    stats: {
      total: all,
      draft,
      published,
      closedAndAwarded: closed + awarded,
    },
    counts: {
      all,
      draft,
      published,
      closed,
      cancelled,
      awarded,
    },
  };
}

export async function submitRfqForApprovalAction(data: { rfqId: string; quotationId: string; vendorId: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized." };
  }

  // Find a manager to assign to (fallback)
  const manager = await db.user.findFirst({
    where: { role: "MANAGER" },
    select: { id: true },
  });

  return db.$transaction(async (tx) => {
    // Check if there is already a pending approval for this RFQ
    const existingApproval = await tx.approval.findFirst({
      where: { rfqId: data.rfqId, status: "PENDING" },
    });

    if (existingApproval) {
      return { success: false as const, error: "This RFQ is already under review." };
    }

    // Create the approval record
    const approval = await tx.approval.create({
      data: {
        rfqId: data.rfqId,
        quotationId: data.quotationId,
        vendorId: data.vendorId,
        status: "PENDING",
        requestedBy: session!.user!.id as string,
        assignedTo: manager?.id ?? null,
      },
    });

    // Update RFQ status to CLOSED (under review)
    await tx.rfq.update({
      where: { id: data.rfqId },
      data: { status: "CLOSED" },
    });

    // Notify Manager
    if (manager?.id) {
      await tx.notification.create({
        data: {
          userId: manager.id,
          type: "APPROVAL_REQUESTED",
          title: "Approval Requested",
          message: `Approval requested for RFQ. Selected Quotation ID: ${data.quotationId}.`,
          entityType: "APPROVAL",
          entityId: approval.id,
        },
      });
    }

    // Log Activity
    await tx.activityLog.create({
      data: {
        entityType: "RFQ",
        entityId: data.rfqId,
        action: "PUBLISHED", // Fallback action type compatible with DB
        actorId: session!.user!.id as string,
        description: `RFQ submitted for approval. Selected Quotation ID: ${data.quotationId}.`,
        metadata: { quotationId: data.quotationId, vendorId: data.vendorId },
      },
    });

    return { success: true as const, approvalId: approval.id };
  });
}

