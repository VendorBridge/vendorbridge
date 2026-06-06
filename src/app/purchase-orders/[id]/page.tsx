"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Building2,
  Truck,
  Calendar,
  Hash,
  Clock,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  Receipt,
  Download,
  Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPurchaseOrderById } from "../actions";
import { createInvoiceFromPoAction } from "@/app/invoices/actions";

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

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20",
  ISSUED: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  ACKNOWLEDGED: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
  PARTIALLY_FULFILLED: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  FULFILLED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
};

export default function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPO();
  }, [id]);

  const fetchPO = async () => {
    setLoading(true);
    try {
      const res = await getPurchaseOrderById(id);
      if (res) {
        setData(res);
      } else {
        setError("Purchase Order not found.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setIsGenerating(true);
    try {
      const res = await createInvoiceFromPoAction(id);
      if (res.success) {
        router.push(`/invoices/${res.invoiceId}`);
      } else {
        alert(res.error || "Failed to generate invoice.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[hsl(var(--primary))]"></div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading Purchase Order details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-red-500/10 text-red-500">
          <AlertTriangle className="size-8" />
        </div>
        <h2 className="text-xl font-bold">Error Loading Purchase Order</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{error || "Purchase Order details could not be found."}</p>
        <Button onClick={() => router.push("/purchase-orders")} variant="outline" className="gap-2 rounded-xl">
          <ArrowLeft className="size-4" /> Back to Purchase Orders
        </Button>
      </div>
    );
  }

  const { poNumber, poDate, expectedDelivery, status, subtotal, discountAmount, taxPct, taxAmount, grandTotal, vendor, items, invoice } = data;

  const cgst = Math.round(taxAmount / 2);
  const sgst = Math.round(taxAmount / 2);

  return (
    <div className="p-6 lg:p-8 max-w-[1000px] mx-auto space-y-6">
      {/* Back Button */}
      <Button
        onClick={() => router.push("/purchase-orders")}
        variant="ghost"
        size="sm"
        className="gap-2 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft className="size-4" /> Back to Purchase Orders
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
            Purchase Order details
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            <span className="font-semibold text-[hsl(var(--foreground))]">PO Number: {poNumber}</span>
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
            <span className="hidden sm:inline">Download PO</span>
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-xl hover:border-[hsl(var(--ring))]/30 transition-all"
            onClick={() => window.print()}
          >
            <Printer className="size-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
        </div>
      </div>

      {/* Document Card */}
      <div
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
                  Bill To (Buyer)
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
                  Vendor Details
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl bg-[hsl(var(--muted))]/20 border border-[hsl(var(--border))] px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Hash className="size-3 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  PO Number
                </span>
              </div>
              <p className="text-sm font-bold text-[hsl(var(--foreground))]">{poNumber}</p>
            </div>

            <div className="rounded-xl bg-[hsl(var(--muted))]/20 border border-[hsl(var(--border))] px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="size-3 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  PO Date
                </span>
              </div>
              <p className="text-sm font-bold text-[hsl(var(--foreground))]">
                {new Date(poDate).toLocaleDateString("en-IN")}
              </p>
            </div>

            <div className="rounded-xl bg-[hsl(var(--muted))]/20 border border-[hsl(var(--border))] px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="size-3 text-amber-500" />
                <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Expected Delivery
                </span>
              </div>
              <p className="text-sm font-bold text-[hsl(var(--foreground))]">
                {expectedDelivery ? new Date(expectedDelivery).toLocaleDateString("en-IN") : "Standard Delivery"}
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
              STATUS_STYLES[status] || ""
            )}
          >
            {status === "FULFILLED" ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <Clock className="size-3.5" />
            )}
            {status.replace("_", " ")}
          </span>
        </div>

        <div>
          {invoice ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                Invoice generated: <span className="font-mono font-semibold text-[hsl(var(--foreground))]">{invoice.invoiceNumber}</span>
              </span>
              <Link href={`/invoices/${invoice.id}`}>
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
                  <Receipt className="size-3.5" />
                  View Invoice
                </Button>
              </Link>
            </div>
          ) : (
            <Button
              onClick={handleGenerateInvoice}
              disabled={isGenerating}
              className="gap-2 rounded-xl shadow-md bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white transition-all"
              size="sm"
            >
              <Receipt className="size-3.5" />
              {isGenerating ? "Generating..." : "Generate Invoice"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
