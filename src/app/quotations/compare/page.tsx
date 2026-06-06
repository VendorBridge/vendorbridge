"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Trophy,
  Star,
  Clock,
  Truck,
  BadgePercent,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Crown,
  Shield,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────
interface VendorQuotation {
  id: string;
  vendorName: string;
  grandTotal: number;
  gstPercent: number;
  deliveryDays: number;
  vendorRating: number;
  paymentTerms: string;
  isLowest?: boolean;
}

// ─────────────────────────────────────────────────────
// Demo data
// ─────────────────────────────────────────────────────
const RFQ_INFO = {
  rfqNumber: "RFQ-2026-003",
  title: "Office Furniture Procurement Q2",
  quotationsCount: 3,
};

const VENDOR_QUOTATIONS: VendorQuotation[] = [
  {
    id: "v1",
    vendorName: "Infra Supplies",
    grandTotal: 185000,
    gstPercent: 18,
    deliveryDays: 10,
    vendorRating: 4.5,
    paymentTerms: "30 days",
  },
  {
    id: "v2",
    vendorName: "TechCore LTD",
    grandTotal: 200010,
    gstPercent: 18,
    deliveryDays: 14,
    vendorRating: 4.2,
    paymentTerms: "30 days",
  },
  {
    id: "v3",
    vendorName: "Office Need Co.",
    grandTotal: 214800,
    gstPercent: 18,
    deliveryDays: 7,
    vendorRating: 3.8,
    paymentTerms: "15 days",
  },
];

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "size-3.5 transition-colors",
              i < full
                ? "fill-amber-400 text-amber-400"
                : i === full && hasHalf
                ? "fill-amber-400/50 text-amber-400"
                : "fill-transparent text-[hsl(var(--border))]"
            )}
          />
        ))}
      </div>
      <span className="text-sm font-semibold ml-1">{rating}/5</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Criteria row definitions
// ─────────────────────────────────────────────────────
interface CriteriaRow {
  label: string;
  icon: React.ElementType;
  key: keyof VendorQuotation;
  format: (value: unknown) => React.ReactNode;
  highlight?: "lowest" | "highest" | "lowest-days";
}

// ─────────────────────────────────────────────────────
// Comparison Page
// ─────────────────────────────────────────────────────
export default function QuotationComparisonPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => setMounted(true), []);

  // Find lowest price vendor
  const lowestId = useMemo(() => {
    const sorted = [...VENDOR_QUOTATIONS].sort((a, b) => a.grandTotal - b.grandTotal);
    return sorted[0]?.id;
  }, []);

  // Find best for each criterion
  const bestValues = useMemo(() => {
    const totals = VENDOR_QUOTATIONS.map((v) => v.grandTotal);
    const ratings = VENDOR_QUOTATIONS.map((v) => v.vendorRating);
    const deliveries = VENDOR_QUOTATIONS.map((v) => v.deliveryDays);
    return {
      lowestTotal: Math.min(...totals),
      highestRating: Math.max(...ratings),
      fastestDelivery: Math.min(...deliveries),
    };
  }, []);

  const CRITERIA: CriteriaRow[] = [
    {
      label: "Grand Total",
      icon: CreditCard,
      key: "grandTotal",
      format: (v) => formatCurrency(v as number),
      highlight: "lowest",
    },
    {
      label: "GST %",
      icon: BadgePercent,
      key: "gstPercent",
      format: (v) => `${v}%`,
    },
    {
      label: "Delivery (days)",
      icon: Truck,
      key: "deliveryDays",
      format: (v) => `${v} days`,
      highlight: "lowest-days",
    },
    {
      label: "Vendor Rating",
      icon: Star,
      key: "vendorRating",
      format: (v) => <RatingStars rating={v as number} />,
      highlight: "highest",
    },
    {
      label: "Payment Terms",
      icon: Clock,
      key: "paymentTerms",
      format: (v) => v as string,
    },
  ];

  // Check if a cell value is the "best" in its row
  const isBestValue = (criteria: CriteriaRow, vendor: VendorQuotation): boolean => {
    if (criteria.highlight === "lowest") return vendor.grandTotal === bestValues.lowestTotal;
    if (criteria.highlight === "highest") return vendor.vendorRating === bestValues.highestRating;
    if (criteria.highlight === "lowest-days") return vendor.deliveryDays === bestValues.fastestDelivery;
    return false;
  };

  // Handle select vendor
  const handleSelect = (vendorId: string) => {
    setSelectedVendor(vendorId);
    setShowApprovalModal(true);
  };

  const handleApprove = () => {
    setApproving(true);
    setTimeout(() => {
      setApproving(false);
      setApproved(true);
      setTimeout(() => {
        setShowApprovalModal(false);
        setApproved(false);
      }, 2000);
    }, 1500);
  };

  const selectedVendorData = VENDOR_QUOTATIONS.find((v) => v.id === selectedVendor);

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      {/* ── Header ── */}
      <div
        className={cn(
          "transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <Link
          href="/quotations"
          className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors mb-3"
        >
          <ArrowLeft className="size-3.5" />
          Back to Quotations
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
          Quotation Comparison
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
          <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
            <FileText className="size-3.5 text-[hsl(var(--primary))]" />
            <span>
              RFQ:{" "}
              <span className="font-medium text-[hsl(var(--foreground))]">
                {RFQ_INFO.title}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-xs font-semibold">
              {RFQ_INFO.quotationsCount} quotations received
            </span>
          </div>
        </div>
      </div>

      {/* ── Comparison Table ── */}
      <div
        className={cn(
          "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden",
          "transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
        style={{ transitionDelay: "200ms" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* ── Table Header — Vendor names ── */}
            <thead>
              <tr>
                {/* Criteria column header */}
                <th className="text-left py-4 px-6 w-[200px] bg-[hsl(var(--muted))]/30 border-b border-r border-[hsl(var(--border))]">
                  <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Criteria
                  </span>
                </th>

                {/* Vendor column headers */}
                {VENDOR_QUOTATIONS.map((vendor, i) => {
                  const isLowest = vendor.id === lowestId;
                  return (
                    <th
                      key={vendor.id}
                      className={cn(
                        "text-center py-4 px-5 border-b border-[hsl(var(--border))] relative",
                        i < VENDOR_QUOTATIONS.length - 1 && "border-r",
                        isLowest
                          ? "bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12]"
                          : "bg-[hsl(var(--muted))]/20"
                      )}
                    >
                      {/* Best price badge */}
                      {isLowest && (
                        <div className="flex items-center justify-center gap-1.5 mb-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                            )}
                          >
                            <Crown className="size-3" />
                            Lowest Price
                          </span>
                        </div>
                      )}
                      <p className="text-sm font-bold text-[hsl(var(--foreground))]">
                        {vendor.vendorName}
                      </p>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* ── Table Body — Criteria rows ── */}
            <tbody>
              {CRITERIA.map((criteria, rowIdx) => {
                const Icon = criteria.icon;
                return (
                  <tr
                    key={criteria.key}
                    className={cn(
                      "transition-colors duration-150",
                      "hover:bg-[hsl(var(--accent))]/30"
                    )}
                  >
                    {/* Criteria label */}
                    <td className="py-4 px-6 border-r border-b border-[hsl(var(--border))]">
                      <div className="flex items-center gap-2.5">
                        <Icon className="size-4 text-[hsl(var(--muted-foreground))] shrink-0" />
                        <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                          {criteria.label}
                        </span>
                      </div>
                    </td>

                    {/* Vendor values */}
                    {VENDOR_QUOTATIONS.map((vendor, colIdx) => {
                      const isLowest = vendor.id === lowestId;
                      const isBest = isBestValue(criteria, vendor);

                      return (
                        <td
                          key={vendor.id}
                          className={cn(
                            "text-center py-4 px-5 border-b border-[hsl(var(--border))]",
                            colIdx < VENDOR_QUOTATIONS.length - 1 && "border-r",
                            isLowest && "bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06]"
                          )}
                        >
                          <div
                            className={cn(
                              "inline-flex items-center justify-center",
                              isBest && criteria.highlight && "relative"
                            )}
                          >
                            {/* Best value highlight chip */}
                            {isBest && criteria.highlight ? (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold",
                                  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                                  "border border-emerald-500/20"
                                )}
                              >
                                {criteria.format(vendor[criteria.key])}
                              </span>
                            ) : (
                              <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                                {criteria.format(vendor[criteria.key])}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* ── Action Row ── */}
              <tr>
                <td className="py-5 px-6 border-r border-[hsl(var(--border))]" />
                {VENDOR_QUOTATIONS.map((vendor, i) => {
                  const isLowest = vendor.id === lowestId;
                  return (
                    <td
                      key={vendor.id}
                      className={cn(
                        "text-center py-5 px-5",
                        i < VENDOR_QUOTATIONS.length - 1 &&
                          "border-r border-[hsl(var(--border))]",
                        isLowest && "bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06]"
                      )}
                    >
                      <Button
                        onClick={() => handleSelect(vendor.id)}
                        size="sm"
                        className={cn(
                          "rounded-xl px-5 gap-2 font-semibold transition-all duration-300",
                          isLowest
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30"
                            : "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--accent))]"
                        )}
                      >
                        {isLowest && <Shield className="size-3.5" />}
                        {isLowest ? "Select & Approve" : "Select"}
                      </Button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Legend ── */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]",
          "transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
        style={{ transitionDelay: "400ms" }}
      >
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-emerald-500/20 border border-emerald-500/30" />
          <span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Green</span> = Best value for criteria
          </span>
        </div>
        <span className="text-[hsl(var(--border))]">•</span>
        <span>Selecting a vendor initiates the approval workflow.</span>
      </div>

      {/* ── Approval Confirmation Modal ── */}
      {showApprovalModal && selectedVendorData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => !approving && !approved && setShowApprovalModal(false)}
          />

          {/* Modal */}
          <div
            className={cn(
              "relative w-full max-w-md rounded-2xl p-6",
              "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
              "shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            )}
          >
            {approved ? (
              /* Success state */
              <div className="text-center py-4">
                <div className="size-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="size-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">
                  Vendor Selected!
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  Approval request sent to the manager.
                </p>
              </div>
            ) : (
              /* Confirmation state */
              <>
                <div className="flex items-start gap-3 mb-5">
                  <div
                    className="size-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(249,82%,50%) 0%, hsl(262,80%,55%) 100%)",
                    }}
                  >
                    <Shield className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">
                      Confirm Selection
                    </h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                      This will initiate the approval workflow.
                    </p>
                  </div>
                </div>

                {/* Selected vendor card */}
                <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4 mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-[hsl(var(--foreground))]">
                      {selectedVendorData.vendorName}
                    </span>
                    {selectedVendorData.id === lowestId && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                        <Crown className="size-2.5" />
                        LOWEST
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[hsl(var(--muted-foreground))]">Total:</span>{" "}
                      <span className="font-semibold text-[hsl(var(--foreground))]">
                        {formatCurrency(selectedVendorData.grandTotal)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[hsl(var(--muted-foreground))]">Delivery:</span>{" "}
                      <span className="font-semibold text-[hsl(var(--foreground))]">
                        {selectedVendorData.deliveryDays} days
                      </span>
                    </div>
                    <div>
                      <span className="text-[hsl(var(--muted-foreground))]">Rating:</span>{" "}
                      <span className="font-semibold text-[hsl(var(--foreground))]">
                        {selectedVendorData.vendorRating}/5
                      </span>
                    </div>
                    <div>
                      <span className="text-[hsl(var(--muted-foreground))]">Terms:</span>{" "}
                      <span className="font-semibold text-[hsl(var(--foreground))]">
                        {selectedVendorData.paymentTerms}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex-1 rounded-xl gap-2 relative overflow-hidden shadow-md shadow-[hsl(var(--primary))]/20"
                  >
                    <span
                      className={cn(
                        "flex items-center gap-2 transition-opacity",
                        approving && "opacity-0"
                      )}
                    >
                      <Shield className="size-4" />
                      Confirm & Send for Approval
                    </span>
                    {approving && (
                      <span className="absolute inset-0 flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin size-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
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
                        Processing...
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowApprovalModal(false)}
                    disabled={approving}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
