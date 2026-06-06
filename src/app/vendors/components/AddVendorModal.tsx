"use client";

import { useState, useTransition } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, VENDOR_CATEGORIES } from "@/lib/vendors";
import type { VendorCategory, VendorStatus } from "@prisma/client";

interface AddVendorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS: { value: VendorStatus; label: string }[] = [
  { value: "PENDING_VERIFICATION", label: "Pending Verification" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "BLACKLISTED", label: "Blacklisted" },
];

const INITIAL = {
  companyName: "",
  category: "OTHER" as VendorCategory,
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  gstNumber: "",
  panNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  bankName: "",
  bankAccountNo: "",
  bankIfsc: "",
  notes: "",
  status: "PENDING_VERIFICATION" as VendorStatus,
  createUserAccount: true,
};

export default function AddVendorModal({ open, onClose, onSuccess }: AddVendorModalProps) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const set = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});

    startTransition(async () => {
      try {
        const res = await fetch("/api/vendors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();

        if (!data.success) {
          if (data.errors) {
            const mapped: Record<string, string> = {};
            data.errors.forEach((err: { field: string; message: string }) => {
              mapped[err.field] = err.message;
            });
            setErrors(mapped);
          } else {
            setSubmitError(data.error ?? "Failed to create vendor.");
          }
          return;
        }

        setForm(INITIAL);
        onSuccess();
        onClose();
      } catch {
        setSubmitError("Network error. Please try again.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-vendor-title"
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl
          bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div>
            <h2 id="add-vendor-title" className="text-lg font-bold text-[hsl(var(--foreground))]">
              Add Vendor
            </h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              Register a new supplier profile
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                className={cn(errors.companyName && "border-red-500")}
              />
              {errors.companyName && <p className="text-xs text-red-500">{errors.companyName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="flex h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))]
                  bg-[hsl(var(--background))] px-3 text-sm"
              >
                {VENDOR_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="flex h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))]
                  bg-[hsl(var(--background))] px-3 text-sm"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input id="contactName" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                className={cn(errors.contactEmail && "border-red-500")}
              />
              {errors.contactEmail && <p className="text-xs text-red-500">{errors.contactEmail}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input id="contactPhone" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gstNumber">GST Number *</Label>
              <Input
                id="gstNumber"
                value={form.gstNumber}
                onChange={(e) => set("gstNumber", e.target.value.toUpperCase())}
                placeholder="27AABCT1234A1ZP"
                className={cn("font-mono", errors.gstNumber && "border-red-500")}
              />
              {errors.gstNumber && <p className="text-xs text-red-500">{errors.gstNumber}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input
                id="panNumber"
                value={form.panNumber}
                onChange={(e) => set("panNumber", e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className={cn("font-mono", errors.panNumber && "border-red-500")}
              />
              {errors.panNumber && <p className="text-xs text-red-500">{errors.panNumber}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Address</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input id="addressLine1" value={form.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input id="addressLine2" value={form.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={form.country} onChange={(e) => set("country", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" value={form.pincode} onChange={(e) => set("pincode", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Bank Details (Optional)</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" value={form.bankName} onChange={(e) => set("bankName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bankAccountNo">Account No.</Label>
                <Input id="bankAccountNo" value={form.bankAccountNo} onChange={(e) => set("bankAccountNo", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bankIfsc">IFSC</Label>
                <Input
                  id="bankIfsc"
                  value={form.bankIfsc}
                  onChange={(e) => set("bankIfsc", e.target.value.toUpperCase())}
                  className={cn("font-mono", errors.bankIfsc && "border-red-500")}
                />
                {errors.bankIfsc && <p className="text-xs text-red-500">{errors.bankIfsc}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              className="flex w-full rounded-[var(--radius)] border border-[hsl(var(--border))]
                bg-[hsl(var(--background))] px-3 py-2 text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={form.createUserAccount}
              onChange={(e) => set("createUserAccount", (e.target as HTMLInputElement).checked)}
            />
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              Auto-create portal user account (VENDOR role) if email is provided
            </span>
          </label>

          {submitError && (
            <p className="text-sm text-red-500 font-medium">{submitError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2 min-w-[120px]">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Vendor"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
