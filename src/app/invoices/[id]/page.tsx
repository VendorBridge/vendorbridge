"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Printer,
  FileText,
  Building2,
  Truck,
  Calendar,
  Hash,
  Clock,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getInvoiceById, markInvoiceAsPaidAction } from "../actions";

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

const BILL_TO = {
  name: "VendorBridge Enterprises Ltd",
  address: "123 Business Corporate Tower, SG Highway, Ahmedabad",
  gstin: "GSTIN: 24AAACV3894F1Z3",
};

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const res = await getInvoiceById(id);
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load invoice details.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    setIsUpdating(true);
    try {
      const res = await markInvoiceAsPaidAction(id);
      if (res.success) {
        setData((prev: any) => ({
          ...prev,
          status: "PAID",
        }));
      } else {
        alert(res.error || "Failed to mark invoice as paid.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[hsl(var(--primary))]"></div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading invoice details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-red-500/10 text-red-500">
          <AlertTriangle className="size-8" />
        </div>
        <h2 className="text-xl font-bold">Error Loading Invoice</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{error || "Invoice details could not be found."}</p>
        <Button onClick={() => router.push("/invoices")} variant="outline" className="gap-2 rounded-xl">
          <ArrowLeft className="size-4" /> Back to Invoices
        </Button>
      </div>
    );
  }

  const { invoiceNumber, invoiceDate, dueDate, status, subtotal, discountAmount, taxPct, taxAmount, grandTotal, po, vendor, items } = data;

  const cgst = Math.round(taxAmount / 2);
  const sgst = Math.round(taxAmount / 2);

  return (
    <div className="p-6 lg:p-8 max-w-[1000px] mx-auto space-y-6">
      {/* Back Button */}
      <Button
        onClick={() => router.push("/invoices")}
        variant="ghost"
        size="sm"
        className="gap-2 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft className="size-4" /> Back to Invoices
      </Button>

      {/* Header */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4",
          "transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Invoice details
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            <span className="font-semibold text-[hsl(var(--foreground))]">Invoice: {invoiceNumber}</span>
            {" — "}associated with PO {po?.poNumber || "N/A"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            className="gap-2 rounded-xl hover:border-[hsl(var(--ring))]/30 transition-all"
            onClick={() => alert("Downloading PDF (Feature simulated).")}
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-xl hover:border-[hsl(var(--ring))]/30 transition-all"
            onClick={handlePrint}
          >
            <Printer className="size-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
        </div>
      </div>

      {/* Invoice Document Card */}
      <div
        ref={invoiceRef}
        className={cn(
          "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]",
          "shadow-sm overflow-hidden transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
        style={{ transitionDelay: "150ms" }}
      >
        {/* Top Gradient bar */}
        <div
          className="h-1.5"
          style={{
            background:
              "linear-gradient(90deg, hsl(249,82%,50%) 0%, hsl(262,80%,55%) 50%, hsl(160,84%,39%) 100%)",
          }}
        />

        <div className="p-6 lg:p-8">
          {/* Bill To & Billed From Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Bill To (Organization) */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="size-4 text-[hsl(var(--primary))]" />
                <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Bill To
                </span>
              </div>
              <p className="text-sm font-bold text-[hsl(var(--foreground))]">{BILL_TO.name}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                {BILL_TO.address}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-mono">
                {BILL_TO.gstin}
              </p>
            </div>

            {/* Billed From (Vendor) */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="size-4 text-emerald-500" />
                <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Billed From (Vendor)
                </span>
              </div>
              <p className="text-sm font-bold text-[hsl(var(--foreground))]">{vendor?.companyName || "Unknown Vendor"}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                {vendor?.addressLine1 || "N/A"} {vendor?.city || ""} {vendor?.state || ""} {vendor?.country || ""}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-mono">
                GSTIN: {vendor?.gstNumber || "N/A"}
              </p>
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl bg-[hsl(var(--muted))]/20 border border-[hsl(var(--border))] px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Hash className="size-3 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  PO Number
                </span>
              </div>
              <p className="text-sm font-bold text-[hsl(var(--foreground))]">{po?.poNumber || "N/A"}</p>
            </div>

            <div className="rounded-xl bg-[hsl(var(--muted))]/20 border border-[hsl(var(--border))] px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="size-3 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  PO Date
                </span>
              </div>
              <p className="text-sm font-bold text-[hsl(var(--foreground))]">
                {po?.poDate ? new Date(po.poDate).toLocaleDateString("en-IN") : "N/A"}
              </p>
            </div>

            <div className="rounded-xl bg-[hsl(var(--muted))]/20 border border-[hsl(var(--border))] px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <FileText className="size-3 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Invoice Date
                </span>
              </div>
              <p className="text-sm font-bold text-[hsl(var(--foreground))]">
                {new Date(invoiceDate).toLocaleDateString("en-IN")}
              </p>
            </div>

            <div className="rounded-xl bg-[hsl(var(--muted))]/20 border border-[hsl(var(--border))] px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="size-3 text-amber-500" />
                <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Due Date
                </span>
              </div>
              <p className="text-sm font-bold text-[hsl(var(--foreground))]">
                {dueDate ? new Date(dueDate).toLocaleDateString("en-IN") : "N/A"}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[hsl(var(--muted))]/30 border-b border-[hsl(var(--border))]">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[40%]">
                    Item
                  </th>
                  <th className="text-center py-3.5 px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[12%]">
                    Qty
                  </th>
                  <th className="text-center py-3.5 px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[24%]">
                    Unit Price
                  </th>
                  <th className="text-right py-3.5 px-5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[24%]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items?.map((item: any) => (
                  <tr
                    key={item.id}
                    className="border-b border-[hsl(var(--border))]/50 last:border-0 hover:bg-[hsl(var(--accent))]/30 transition-colors"
                  >
                    <td className="py-4 px-5 font-medium text-[hsl(var(--foreground))]">
                      {item.itemName}
                      {item.description && <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.description}</p>}
                    </td>
                    <td className="py-4 px-4 text-center text-[hsl(var(--muted-foreground))]">
                      {item.quantity} {item.unit || "units"}
                    </td>
                    <td className="py-4 px-4 text-center text-[hsl(var(--muted-foreground))]">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-4 px-5 text-right font-semibold text-[hsl(var(--foreground))]">
                      {formatCurrency(item.lineTotal || (item.quantity * item.unitPrice))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
                <span className="font-semibold text-[hsl(var(--foreground))]">
                  {formatCurrency(subtotal || 0)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 text-sm">
                  <span>Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">CGST ({taxPct / 2}%)</span>
                <span className="font-semibold text-[hsl(var(--foreground))]">
                  {formatCurrency(cgst || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">SGST ({taxPct / 2}%)</span>
                <span className="font-semibold text-[hsl(var(--foreground))]">
                  {formatCurrency(sgst || 0)}
                </span>
              </div>

              <div className="border-t border-[hsl(var(--border))] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[hsl(var(--foreground))]">
                    Grand Total
                  </span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: "hsl(249, 82%, 56%)" }}
                  >
                    {formatCurrency(grandTotal || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status & Actions Footer Bar */}
      <div
        className={cn(
          "flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-4",
          "transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
        style={{ transitionDelay: "300ms" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Status:</span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
              status === "PAID"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20"
            )}
          >
            {status === "PAID" ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <Clock className="size-3.5" />
            )}
            {status === "PAID" ? "Paid" : "Pending Payment"}
          </span>
        </div>

        {status !== "PAID" && (
          <Button
            onClick={handleMarkAsPaid}
            disabled={isUpdating}
            className="gap-2 rounded-xl shadow-md shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 text-white transition-all animate-in fade-in"
            size="sm"
          >
            <CheckCircle2 className="size-3.5" />
            {isUpdating ? "Updating..." : "Mark as Paid"}
          </Button>
        )}
      </div>
    </div>
  );
}
