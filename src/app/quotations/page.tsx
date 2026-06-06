"use client";

import { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────
interface QuotationItem {
  id: string;
  item: string;
  qty: number;
  unitPrice: number;
  deliveryDays: number;
}

// ─────────────────────────────────────────────────────
// Demo RFQ data (would come from API in production)
// ─────────────────────────────────────────────────────
const RFQ_DATA = {
  rfqNumber: "RFQ-2026-003",
  title: "Office Furniture Procurement Q2",
  deadline: "15 June 2026",
  category: "Furniture",
  items: [
    { name: "Ergonomic Chair", qty: 25 },
    { name: "Standing Desk", qty: 10 },
  ],
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
// Quotations Page
// ─────────────────────────────────────────────────────
export default function QuotationsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Quotation line items — pre-filled from RFQ
  const [items, setItems] = useState<QuotationItem[]>([
    { id: "1", item: "Ergonomic Chair", qty: 25, unitPrice: 3500, deliveryDays: 7 },
    { id: "2", item: "Standing Desk", qty: 10, unitPrice: 8200, deliveryDays: 14 },
  ]);

  const [taxPercent, setTaxPercent] = useState(18);
  const [notes, setNotes] = useState("Payment terms: 20 days net...");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Calculations ──
  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, row) => sum + row.qty * row.unitPrice, 0);
    const taxAmount = Math.round(subtotal * (taxPercent / 100));
    const grandTotal = subtotal + taxAmount;
    return { subtotal, taxAmount, grandTotal };
  }, [items, taxPercent]);

  // ── Update item field ──
  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // ── Add new item ──
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        item: "",
        qty: 1,
        unitPrice: 0,
        deliveryDays: 7,
      },
    ]);
  };

  // ── Remove item ──
  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ── Submit handler ──
  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto space-y-6">
      {/* ── Success toast ── */}
      {showSuccess && (
        <div
          className={cn(
            "fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl",
            "bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30",
            "animate-in slide-in-from-right-5 fade-in duration-300"
          )}
        >
          <CheckCircle2 className="size-5" />
          <span className="font-medium text-sm">Quotation submitted successfully!</span>
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
          Submit Quotation
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
          <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
            <FileText className="size-3.5 text-[hsl(var(--primary))]" />
            <span>
              RFQ:{" "}
              <span className="font-medium text-[hsl(var(--foreground))]">
                {RFQ_DATA.title}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
            <Calendar className="size-3.5 text-amber-500" />
            <span>
              Deadline:{" "}
              <span className="font-medium text-[hsl(var(--foreground))]">
                {RFQ_DATA.deadline}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ── RFQ Summary Card ── */}
      <div
        className={cn(
          "rounded-2xl p-5 border border-[hsl(var(--border))]",
          "bg-[hsl(var(--primary))]/[0.04] dark:bg-[hsl(var(--primary))]/[0.08]",
          "transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
        style={{ transitionDelay: "150ms" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="size-9 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md"
            style={{
              background: "linear-gradient(135deg, hsl(249,82%,50%) 0%, hsl(262,80%,55%) 100%)",
            }}
          >
            <Package className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
              RFQ Summary
            </h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
              {RFQ_DATA.items.map((i) => `${i.name} × ${i.qty}`).join(", ")} — Category: {RFQ_DATA.category}
            </p>
          </div>
        </div>
      </div>

      {/* ── Quotation Table ── */}
      <div
        className={cn(
          "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]",
          "overflow-hidden transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
        style={{ transitionDelay: "300ms" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
            Your Quotation
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={addItem}
            className="gap-1.5 text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] rounded-lg"
          >
            <Plus className="size-3.5" />
            Add Line
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                <th className="text-left py-3 px-5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[28%]">
                  Item
                </th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[10%]">
                  Qty
                </th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[16%]">
                  Unit Price (₹)
                </th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[16%]">
                  Total
                </th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[14%]">
                  Delivery (days)
                </th>
                <th className="py-3 px-3 w-[6%]" />
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-[hsl(var(--border))]/50 last:border-0",
                    "hover:bg-[hsl(var(--accent))]/30 transition-colors duration-150",
                    "group"
                  )}
                >
                  {/* Item name */}
                  <td className="py-3 px-5">
                    <input
                      type="text"
                      value={row.item}
                      onChange={(e) => updateItem(row.id, "item", e.target.value)}
                      placeholder="Item name..."
                      className={cn(
                        "w-full bg-transparent text-sm font-medium text-[hsl(var(--foreground))]",
                        "border-0 outline-none focus:ring-0 placeholder:text-[hsl(var(--muted-foreground))]/50"
                      )}
                    />
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      value={row.qty}
                      onChange={(e) => updateItem(row.id, "qty", parseInt(e.target.value) || 0)}
                      min={1}
                      className={cn(
                        "w-full bg-[hsl(var(--muted))]/40 text-sm text-center font-medium text-[hsl(var(--foreground))]",
                        "rounded-lg px-2 py-1.5 border border-transparent",
                        "focus:border-[hsl(var(--ring))] focus:bg-[hsl(var(--background))] outline-none",
                        "transition-colors duration-200"
                      )}
                    />
                  </td>

                  {/* Unit price */}
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      value={row.unitPrice}
                      onChange={(e) => updateItem(row.id, "unitPrice", parseFloat(e.target.value) || 0)}
                      min={0}
                      className={cn(
                        "w-full bg-[hsl(var(--muted))]/40 text-sm text-center font-medium text-[hsl(var(--foreground))]",
                        "rounded-lg px-2 py-1.5 border border-transparent",
                        "focus:border-[hsl(var(--ring))] focus:bg-[hsl(var(--background))] outline-none",
                        "transition-colors duration-200"
                      )}
                    />
                  </td>

                  {/* Total (auto-calculated) */}
                  <td className="py-3 px-3 text-right">
                    <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                      {formatCurrency(row.qty * row.unitPrice)}
                    </span>
                  </td>

                  {/* Delivery days */}
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      value={row.deliveryDays}
                      onChange={(e) => updateItem(row.id, "deliveryDays", parseInt(e.target.value) || 0)}
                      min={1}
                      className={cn(
                        "w-full bg-[hsl(var(--muted))]/40 text-sm text-center font-medium text-[hsl(var(--foreground))]",
                        "rounded-lg px-2 py-1.5 border border-transparent",
                        "focus:border-[hsl(var(--ring))] focus:bg-[hsl(var(--background))] outline-none",
                        "transition-colors duration-200"
                      )}
                    />
                  </td>

                  {/* Delete */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => removeItem(row.id)}
                      disabled={items.length <= 1}
                      className={cn(
                        "p-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                        "text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10",
                        "opacity-0 group-hover:opacity-100",
                        "disabled:opacity-0 disabled:pointer-events-none"
                      )}
                      aria-label="Remove item"
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

      {/* ── Tax, Notes & Totals ── */}
      <div
        className={cn(
          "grid grid-cols-1 lg:grid-cols-2 gap-5 transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
        style={{ transitionDelay: "450ms" }}
      >
        {/* Left: Tax + Notes */}
        <div className="space-y-4">
          {/* Tax */}
          <div
            className={cn(
              "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
            )}
          >
            <label className="text-sm font-medium text-[hsl(var(--foreground))] block mb-2">
              Tax / GST %
            </label>
            <div className="relative w-40">
              <input
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                min={0}
                max={100}
                step={0.5}
                className={cn(
                  "w-full bg-[hsl(var(--muted))]/40 text-sm font-medium text-[hsl(var(--foreground))]",
                  "rounded-xl px-4 py-2.5 pr-8 border border-[hsl(var(--border))]",
                  "focus:border-[hsl(var(--ring))] focus:bg-[hsl(var(--background))] outline-none",
                  "transition-colors duration-200"
                )}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--muted-foreground))] font-medium">
                %
              </span>
            </div>
          </div>

          {/* Notes */}
          <div
            className={cn(
              "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
            )}
          >
            <label className="text-sm font-medium text-[hsl(var(--foreground))] block mb-2">
              Notes / Terms
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Payment terms, delivery conditions, warranty details..."
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

        {/* Right: Totals */}
        <div
          className={cn(
            "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6",
            "flex flex-col justify-between"
          )}
        >
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-5">
              Order Summary
            </h3>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">Subtotal</span>
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  {formatCurrency(calculations.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  GST ({taxPercent}%)
                </span>
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  {formatCurrency(calculations.taxAmount)}
                </span>
              </div>

              <div className="border-t border-[hsl(var(--border))] pt-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[hsl(var(--foreground))]">
                    Grand Total
                  </span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: "hsl(249, 82%, 56%)" }}
                  >
                    {formatCurrency(calculations.grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="mt-5 flex items-start gap-2 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]/30 rounded-xl px-4 py-3">
            <Info className="size-3.5 shrink-0 mt-0.5" />
            <span>Totals auto-calculate as you edit quantities and prices above.</span>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div
        className={cn(
          "border-t border-[hsl(var(--border))] pt-6 transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
        style={{ transitionDelay: "600ms" }}
      >
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2 rounded-xl px-8 shadow-md shadow-[hsl(var(--primary))]/20 hover:shadow-lg hover:shadow-[hsl(var(--primary))]/30 transition-shadow relative overflow-hidden"
          >
            <span className={cn("flex items-center gap-2 transition-opacity", isSubmitting && "opacity-0")}>
              <Send className="size-4" />
              Submit Quotation
            </span>
            {isSubmitting && (
              <span className="absolute inset-0 flex items-center justify-center gap-2">
                <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Submitting...
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="gap-2 rounded-xl px-8 hover:border-[hsl(var(--ring))]/30 transition-colors"
          >
            <Save className="size-4" />
            Save Draft
          </Button>
        </div>
      </div>
    </div>
  );
}
