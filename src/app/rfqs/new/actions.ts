"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateRfqNumber } from "@/lib/rfqs";
import {
  rfqDraftSchema,
  rfqSchema,
  type RfqDraftFormValues,
  type RfqFormValues,
} from "@/lib/rfq-schema";
import type { Prisma } from "@prisma/client";

async function getCreatedBy(): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  const fallback = await db.user.findFirst({
    where: { role: "PROCUREMENT_OFFICER" },
    select: { id: true },
  });
  return fallback?.id ?? null;
}

export interface RfqPayload {
  title: string;
  category: RfqFormValues["category"];
  deadline?: Date;
  description?: string;
  deliveryLocation?: string;
  paymentTerms?: string;
  specialNotes?: string;
  lineItems?: RfqFormValues["lineItems"];
  vendorIds?: string[];
  attachments?: RfqFormValues["attachments"];
}

async function syncRfqChildren(
  rfqId: string,
  data: RfqPayload,
  uploadedBy: string
) {
  await db.rfqItem.deleteMany({ where: { rfqId } });
  await db.rfqVendor.deleteMany({ where: { rfqId } });

  if (data.lineItems?.length) {
    await db.rfqItem.createMany({
      data: data.lineItems.map((item, index) => ({
        rfqId,
        itemName: item.itemName,
        description: item.description ?? null,
        quantity: item.quantity,
        unit: item.unit ?? null,
        estimatedUnitPrice: item.estimatedUnitPrice ?? null,
        specifications: item.specifications ?? null,
        sortOrder: index,
      })),
    });
  }

  if (data.vendorIds?.length) {
    await db.rfqVendor.createMany({
      data: data.vendorIds.map((vendorId) => ({ rfqId, vendorId })),
      skipDuplicates: true,
    });
  }

  const existingAttachments = await db.rfqAttachment.findMany({
    where: { rfqId },
    select: { id: true, fileUrl: true },
  });
  const incomingUrls = new Set((data.attachments ?? []).map((a) => a.fileUrl));

  for (const existing of existingAttachments) {
    if (!incomingUrls.has(existing.fileUrl)) {
      await db.rfqAttachment.delete({ where: { id: existing.id } });
    }
  }

  for (const att of data.attachments ?? []) {
    const exists = existingAttachments.some((e) => e.fileUrl === att.fileUrl);
    if (!exists) {
      await db.rfqAttachment.create({
        data: {
          rfqId,
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileSize: att.fileSize ?? null,
          mimeType: att.mimeType ?? null,
          uploadedBy,
        },
      });
    }
  }
}

export async function createRfqDraft(raw: Partial<RfqDraftFormValues>) {
  const createdBy = await getCreatedBy();
  if (!createdBy) {
    return { success: false as const, error: "Unauthorized." };
  }

  const parsed = rfqDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    };
  }

  const data = parsed.data;
  const rfqNumber = await generateRfqNumber();

  const rfq = await db.rfq.create({
    data: {
      rfqNumber,
      title: data.title,
      category: data.category,
      description: data.description ?? null,
      deadline: data.deadline ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deliveryLocation: data.deliveryLocation ?? null,
      paymentTerms: data.paymentTerms ?? null,
      specialNotes: data.specialNotes ?? null,
      status: "DRAFT",
      createdBy,
    },
  });

  await syncRfqChildren(rfq.id, data, createdBy);

  return {
    success: true as const,
    rfq: { id: rfq.id, rfqNumber: rfq.rfqNumber, status: rfq.status },
  };
}

export async function updateRfqDraft(id: string, raw: Partial<RfqDraftFormValues>) {
  const createdBy = await getCreatedBy();
  if (!createdBy) {
    return { success: false as const, error: "Unauthorized." };
  }

  const existing = await db.rfq.findUnique({ where: { id } });
  if (!existing) {
    return { success: false as const, error: "RFQ not found." };
  }
  if (existing.status !== "DRAFT") {
    return { success: false as const, error: "Only draft RFQs can be edited." };
  }

  const parsed = rfqDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    };
  }

  const data = parsed.data;

  const rfq = await db.rfq.update({
    where: { id },
    data: {
      title: data.title,
      category: data.category,
      description: data.description ?? null,
      deadline: data.deadline ?? existing.deadline,
      deliveryLocation: data.deliveryLocation ?? null,
      paymentTerms: data.paymentTerms ?? null,
      specialNotes: data.specialNotes ?? null,
    },
  });

  await syncRfqChildren(id, data, createdBy);

  return {
    success: true as const,
    rfq: { id: rfq.id, rfqNumber: rfq.rfqNumber, status: rfq.status },
  };
}

export async function publishRfq(id: string, raw: Partial<RfqFormValues>) {
  const createdBy = await getCreatedBy();
  if (!createdBy) {
    return { success: false as const, error: "Unauthorized." };
  }

  const existing = await db.rfq.findUnique({ where: { id } });
  if (!existing) {
    return { success: false as const, error: "RFQ not found." };
  }
  if (existing.status !== "DRAFT") {
    return { success: false as const, error: "RFQ is already published or closed." };
  }

  const parsed = rfqSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    };
  }

  const data = parsed.data;

  const rfq = await db.rfq.update({
    where: { id },
    data: {
      title: data.title,
      category: data.category,
      description: data.description ?? null,
      deadline: data.deadline,
      deliveryLocation: data.deliveryLocation ?? null,
      paymentTerms: data.paymentTerms ?? null,
      specialNotes: data.specialNotes ?? null,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await syncRfqChildren(id, data, createdBy);

  const vendorLinks = await db.rfqVendor.findMany({
    where: { rfqId: id },
    select: { vendorId: true },
  });

  const vendors = await db.vendor.findMany({
    where: { id: { in: vendorLinks.map((v) => v.vendorId) } },
    select: { id: true, userId: true, companyName: true },
  });

  const notifications: Prisma.NotificationCreateManyInput[] = [];
  for (const vendor of vendors) {
    if (vendor.userId) {
      notifications.push({
        userId: vendor.userId,
        type: "RFQ_PUBLISHED",
        title: `New RFQ: ${rfq.title}`,
        message: `You have been invited to submit a quotation for ${rfq.rfqNumber}. Deadline: ${data.deadline.toLocaleDateString("en-IN")}.`,
        entityType: "RFQ",
        entityId: rfq.id,
      });
    }
  }

  if (notifications.length > 0) {
    await db.notification.createMany({ data: notifications });
  }

  await db.activityLog.create({
    data: {
      entityType: "RFQ",
      entityId: rfq.id,
      action: "PUBLISHED",
      actorId: createdBy,
      description: `RFQ ${rfq.rfqNumber} published and sent to ${vendors.length} vendor(s).`,
      metadata: { vendorIds: vendors.map((v) => v.id) },
    },
  });

  return {
    success: true as const,
    rfq: { id: rfq.id, rfqNumber: rfq.rfqNumber, status: rfq.status },
  };
}

export async function getRfqById(id: string) {
  const rfq = await db.rfq.findUnique({ where: { id } });
  if (!rfq) return null;

  const [items, vendors, attachments] = await Promise.all([
    db.rfqItem.findMany({ where: { rfqId: id }, orderBy: { sortOrder: "asc" } }),
    db.rfqVendor.findMany({ where: { rfqId: id } }),
    db.rfqAttachment.findMany({ where: { rfqId: id } }),
  ]);

  return {
    ...rfq,
    lineItems: items.map((i) => ({
      id: i.id,
      itemName: i.itemName,
      description: i.description ?? undefined,
      quantity: Number(i.quantity),
      unit: i.unit ?? undefined,
      estimatedUnitPrice: i.estimatedUnitPrice ? Number(i.estimatedUnitPrice) : undefined,
      specifications: i.specifications ?? undefined,
    })),
    vendorIds: vendors.map((v) => v.vendorId),
    attachments: attachments.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      fileUrl: a.fileUrl,
      fileSize: a.fileSize ?? undefined,
      mimeType: a.mimeType ?? undefined,
    })),
  };
}

export async function deleteRfqAttachment(rfqId: string, attachmentId: string) {
  const createdBy = await getCreatedBy();
  if (!createdBy) {
    return { success: false as const, error: "Unauthorized." };
  }

  const attachment = await db.rfqAttachment.findFirst({
    where: { id: attachmentId, rfqId },
  });
  if (!attachment) {
    return { success: false as const, error: "Attachment not found." };
  }

  await db.rfqAttachment.delete({ where: { id: attachmentId } });
  return { success: true as const };
}
