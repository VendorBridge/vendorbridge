"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Calendar,
  Package,
  Send,
  Save,
  Trash2,
  Plus,
  Info,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import {
  getVendorInvitations,
  getRfqForBidding,
  submitQuotation,
  type QuotationPayload,
} from "./actions";

// Format currency helper
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function QuotationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rfqId = searchParams.get("rfqId");

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendorName, setVendorName] = useState("");
  
  // Dashboard state (no rfqId selected)
  const [invitations, setInvitations] = useState<any[]>([]);
  
  // Form state (when rfqId is selected)
  const [rfq, setRfq] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [taxPercent, setTaxPercent] = useState(18);
  const [notes, setNotes] = useState("");
  const [deliveryDays, setDeliveryDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch either invitations or a specific RFQ based on rfqId
  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!rfqId) {
      // Load invited RFQs
      getVendorInvitations()
        .then((res) => {
          if (res.success) {
            setInvitations(res.invitations);
            setVendorName(res.vendorName);
          } else {
            setError(res.error);
          }
        })
        .catch(() => setError("Failed to load invitations."))
        .finally(() => setLoading(false));
    } else {
      // Load specific RFQ for bidding
      getRfqForBidding(rfqId)
        .then((res) => {
          if (res.success) {
            setRfq(res.rfq);
            
            if (res.existingQuotation) {
              const q = res.existingQuotation;
              setTaxPercent(q.taxPct);
              setNotes(q.vendorNotes ?? "");
              setDeliveryDays(q.deliveryDays ?? 7);
              setItems(
                q.items.map((i: any) => ({
                  id: i.id,
                  rfqItemId: i.rfqItemId,
                  item: i.itemName,
                  qty: i.quantity,
                  unitPrice: i.unitPrice,
                  deliveryDays: q.deliveryDays ?? 7,
                }))
              );
            } else {
              // Pre-fill items from RFQ
              setItems(
                res.rfq.items.map((i: any) => ({
                  id: i.id,
                  rfqItemId: i.id,
                  item: i.itemName,
                  qty: i.quantity,
                  unitPrice: i.estimatedUnitPrice ?? 0,
                  deliveryDays: 7,
                }))
              );
            }
          } else {
            setError(res.error);
          }
        })
        .catch(() => setError("Failed to load RFQ details."))
        .finally(() => setLoading(false));
    }
  }, [rfqId]);

  // Calculations for totals
  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, row) => sum + row.qty * row.unitPrice, 0);
    const taxAmount = Math.round(subtotal * (taxPercent / 100));
    const grandTotal = subtotal + taxAmount;
    return { subtotal, taxAmount, grandTotal };
  }, [items, taxPercent]);

  // Update item field in grid
  const updateItem = (id: string, field: string, value: string | number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Add new custom item row
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        item: "",
        qty: 1,
        unitPrice: 0,
        deliveryDays: 7,
      },
    ]);
  };

  // Remove custom item row
  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Submit / Save draft handler
  const handleSave = async (isDraft: boolean) => {
    if (!rfqId || !rfq) return;

    if (isDraft) {
      setIsSavingDraft(true);
    } else {
      setIsSubmitting(true);
    }

    const payload: QuotationPayload = {
      rfqId,
      subtotal: calculations.subtotal,
      taxPct: taxPercent,
      taxAmount: calculations.taxAmount,
      grandTotal: calculations.grandTotal,
      deliveryDays,
      vendorNotes: notes,
      isDraft,
      items: items.map((i: any) => ({
        rfqItemId: i.rfqItemId?.startsWith("custom") ? undefined : i.rfqItemId,
        itemName: i.item,
        quantity: i.qty,
        unitPrice: i.unitPrice,
      })),
    };

    try {
      const res = await submitQuotation(payload);
      if (res.success) {
        setSuccessMessage(
          isDraft ? "Draft quotation saved!" : "Quotation submitted successfully!"
        );
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push("/quotations");
        }, 2000);
      } else {
        alert(res.error || "An error occurred while saving.");
      }
    } catch (err) {
      alert("Failed to submit quotation. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsSavingDraft(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="size-8 animate-spin text-[hsl(var(--primary))]" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading bidding details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 max-w-[900px] mx-auto text-center space-y-4">
        <div className="inline-flex size-12 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center text-red-500">
          <Info className="size-6" />
        </div>
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Access Issue</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md mx-auto">{error}</p>
        <div className="pt-2">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // VIEW: Invitations Dashboard List (No rfqId selected)
  // ─────────────────────────────────────────────────────────────────
  if (!rfqId) {
    return (
      <div className="p-6 lg:p-8 max-w-[1100px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              RFQ Invitations
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              Welcome, <span className="font-semibold text-[hsl(var(--primary))]">{vendorName}</span>. Review your procurement invites below.
            </p>
          </div>
        </div>

        {invitations.length === 0 ? (
          <div className="border border-dashed border-[hsl(var(--border))] rounded-2xl p-12 text-center space-y-4 bg-[hsl(var(--card))]">
            <div className="inline-flex size-12 rounded-full bg-[hsl(var(--muted))]/50 items-center justify-center text-[hsl(var(--muted-foreground))]">
              <Package className="size-6" />
            </div>
            <h3 className="font-semibold text-base">No active invitations</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm mx-auto">
              Your company has not been invited to submit quotations for any active RFQs yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {invitations.map((invite) => (
              <div
                key={invite.rfqId}
                className={cn(
                  "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-5",
                  "hover:border-[hsl(var(--primary))]/30 hover:shadow-lg transition-all duration-200"
                )}
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] uppercase">
                      {invite.category}
                    </span>
                    <h3 className="font-bold text-lg text-[hsl(var(--foreground))] mt-2 line-clamp-1">
                      {invite.title}
                    </h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                      {invite.rfqNumber}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-full",
                      invite.hasSubmitted
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                    )}
                  >
                    {invite.hasSubmitted ? "Quotation Submitted" : "Pending Bid"}
                  </span>
                </div>

                <div className="border-t border-[hsl(var(--border))] pt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[hsl(var(--muted-foreground))]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    <span>Deadline: {new Date(invite.deadline).toLocaleDateString("en-IN")}</span>
                  </div>
                  {invite.hasSubmitted && invite.quotation && (
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <FileCheck className="size-3.5" />
                      <span>Submitted: {formatCurrency(invite.quotation.grandTotal)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => router.push(`/quotations?rfqId=${invite.rfqId}`)}
                    className="w-full rounded-xl gap-2"
                    variant={invite.hasSubmitted ? "outline" : "default"}
                  >
                    {invite.hasSubmitted ? "Edit / Revise Bid" : "Prepare Quotation"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // VIEW: Quotation Submission Editor Form (rfqId is active)
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto space-y-6">
      {/* Success toast */}
      {showSuccess && (
        <div
          className={cn(
            "fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl",
            "bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30",
            "animate-in slide-in-from-right-5 fade-in duration-300"
          )}
        >
          <CheckCircle2 className="size-5" />
          <span className="font-medium text-sm">{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => router.push("/quotations")}
          className="flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Back to Invitations
        </button>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] mt-2">
          Prepare Quotation
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
          <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
            <FileText className="size-3.5 text-[hsl(var(--primary))]" />
            <span>
              RFQ:{" "}
              <span className="font-semibold text-[hsl(var(--foreground))]">
                {rfq.title} ({rfq.rfqNumber})
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
            <Calendar className="size-3.5 text-amber-500" />
            <span>
              Deadline:{" "}
              <span className="font-semibold text-[hsl(var(--foreground))]">
                {new Date(rfq.deadline).toLocaleDateString("en-IN")}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* RFQ Description Summary */}
      {rfq.description && (
        <div className="rounded-2xl p-5 border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10">
          <div className="flex items-start gap-3">
            <Info className="size-4 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                RFQ Description / Requirements
              </h4>
              <p className="text-sm text-[hsl(var(--foreground))] mt-1">
                {rfq.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Item Editor Table */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
            Line Items Bids
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={addItem}
            className="gap-1.5 text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] rounded-lg"
          >
            <Plus className="size-3.5" />
            Add Custom Item
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                <th className="text-left py-3 px-5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[35%]">
                  Item Description
                </th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[12%]">
                  Quantity
                </th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[18%]">
                  Unit Price (₹)
                </th>
                <th className="text-right py-3 px-5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[20%]">
                  Line Total
                </th>
                <th className="py-3 px-3 w-[8%]" />
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[hsl(var(--border))]/50 last:border-0 hover:bg-[hsl(var(--accent))]/30 transition-colors"
                >
                  {/* Item Description */}
                  <td className="py-3 px-5">
                    <input
                      type="text"
                      value={row.item}
                      onChange={(e) => updateItem(row.id, "item", e.target.value)}
                      placeholder="Specify product name / model..."
                      className="w-full bg-transparent border-0 outline-none focus:ring-0 text-sm font-semibold text-[hsl(var(--foreground))]"
                    />
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      value={row.qty}
                      onChange={(e) => updateItem(row.id, "qty", parseInt(e.target.value) || 0)}
                      min={1}
                      className="w-full bg-[hsl(var(--muted))]/40 text-sm text-center font-medium rounded-lg px-2 py-1.5 border border-transparent outline-none focus:border-[hsl(var(--ring))]"
                    />
                  </td>

                  {/* Unit price */}
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      value={row.unitPrice}
                      onChange={(e) => updateItem(row.id, "unitPrice", parseFloat(e.target.value) || 0)}
                      min={0}
                      className="w-full bg-[hsl(var(--muted))]/40 text-sm text-center font-medium rounded-lg px-2 py-1.5 border border-transparent outline-none focus:border-[hsl(var(--ring))]"
                    />
                  </td>

                  {/* Total */}
                  <td className="py-3 px-5 text-right">
                    <span className="text-sm font-bold text-[hsl(var(--foreground))]">
                      {formatCurrency(row.qty * row.unitPrice)}
                    </span>
                  </td>

                  {/* Remove custom row */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => removeItem(row.id)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer disabled:opacity-0"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax, Notes & Timeline Calculations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: General Form parameters */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Delivery Timeline */}
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
              <label className="text-sm font-semibold text-[hsl(var(--foreground))] block mb-2">
                Delivery Timeline
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(parseInt(e.target.value) || 0)}
                  min={1}
                  className="w-full bg-[hsl(var(--muted))]/40 text-sm font-medium rounded-xl px-4 py-2.5 border border-[hsl(var(--border))] outline-none focus:border-[hsl(var(--ring))]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--muted-foreground))]">
                  Days
                </span>
              </div>
            </div>

            {/* GST Percentage */}
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
              <label className="text-sm font-semibold text-[hsl(var(--foreground))] block mb-2">
                GST / Tax Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                  min={0}
                  max={100}
                  className="w-full bg-[hsl(var(--muted))]/40 text-sm font-medium rounded-xl px-4 py-2.5 border border-[hsl(var(--border))] outline-none focus:border-[hsl(var(--ring))]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--muted-foreground))]">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))] block mb-2">
              Bidding Notes & Terms
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Payment terms, warranty details, special conditions..."
              className="w-full bg-[hsl(var(--muted))]/40 text-sm rounded-xl px-4 py-3 border border-[hsl(var(--border))] outline-none focus:border-[hsl(var(--ring))] resize-none"
            />
          </div>
        </div>

        {/* Right: Totals Cards */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Quotation Summary
            </h3>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
                <span className="font-semibold">{formatCurrency(calculations.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">GST ({taxPercent}%)</span>
                <span className="font-semibold">{formatCurrency(calculations.taxAmount)}</span>
              </div>
              <div className="border-t border-[hsl(var(--border))] pt-3 flex justify-between items-center">
                <span className="text-base font-bold text-[hsl(var(--foreground))]">Grand Total</span>
                <span className="text-xl font-bold text-[hsl(var(--primary))]">
                  {formatCurrency(calculations.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]/30 rounded-xl px-4 py-3">
            <TrendingUp className="size-4 shrink-0 text-[hsl(var(--primary))]" />
            <span>Pricing calculations updates instantly on modifying line values.</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="border-t border-[hsl(var(--border))] pt-6 flex gap-3">
        <Button
          size="lg"
          onClick={() => handleSave(false)}
          disabled={isSubmitting || isSavingDraft}
          className="gap-2 rounded-xl px-8 shadow-md"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {isSubmitting ? "Submitting..." : "Submit Quotation"}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => handleSave(true)}
          disabled={isSubmitting || isSavingDraft}
          className="gap-2 rounded-xl px-8"
        >
          {isSavingDraft ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isSavingDraft ? "Saving..." : "Save Draft"}
        </Button>
      </div>
    </div>
  );
}

export default function QuotationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="size-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      }
    >
      <QuotationsContent />
    </Suspense>
  );
}
