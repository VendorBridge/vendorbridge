import { db } from "@/lib/db";
import type { RfqStatus } from "@prisma/client";

export type RfqStatusTab = "ALL" | RfqStatus;

export interface RfqListItem {
  id: string;
  rfqNumber: string;
  title: string;
  status: RfqStatus;
  deadline: string;
  quotationCount: number;
  createdAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface RfqStats {
  total: number;
  draft: number;
  published: number;
  closedAndAwarded: number;
}

export interface RfqTabCounts {
  all: number;
  draft: number;
  published: number;
  closed: number;
  cancelled: number;
  awarded: number;
}

export const RFQ_STATUS_LABELS: Record<RfqStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
  AWARDED: "Awarded",
};

export function formatRfqStatus(status: RfqStatus): string {
  return RFQ_STATUS_LABELS[status] ?? status;
}

export function formatRfqCreatorName(user: { firstName: string; lastName: string }): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function truncateTitle(title: string, maxLength = 50): string {
  if (title.length <= maxLength) return title;
  return `${title.slice(0, maxLength).trimEnd()}…`;
}

export function formatRfqDeadline(deadline: string | Date): string {
  const date = typeof deadline === "string" ? new Date(deadline) : deadline;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function isRfqPastDue(deadline: string | Date): boolean {
  const date = typeof deadline === "string" ? new Date(deadline) : deadline;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDay = new Date(date);
  deadlineDay.setHours(0, 0, 0, 0);
  return deadlineDay < today;
}

export async function generateRfqNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RFQ-${year}-`;

  return db.$transaction(async (tx) => {
    const existing = await tx.rfqSequence.findUnique({ where: { year } });

    if (!existing) {
      const lastRfq = await tx.rfq.findFirst({
        where: { rfqNumber: { startsWith: prefix } },
        orderBy: { rfqNumber: "desc" },
        select: { rfqNumber: true },
      });

      let start = 0;
      if (lastRfq) {
        const match = lastRfq.rfqNumber.match(/-(\d{5})$/);
        if (match) start = parseInt(match[1], 10);
      }

      const seq = await tx.rfqSequence.create({
        data: { year, lastNumber: start + 1 },
      });
      return `${prefix}${String(seq.lastNumber).padStart(5, "0")}`;
    }

    const seq = await tx.rfqSequence.update({
      where: { year },
      data: { lastNumber: { increment: 1 } },
    });
    return `${prefix}${String(seq.lastNumber).padStart(5, "0")}`;
  });
}

export async function getActiveVendorsByCategory(category?: string) {
  const where: {
    status: "ACTIVE";
    category?: import("@prisma/client").VendorCategory;
  } = { status: "ACTIVE" };

  if (category) {
    where.category = category as import("@prisma/client").VendorCategory;
  }

  const vendors = await db.vendor.findMany({
    where,
    orderBy: { companyName: "asc" },
    select: {
      id: true,
      companyName: true,
      category: true,
      rating: true,
    },
  });

  return vendors.map((v) => ({
    ...v,
    rating: v.rating != null ? Number(v.rating) : null,
  }));
}
