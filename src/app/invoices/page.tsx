"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Download,
  Printer,
  Receipt,
  FileText,
  Building2,
  Truck,
  Calendar,
  Hash,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

// ─────────────────────────────────────────────────────
// Demo data
// ─────────────────────────────────────────────────────
const PO_DATA = {
  poNumber: "PO-2025-0068",
  poDate: "21 May, 2025",
  invoiceDate: "22 May, 2025",
  dueDate: "21 Jun, 2025",
  status: "Pending Payment" as const,
};

const BILL_TO = {
  name: "Your Organization Name",
  address: "123 Business Park, Ahmedabad",
  gstin: "GSTIN:25383438AFB",
};

const VENDOR = {
  name: "Infra Supplies Pvt Ltd",
  address: "456, Industrial Estate, Surat",
  gstin: "GSTIN: 343434DB4523",
};

interface LineItem {
  item: string;
  qty: number;
  unitPrice: number;
}

const LINE_ITEMS: LineItem[] = [
  { item: "Ergonomic Chair", qty: 25, unitPrice: 3500 },
  { item: "Standing Desk (Tech Core LTD)", qty: 10, unitPrice: 8200 },
];

const TAX_RATE = 9; // CGST + SGST each 9%

// ─────────────────────────────────────────────────────
// Status badge styles
// ─────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { className: string; icon: React.ElementType; label: string }> = {
  "Pending Payment": {
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Clock,
    label: "Pending Payment",
  },
  Paid: {
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
    label: "Paid",
  },
};

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

// ─────────────────────────────────────────────────────
// Invoice Page
// ─────────────────────────────────────────────────────
export default function InvoicesPage() {
  const [mounted, setMounted] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  // Calculations
  const subtotal = LINE_ITEMS.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const cgst = Math.round(subtotal * (TAX_RATE / 100));
  const sgst = Math.round(subtotal * (TAX_RATE / 100));
  const grandTotal = subtotal + cgst + sgst;

  const statusConfig = STATUS_CONFIG[PO_DATA.status] || STATUS_CONFIG["Pending Payment"];
  const StatusIcon = statusConfig.icon;

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1000px] mx-auto space-y-6">
      {/* ── Header ── */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4",
          "transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Purchase Order & Invoice
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            <span className="font-medium text-[hsl(var(--foreground))]">{PO_DATA.poNumber}</span>
            {" — "}auto-generated after approval
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            className="gap-2 rounded-xl hover:border-[hsl(var(--ring))]/30 transition-all"
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
          <Button className="gap-2 rounded-xl shadow-md shadow-[hsl(var(--primary))]/20 hover:shadow-lg hover:shadow-[hsl(var(--primary))]/30 transition-shadow">
            <Receipt className="size-4" />
            <span className="hidden sm:inline">Invoice</span>
          </Button>
        </div>
      </div>

      {/* ── Invoice Document ── */}
      <div
        ref={invoiceRef}
        className={cn(
          "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]",
          "shadow-sm overflow-hidden transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
        style={{ transitionDelay: "150ms" }}
      >
        {/* Colored top accent bar */}
        <div
          className="h-1.5"
          style={{
            background:
              "linear-gradient(90deg, hsl(249,82%,50%) 0%, hsl(262,80%,55%) 50%, hsl(160,84%,39%) 100%)",
          }}
        />

        <div className="p-6 lg:p-8">
          {/* ── Bill To / Vendor Row ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Bill To */}
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

            {/* Vendor */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="size-4 text-emerald-500" />
                <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Vendor
                </span>
              </div>
              <p className="text-sm font-bold text-[hsl(var(--foreground))]">{VENDOR.name}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                {VENDOR.address}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-mono">
                {VENDOR.gstin}
              </p>
            </div>
          </div>

          {/* ── PO & Invoice Details Row ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl bg-[hsl(var(--muted))]/20 border border-[hsl(var(--border))] px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Hash className="size-3 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  PO Number
                </span>
              </div>
              <p className="text-sm font-bold text-[hsl(var(--foreground))]">{PO_DATA.poNumber}</p>
            </div>

            <div className="rounded-xl bg-[hsl(var(--muted))]/20 border border-[hsl(var(--border))] px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="size-3 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  PO Date
                </span>
              </div>
              <p className="text-sm font-bold text-[hsl(var(--foreground))]">{PO_DATA.poDate}</p>
            </div>

            <div className="rounded-xl bg-[hsl(var(--muted))]/20 border border-[hsl(var(--border))] px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <FileText className="size-3 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Invoice Date
                </span>
              </div>
              <p className="text-sm font-bold text-[hsl(var(--foreground))]">
                {PO_DATA.invoiceDate}
              </p>
            </div>

            <div className="rounded-xl bg-[hsl(var(--muted))]/20 border border-[hsl(var(--border))] px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="size-3 text-amber-500" />
                <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Due Date
                </span>
              </div>
              <p className="text-sm font-bold text-[hsl(var(--foreground))]">{PO_DATA.dueDate}</p>
            </div>
          </div>

          {/* ── Line Items Table ── */}
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
                {LINE_ITEMS.map((row, i) => (
                  <tr
                    key={i}
                    className={cn(
                      "border-b border-[hsl(var(--border))]/50 last:border-0",
                      "hover:bg-[hsl(var(--accent))]/30 transition-colors duration-150"
                    )}
                  >
                    <td className="py-4 px-5 font-medium text-[hsl(var(--foreground))]">
                      {row.item}
                    </td>
                    <td className="py-4 px-4 text-center text-[hsl(var(--muted-foreground))]">
                      {row.qty}
                    </td>
                    <td className="py-4 px-4 text-center text-[hsl(var(--muted-foreground))]">
                      {formatCurrency(row.unitPrice)}
                    </td>
                    <td className="py-4 px-5 text-right font-semibold text-[hsl(var(--foreground))]">
                      {formatCurrency(row.qty * row.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Totals ── */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
                <span className="font-semibold text-[hsl(var(--foreground))]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">CGST ({TAX_RATE}%)</span>
                <span className="font-semibold text-[hsl(var(--foreground))]">
                  {formatCurrency(cgst)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">SGST ({TAX_RATE}%)</span>
                <span className="font-semibold text-[hsl(var(--foreground))]">
                  {formatCurrency(sgst)}
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
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Bar ── */}
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
              statusConfig.className
            )}
          >
            <StatusIcon className="size-3.5" />
            {statusConfig.label}
          </span>
        </div>

        <Button
          className="gap-2 rounded-xl shadow-md shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
          size="sm"
        >
          <CheckCircle2 className="size-3.5" />
          Mark as Paid
        </Button>
      </div>
    </div>
  );
}
