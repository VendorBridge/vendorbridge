"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  FileText,
  Save,
  Send,
  Loader2,
  Hash,
  MapPin,
  CreditCard,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { LineItemsTable } from "@/components/rfqs/LineItemsTable";
import { VendorMultiSelect } from "@/components/rfqs/VendorMultiSelect";
import { AttachmentUpload } from "@/components/rfqs/AttachmentUpload";
import { RfqFormSkeleton } from "@/components/rfqs/RfqFormSkeleton";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, VENDOR_CATEGORIES } from "@/lib/vendors";
import {
  defaultRfqFormValues,
  RFQ_DRAFT_STORAGE_KEY,
  rfqDraftSchema,
  rfqSchema,
  type RfqFormValues,
} from "@/lib/rfq-schema";

function NewRfqPageContent() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [rfqId, setRfqId] = useState<string | null>(null);
  const [rfqNumber, setRfqNumber] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const form = useForm<RfqFormValues>({
    resolver: zodResolver(rfqSchema) as any,
    defaultValues: defaultRfqFormValues,
    mode: "onTouched",
  });

  const category = form.watch("category");

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(RFQ_DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.deadline) parsed.deadline = new Date(parsed.deadline);
        if (parsed.rfqId) setRfqId(parsed.rfqId);
        if (parsed.rfqNumber) setRfqNumber(parsed.rfqNumber);
        form.reset({ ...defaultRfqFormValues, ...parsed });
        toast("info", "Recovered unsaved draft from your last session.");
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, [form, toast]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      setIsDirty(form.formState.isDirty);
      try {
        localStorage.setItem(
          RFQ_DRAFT_STORAGE_KEY,
          JSON.stringify({ ...values, rfqId, rfqNumber })
        );
      } catch {
        /* storage full */
      }
    });
    return () => subscription.unsubscribe();
  }, [form, rfqId, rfqNumber]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty && !isPublishing) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, isPublishing]);

  const persistDraft = useCallback(
    async (values: RfqFormValues) => {
      const draftPayload = rfqDraftSchema.parse({
        ...values,
        lineItems: values.lineItems?.length ? values.lineItems : undefined,
        vendorIds: values.vendorIds?.length ? values.vendorIds : undefined,
      });

      const url = rfqId ? `/api/rfqs/${rfqId}` : "/api/rfqs";
      const method = rfqId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftPayload),
      });
      const data = await res.json();

      if (!data.success) {
        if (data.errors) {
          data.errors.forEach((err: { field: string; message: string }) => {
            form.setError(err.field as keyof RfqFormValues, { message: err.message });
          });
        }
        throw new Error(data.error ?? "Failed to save draft.");
      }

      setRfqId(data.rfq.id);
      setRfqNumber(data.rfq.rfqNumber);
      form.reset(values, { keepDirty: false });
      setIsDirty(false);
      localStorage.removeItem(RFQ_DRAFT_STORAGE_KEY);
      return data.rfq;
    },
    [rfqId, form]
  );

  const handleSaveDraft = async () => {
    const title = form.getValues("title");
    if (!title?.trim()) {
      form.setError("title", { message: "Required" });
      toast("error", "Title is required to save a draft.");
      return;
    }

    setIsSaving(true);
    try {
      const values = form.getValues();
      const rfq = await persistDraft(values);
      toast("success", `Draft saved as ${rfq.rfqNumber}.`);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to save draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    const valid = await form.trigger();
    if (!valid) {
      toast("error", "Please fix validation errors before publishing.");
      return;
    }

    const values = form.getValues();
    const publishCheck = rfqSchema.safeParse(values);
    if (!publishCheck.success) {
      publishCheck.error.issues.forEach((e) => {
        form.setError(e.path.join(".") as keyof RfqFormValues, { message: e.message });
      });
      toast("error", "Please complete all required fields before publishing.");
      return;
    }

    setIsPublishing(true);
    try {
      let id = rfqId;
      if (!id) {
        const draft = await persistDraft(values);
        id = draft.id;
      } else {
        await persistDraft(values);
      }

      const res = await fetch(`/api/rfqs/${id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!data.success) {
        if (data.errors) {
          data.errors.forEach((err: { field: string; message: string }) => {
            form.setError(err.field as keyof RfqFormValues, { message: err.message });
          });
        }
        throw new Error(data.error ?? "Failed to publish RFQ.");
      }

      setRfqNumber(data.rfq.rfqNumber);
      setIsDirty(false);
      localStorage.removeItem(RFQ_DRAFT_STORAGE_KEY);
      toast("success", `${data.rfq.rfqNumber} published and sent to vendors!`);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to publish RFQ.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (!mounted) return <RfqFormSkeleton />;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div
        className={cn(
          "transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              Create RFQ
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              Request quotations from vendors for your procurement needs
            </p>
          </div>
          {rfqNumber && (
            <Badge variant="success" className="text-sm py-1.5 px-3 gap-1.5">
              <Hash className="size-3.5" />
              {rfqNumber}
            </Badge>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Two-column layout */}
          <div
            className={cn(
              "grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
            style={{ transitionDelay: "100ms" }}
          >
            {/* Left: Form fields */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-4 text-[hsl(var(--primary))]" />
                  RFQ Details
                </CardTitle>
                <CardDescription>
                  Basic information about this request for quotation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RFQ Title *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Office IT Equipment Procurement Q3"
                          className="rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            form.setValue("vendorIds", [], { shouldDirty: true });
                          }}
                          className="rounded-xl"
                        >
                          {VENDOR_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {CATEGORY_LABELS[cat]}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          min={today}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder="Describe the scope, requirements, and any special conditions..."
                          className="rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <FormField
                    control={form.control}
                    name="deliveryLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          Delivery Location
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="City / address" className="rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <CreditCard className="size-3.5" />
                          Payment Terms
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Net 30 days" className="rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="specialNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <StickyNote className="size-3.5" />
                        Special Notes
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={2}
                          placeholder="Any additional instructions for vendors..."
                          className="rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Right: Actions */}
            <div className="space-y-4">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>
                    Save your progress or publish to invite vendors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1">
                      RFQ Number
                    </p>
                    <p className="text-lg font-bold text-[hsl(var(--foreground))]">
                      {rfqNumber ?? "Assigned on first save"}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                      Format: RFQ-{new Date().getFullYear()}-XXXXX
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleSaveDraft}
                    disabled={isSaving || isPublishing}
                    className="w-full gap-2 rounded-xl"
                  >
                    {isSaving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    Save as Draft
                  </Button>

                  <Button
                    type="button"
                    size="lg"
                    onClick={handlePublish}
                    disabled={isSaving || isPublishing}
                    className={cn(
                      "w-full gap-2 rounded-xl shadow-md relative overflow-hidden",
                      "shadow-[hsl(var(--primary))]/20 hover:shadow-lg hover:shadow-[hsl(var(--primary))]/30"
                    )}
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(249,82%,50%) 0%, hsl(262,80%,55%) 100%)",
                    }}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center gap-2 transition-opacity",
                        isPublishing && "opacity-0"
                      )}
                    >
                      <Send className="size-4" />
                      Save &amp; Send to Vendors
                    </span>
                    {isPublishing && (
                      <span className="absolute inset-0 flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Publishing...
                      </span>
                    )}
                  </Button>

                  <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
                    Publishing requires at least 1 line item and 1 vendor
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Line Items */}
          <div
            className={cn(
              "transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
            style={{ transitionDelay: "200ms" }}
          >
            <LineItemsTable />
          </div>

          {/* Vendors */}
          <div
            className={cn(
              "transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
            style={{ transitionDelay: "300ms" }}
          >
            <VendorMultiSelect category={category} />
          </div>

          {/* Attachments */}
          <div
            className={cn(
              "transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
            style={{ transitionDelay: "400ms" }}
          >
            <AttachmentUpload rfqId={rfqId} />
          </div>

          <div className="flex justify-start pt-2">
            <Link
              href="/dashboard"
              className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default function NewRfqPage() {
  return (
    <ToastProvider>
      <NewRfqPageContent />
    </ToastProvider>
  );
}
