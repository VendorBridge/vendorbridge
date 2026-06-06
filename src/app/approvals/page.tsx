"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  ShoppingCart,
  Star,
  Truck,
  CreditCard,
  User,
  AlertTriangle,
  ChevronRight,
  Shield,
  Sparkles,
} from "lucide-react";

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────
type StepStatus = "completed" | "active" | "upcoming";

interface WorkflowStep {
  number: number;
  label: string;
  status: StepStatus;
}

interface Approver {
  name: string;
  role: string;
  status: "approved" | "awaiting" | "rejected" | "pending";
  date?: string;
  avatar: string;
}

// ─────────────────────────────────────────────────────
// Demo data
// ─────────────────────────────────────────────────────
const WORKFLOW_STEPS: WorkflowStep[] = [
  { number: 1, label: "Submitted", status: "completed" },
  { number: 2, label: "L1 Review", status: "completed" },
  { number: 3, label: "L2 Approval", status: "active" },
  { number: 4, label: "Generate PO", status: "upcoming" },
];

const APPROVERS: Approver[] = [
  {
    name: "Rahul Mehta",
    role: "Procurement Head",
    status: "approved",
    date: "May 20, 10:32 AM",
    avatar: "RM",
  },
  {
    name: "Priya Shah",
    role: "Finance Manager",
    status: "awaiting",
    date: "Assigned May 21",
    avatar: "PS",
  },
];

const QUOTATION_SUMMARY = {
  vendor: "Infra Supplies PVT LTD",
  total: "₹1,85,400",
  delivery: "10 days",
  rating: "4.5/5",
};

// ─────────────────────────────────────────────────────
// Format currency for display
// ─────────────────────────────────────────────────────
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─────────────────────────────────────────────────────
// Step indicator icon
// ─────────────────────────────────────────────────────
function StepIcon({ step }: { step: WorkflowStep }) {
  if (step.status === "completed") {
    return (
      <div className="size-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 transition-all">
        <CheckCircle2 className="size-5" />
      </div>
    );
  }
  if (step.status === "active") {
    return (
      <div
        className="size-10 rounded-full flex items-center justify-center text-white shadow-lg shadow-[hsl(var(--primary))]/30 ring-4 ring-[hsl(var(--primary))]/20 transition-all"
        style={{
          background: "linear-gradient(135deg, hsl(249,82%,50%) 0%, hsl(262,80%,55%) 100%)",
        }}
      >
        <span className="text-sm font-bold">{step.number}</span>
      </div>
    );
  }
  return (
    <div className="size-10 rounded-full border-2 border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 flex items-center justify-center transition-all">
      <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
        {step.number}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Approver status badge
// ─────────────────────────────────────────────────────
function ApproverStatusBadge({ status }: { status: Approver["status"] }) {
  const styles = {
    approved: {
      className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: <CheckCircle2 className="size-3" />,
      label: "Approved",
    },
    awaiting: {
      className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
      icon: <Clock className="size-3" />,
      label: "Awaiting",
    },
    rejected: {
      className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
      icon: <XCircle className="size-3" />,
      label: "Rejected",
    },
    pending: {
      className: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20",
      icon: <Clock className="size-3" />,
      label: "Pending",
    },
  };
  const s = styles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        s.className
      )}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────
// Approval Workflow Page
// ─────────────────────────────────────────────────────
export default function ApprovalsPage() {
  const [mounted, setMounted] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [actionResult, setActionResult] = useState<"approved" | "rejected" | null>(null);

  useEffect(() => setMounted(true), []);

  const handleApprove = () => {
    setIsApproving(true);
    setTimeout(() => {
      setIsApproving(false);
      setActionResult("approved");
    }, 1500);
  };

  const handleReject = () => {
    setIsRejecting(true);
    setTimeout(() => {
      setIsRejecting(false);
      setActionResult("rejected");
    }, 1500);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto space-y-8">
      {/* ── Success / Rejection toast ── */}
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
              ? "Approval granted! PO generation initiated."
              : "Approval rejected. Vendor has been notified."}
          </span>
        </div>
      )}

      {/* ── Header ── */}
      <div
        className={cn(
          "transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
          Approval Workflow
        </h1>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">
          <FileText className="size-3.5 text-[hsl(var(--primary))]" />
          <span>
            RFQ:{" "}
            <span className="font-medium text-[hsl(var(--foreground))]">
              Office Furniture Q2
            </span>
          </span>
          <span className="text-[hsl(var(--border))]">•</span>
          <span>
            Vendor:{" "}
            <span className="font-medium text-[hsl(var(--foreground))]">Infra Supplies</span>
          </span>
          <span className="text-[hsl(var(--border))]">•</span>
          <span className="font-semibold text-[hsl(var(--foreground))]">₹1,85,400</span>
        </div>
      </div>

      {/* ── Workflow Stepper ── */}
      <div
        className={cn(
          "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 lg:p-8",
          "transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
        style={{ transitionDelay: "150ms" }}
      >
        <div className="flex items-center justify-between relative">
          {/* Connecting line */}
          <div className="absolute top-5 left-5 right-5 h-[2px] bg-[hsl(var(--border))]" />
          <div
            className="absolute top-5 left-5 h-[2px] bg-emerald-500 transition-all duration-1000"
            style={{ width: "50%" }}
          />

          {WORKFLOW_STEPS.map((step, i) => (
            <div
              key={step.number}
              className={cn(
                "relative z-10 flex flex-col items-center gap-2",
                "transition-all duration-500"
              )}
              style={{ transitionDelay: `${i * 150 + 300}ms` }}
            >
              <StepIcon step={step} />
              <span
                className={cn(
                  "text-xs font-semibold text-center max-w-[80px] leading-tight",
                  step.status === "active"
                    ? "text-[hsl(var(--primary))]"
                    : step.status === "completed"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-[hsl(var(--muted-foreground))]"
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Middle Row: Approval Chain + Quotation Summary ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Approval Chain — 3 cols */}
        <div
          className={cn(
            "lg:col-span-3 space-y-5",
            "transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
          style={{ transitionDelay: "300ms" }}
        >
          {/* Approvers card */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <h2 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-5">
              Approval Chain
            </h2>

            <div className="space-y-1">
              {APPROVERS.map((approver, i) => (
                <div key={approver.name}>
                  <div
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl transition-colors duration-150",
                      approver.status === "awaiting"
                        ? "bg-amber-500/[0.05] dark:bg-amber-500/[0.08] border border-amber-500/15"
                        : "hover:bg-[hsl(var(--accent))]/30"
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "size-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-md",
                        approver.status === "approved"
                          ? "bg-emerald-500 text-white"
                          : "text-white"
                      )}
                      style={
                        approver.status !== "approved"
                          ? {
                              background:
                                "linear-gradient(135deg, hsl(249,82%,50%) 0%, hsl(262,80%,55%) 100%)",
                            }
                          : undefined
                      }
                    >
                      {approver.status === "approved" ? (
                        <CheckCircle2 className="size-5" />
                      ) : (
                        approver.avatar
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">
                          {approver.name}
                        </p>
                        <ApproverStatusBadge status={approver.status} />
                      </div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                        {approver.role}
                      </p>
                    </div>

                    {/* Date */}
                    <p className="text-xs text-[hsl(var(--muted-foreground))] shrink-0 hidden sm:block">
                      {approver.status === "approved" ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {approver.date}
                        </span>
                      ) : (
                        approver.date
                      )}
                    </p>
                  </div>

                  {/* Connector line between approvers */}
                  {i < APPROVERS.length - 1 && (
                    <div className="flex justify-start ml-[29px]">
                      <div className="w-[2px] h-4 bg-[hsl(var(--border))]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Approval Remarks */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <h2 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">
              Approval Remarks
            </h2>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={4}
              placeholder="Add your comments or conditions for approval..."
              className={cn(
                "w-full bg-[hsl(var(--muted))]/40 text-sm text-[hsl(var(--foreground))]",
                "rounded-xl px-4 py-3 border border-[hsl(var(--border))] resize-none",
                "focus:border-[hsl(var(--ring))] focus:bg-[hsl(var(--background))] outline-none",
                "transition-colors duration-200",
                "placeholder:text-[hsl(var(--muted-foreground))]/50"
              )}
            />
          </div>
        </div>

        {/* Quotation Summary — 2 cols */}
        <div
          className={cn(
            "lg:col-span-2",
            "transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
          style={{ transitionDelay: "450ms" }}
        >
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sticky top-24">
            <h2 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-5">
              Quotation Summary
            </h2>

            <div className="space-y-4">
              {/* Vendor */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <User className="size-4" />
                  <span>Vendor</span>
                </div>
                <span className="text-sm font-semibold text-[hsl(var(--foreground))] text-right">
                  {QUOTATION_SUMMARY.vendor}
                </span>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <CreditCard className="size-4" />
                  <span>Total</span>
                </div>
                <span className="text-sm font-bold" style={{ color: "hsl(249, 82%, 56%)" }}>
                  {QUOTATION_SUMMARY.total}
                </span>
              </div>

              {/* Delivery */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <Truck className="size-4" />
                  <span>Delivery</span>
                </div>
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  {QUOTATION_SUMMARY.delivery}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <Star className="size-4" />
                  <span>Rating</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4].map((i) => (
                      <Star
                        key={i}
                        className="size-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                    <Star className="size-3.5 fill-amber-400/50 text-amber-400" />
                  </div>
                  <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                    {QUOTATION_SUMMARY.rating}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[hsl(var(--border))] my-5" />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleApprove}
                disabled={isApproving || isRejecting || actionResult !== null}
                className={cn(
                  "w-full gap-2 rounded-xl font-semibold relative overflow-hidden transition-all",
                  "bg-emerald-500 hover:bg-emerald-600 text-white",
                  "shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30"
                )}
                size="lg"
              >
                <span
                  className={cn(
                    "flex items-center gap-2 transition-opacity",
                    isApproving && "opacity-0"
                  )}
                >
                  <CheckCircle2 className="size-4" />
                  Approve
                </span>
                {isApproving && (
                  <span className="absolute inset-0 flex items-center justify-center gap-2">
                    <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Approving...
                  </span>
                )}
              </Button>

              <Button
                onClick={handleReject}
                disabled={isApproving || isRejecting || actionResult !== null}
                variant="outline"
                className={cn(
                  "w-full gap-2 rounded-xl font-semibold relative overflow-hidden",
                  "border-red-500/30 text-red-600 dark:text-red-400",
                  "hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                )}
                size="lg"
              >
                <span
                  className={cn(
                    "flex items-center gap-2 transition-opacity",
                    isRejecting && "opacity-0"
                  )}
                >
                  <XCircle className="size-4" />
                  Reject
                </span>
                {isRejecting && (
                  <span className="absolute inset-0 flex items-center justify-center gap-2">
                    <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Rejecting...
                  </span>
                )}
              </Button>
            </div>

            {/* Info note */}
            <div className="mt-4 flex items-start gap-2 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]/30 rounded-xl px-4 py-3">
              <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-amber-500" />
              <span>Approval or rejection will notify the procurement team and vendor immediately.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
