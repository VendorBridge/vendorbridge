"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  FileText,
  User,
  CreditCard,
  Truck,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getApprovalById, approveApprovalAction, rejectApprovalAction } from "../actions";

// ─────────────────────────────────────────────────────
// Format currency
// ─────────────────────────────────────────────────────
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ApprovalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  
  const [remarks, setRemarks] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [actionResult, setActionResult] = useState<"approved" | "rejected" | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchApproval();
  }, [id]);

  const fetchApproval = async () => {
    setLoading(true);
    try {
      const res = await getApprovalById(id);
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load approval details.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const res = await approveApprovalAction(id, remarks);
      if (res.success) {
        setActionResult("approved");
        setTimeout(() => {
          router.push("/approvals");
        }, 2000);
      } else {
        alert(res.error || "Approval failed.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      alert("Please enter remarks to state the reason for rejection.");
      return;
    }
    setIsRejecting(true);
    try {
      const res = await rejectApprovalAction(id, remarks);
      if (res.success) {
        setActionResult("rejected");
        setTimeout(() => {
          router.push("/approvals");
        }, 2000);
      } else {
        alert(res.error || "Rejection failed.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setIsRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[hsl(var(--primary))]"></div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading approval details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-red-500/10 text-red-500">
          <AlertTriangle className="size-8" />
        </div>
        <h2 className="text-xl font-bold">Error Loading Approval</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{error || "Approval details could not be found."}</p>
        <Button onClick={() => router.push("/approvals")} variant="outline" className="gap-2 rounded-xl">
          <ArrowLeft className="size-4" /> Back to Approvals
        </Button>
      </div>
    );
  }

  const { rfq, vendor, quotation, status, priority, createdAt } = data;

  // Stepper logic
  const steps = [
    { number: 1, label: "Submitted", status: "completed" as const },
    {
      number: 2,
      label: "Review",
      status: status === "PENDING" ? ("active" as const) : ("completed" as const),
    },
    {
      number: 3,
      label: status === "REJECTED" ? "Rejected" : "PO Issued",
      status:
        status === "PENDING"
          ? ("upcoming" as const)
          : status === "REJECTED"
          ? ("rejected" as const)
          : ("completed" as const),
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto space-y-8">
      {/* Toast notifications */}
      {actionResult && (
        <div
          className={cn(
            "fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl",
            "animate-in slide-in-from-right-5 fade-in duration-300",
            actionResult === "approved"
              ? "bg-emerald-500 text-white shadow-emerald-500/30"
              : "bg-red-500 text-white shadow-red-500/30"
          )}
        >
          {actionResult === "approved" ? (
            <CheckCircle2 className="size-5" />
          ) : (
            <XCircle className="size-5" />
          )}
          <span className="font-medium text-sm">
            {actionResult === "approved"
              ? "Approval granted! Purchase Order has been generated."
              : "Approval rejected. The requester has been notified."}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-4">
        <Button
          onClick={() => router.push("/approvals")}
          variant="ghost"
          size="sm"
          className="gap-2 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft className="size-4" /> Back to Approvals
        </Button>

        <div
          className={cn(
            "transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                Approval Review
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                <FileText className="size-3.5 text-[hsl(var(--primary))]" />
                <span>
                  RFQ:{" "}
                  <span className="font-medium text-[hsl(var(--foreground))]">
                    {rfq?.title || "N/A"}
                  </span>
                </span>
                <span className="text-[hsl(var(--border))]">•</span>
                <span>
                  Number:{" "}
                  <span className="font-medium text-[hsl(var(--foreground))]">{rfq?.rfqNumber}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Priority:</span>
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-semibold border",
                  priority === "HIGH"
                    ? "bg-red-500/10 text-red-600 border-red-500/20"
                    : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                )}
              >
                {priority}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Stepper */}
      <div
        className={cn(
          "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 lg:p-8",
          "transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
      >
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-5 right-5 h-[2px] bg-[hsl(var(--border))]" />
          <div
            className={cn(
              "absolute top-5 left-5 h-[2px] transition-all duration-1000",
              status === "APPROVED" ? "bg-emerald-500 w-[100%]" : status === "REJECTED" ? "bg-red-500 w-[100%]" : "bg-emerald-500 w-[50%]"
            )}
          />

          {steps.map((step) => {
            const isCompleted = step.status === "completed";
            const isActive = step.status === "active";
            const isRejected = step.status === "rejected";

            return (
              <div key={step.number} className="relative z-10 flex flex-col items-center gap-2">
                {isCompleted ? (
                  <div className="size-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
                    <CheckCircle2 className="size-5" />
                  </div>
                ) : isRejected ? (
                  <div className="size-10 rounded-full bg-red-500 flex items-center justify-center text-white shadow-md shadow-red-500/25">
                    <XCircle className="size-5" />
                  </div>
                ) : isActive ? (
                  <div
                    className="size-10 rounded-full flex items-center justify-center text-white shadow-lg shadow-[hsl(var(--primary))]/30 ring-4 ring-[hsl(var(--primary))]/20"
                    style={{
                      background: "linear-gradient(135deg, hsl(249,82%,50%) 0%, hsl(262,80%,55%) 100%)",
                    }}
                  >
                    <span className="text-sm font-bold">{step.number}</span>
                  </div>
                ) : (
                  <div className="size-10 rounded-full border-2 border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 flex items-center justify-center">
                    <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                      {step.number}
                    </span>
                  </div>
                )}
                <span
                  className={cn(
                    "text-xs font-semibold text-center max-w-[85px] leading-tight",
                    isActive
                      ? "text-[hsl(var(--primary))]"
                      : isCompleted
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isRejected
                      ? "text-red-600 dark:text-red-400"
                      : "text-[hsl(var(--muted-foreground))]"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Details + Quotation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Columns: Quotation Items details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Vendor & Quotation Header Details */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
              Request Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[hsl(var(--muted))]/30 border border-[hsl(var(--border))]/50">
                <User className="size-5 text-[hsl(var(--primary))] shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Vendor</p>
                  <p className="text-sm font-bold text-[hsl(var(--foreground))]">{vendor?.companyName || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[hsl(var(--muted))]/30 border border-[hsl(var(--border))]/50">
                <Calendar className="size-5 text-purple-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Requested On</p>
                  <p className="text-sm font-bold text-[hsl(var(--foreground))]">{new Date(createdAt).toLocaleDateString("en-IN")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quotation Items list */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Quotation Line Items
              </h2>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                Quotation No: <span className="font-semibold text-[hsl(var(--foreground))]">{quotation?.quotationNumber || "N/A"}</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Item</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Qty</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Unit Price</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation?.items?.map((item: any) => (
                    <tr key={item.id} className="border-b border-[hsl(var(--border))]/50 last:border-0 hover:bg-[hsl(var(--accent))]/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-medium">{item.itemName}</div>
                        {item.description && <div className="text-xs text-[hsl(var(--muted-foreground))]">{item.description}</div>}
                      </td>
                      <td className="py-3 px-3 text-center">{item.quantity} {item.unit || "units"}</td>
                      <td className="py-3 px-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 px-3 text-right font-semibold">{formatCurrency(item.lineTotal || (item.quantity * item.unitPrice))}</td>
                    </tr>
                  ))}
                  {!quotation?.items?.length && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-[hsl(var(--muted-foreground))]">No line items in this quotation.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks input or displayed remarks if already decided */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-3">
            <h2 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
              {status === "PENDING" ? "Approval Remarks" : "Decision Details"}
            </h2>
            
            {status === "PENDING" ? (
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                placeholder="Add your comments, conditions or rejection reasons..."
                className="w-full bg-[hsl(var(--muted))]/40 text-sm text-[hsl(var(--foreground))] rounded-xl px-4 py-3 border border-[hsl(var(--border))] resize-none focus:border-[hsl(var(--ring))] focus:bg-[hsl(var(--background))] outline-none transition-colors"
              />
            ) : (
              <div className="p-4 rounded-xl bg-[hsl(var(--muted))]/30 border border-[hsl(var(--border))]/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Decision:</span>
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full border",
                    status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                  )}>
                    {status}
                  </span>
                </div>
                {data.remarks && (
                  <div>
                    <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Remarks:</span>
                    <p className="text-sm text-[hsl(var(--foreground))] mt-0.5 italic">"{data.remarks}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Sticky Quotation Summary + Actions */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sticky top-24 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-4">
                Financial Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                    <Layers className="size-4" />
                    <span>Subtotal</span>
                  </div>
                  <span className="font-semibold text-[hsl(var(--foreground))]">
                    {formatCurrency(quotation?.subtotal || 0)}
                  </span>
                </div>

                {quotation?.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(quotation.discountAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                    <AlertTriangle className="size-4" />
                    <span>Tax Amount ({quotation?.taxPct || 18}%)</span>
                  </div>
                  <span className="font-semibold text-[hsl(var(--foreground))]">
                    {formatCurrency(quotation?.taxAmount || 0)}
                  </span>
                </div>

                <div className="border-t border-[hsl(var(--border))] my-3" />

                <div className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                    <CreditCard className="size-4" />
                    <span className="font-bold">Grand Total</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: "hsl(249, 82%, 56%)" }}>
                    {formatCurrency(quotation?.grandTotal || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                    <Truck className="size-4" />
                    <span>Delivery Terms</span>
                  </div>
                  <span className="font-medium text-[hsl(var(--foreground))]">
                    {quotation?.deliveryDays ? `${quotation.deliveryDays} Days` : quotation?.deliveryTerms || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons (only visible if status is PENDING) */}
            {status === "PENDING" && (
              <div className="space-y-3">
                <Button
                  onClick={handleApprove}
                  disabled={isApproving || isRejecting}
                  className="w-full gap-2 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25 transition-all"
                  size="lg"
                >
                  <CheckCircle2 className="size-4" />
                  {isApproving ? "Approving..." : "Approve & Generate PO"}
                </Button>

                <Button
                  onClick={handleReject}
                  disabled={isApproving || isRejecting}
                  variant="outline"
                  className="w-full gap-2 rounded-xl font-semibold border-red-500/30 text-red-600 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                  size="lg"
                >
                  <XCircle className="size-4" />
                  {isRejecting ? "Rejecting..." : "Reject Request"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
