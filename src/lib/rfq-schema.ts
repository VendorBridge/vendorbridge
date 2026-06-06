import { z } from "zod";
import { VendorCategory } from "@prisma/client";

export const vendorCategoryEnum = z.enum([
  "IT_HARDWARE",
  "IT_SOFTWARE",
  "FURNITURE",
  "STATIONERY",
  "LOGISTICS",
  "FACILITY",
  "MARKETING",
  "FINANCE",
  "OTHER",
] satisfies [VendorCategory, ...VendorCategory[]]);

const lineItemSchema = z.object({
  id: z.string().optional(),
  itemName: z.string().min(1, "Required"),
  description: z.string().optional(),
  quantity: z.number({ error: "Required" }).min(0.001, "Must be > 0"),
  unit: z.string().optional(),
  estimatedUnitPrice: z.number().optional(),
  specifications: z.string().optional(),
});

const attachmentSchema = z.object({
  id: z.string().optional(),
  fileName: z.string(),
  fileUrl: z.string(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
});

export const rfqDraftSchema = z.object({
  title: z.string().min(1, "Required").max(300, "Max 300 characters"),
  category: vendorCategoryEnum,
  deadline: z.coerce.date().optional(),
  description: z.string().optional(),
  deliveryLocation: z.string().max(300).optional(),
  paymentTerms: z.string().max(200).optional(),
  specialNotes: z.string().optional(),
  lineItems: z.array(lineItemSchema).optional(),
  vendorIds: z.array(z.string()).optional(),
  attachments: z.array(attachmentSchema).optional(),
});

export const rfqSchema = z.object({
  title: z.string().min(1, "Required").max(300, "Max 300 characters"),
  category: vendorCategoryEnum,
  deadline: z.coerce
    .date({ error: "Required" })
    .refine((d) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d >= today;
    }, "Must be a future date"),
  description: z.string().optional(),
  deliveryLocation: z.string().max(300).optional(),
  paymentTerms: z.string().max(200).optional(),
  specialNotes: z.string().optional(),
  lineItems: z
    .array(lineItemSchema)
    .min(1, "At least one line item required"),
  vendorIds: z.array(z.string()).min(1, "At least one vendor required"),
  attachments: z.array(attachmentSchema).optional(),
});

export type RfqFormValues = z.infer<typeof rfqSchema>;
export type RfqDraftFormValues = z.infer<typeof rfqDraftSchema>;
export type RfqLineItemFormValues = z.infer<typeof lineItemSchema>;
export type RfqAttachmentFormValues = z.infer<typeof attachmentSchema>;

export const RFQ_DRAFT_STORAGE_KEY = "vendorbridge-rfq-draft";

export const defaultLineItem = (): RfqLineItemFormValues => ({
  id: crypto.randomUUID(),
  itemName: "",
  quantity: 1,
  unit: "pcs",
});

export const defaultRfqFormValues: RfqFormValues = {
  title: "",
  category: "OTHER",
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  description: "",
  deliveryLocation: "",
  paymentTerms: "",
  specialNotes: "",
  lineItems: [defaultLineItem()],
  vendorIds: [],
  attachments: [],
};
