"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Star, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCategory, formatRating } from "@/lib/vendors";
import type { VendorCategory, VendorStatus } from "@prisma/client";
import StatusBadge from "../components/StatusBadge";

interface VendorDetail {
  id: string;
  companyName: string;
  category: VendorCategory;
  status: VendorStatus;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
  bankName: string | null;
  bankAccountNo: string | null;
  bankIfsc: string | null;
  notes: string | null;
  rating: number | null;
  totalPos: number;
  totalSpend: number;
}

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/vendors/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setVendor(data.vendor);
        else setError(data.error ?? "Vendor not found.");
      })
      .catch(() => setError("Failed to load vendor."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-[900px] mx-auto space-y-4">
        <div className="h-8 w-48 bg-[hsl(var(--muted))] rounded animate-pulse" />
        <div className="h-64 bg-[hsl(var(--muted))] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="p-6 lg:p-8 max-w-[900px] mx-auto text-center space-y-4">
        <p className="text-[hsl(var(--muted-foreground))]">{error ?? "Vendor not found."}</p>
        <Link href="/vendors">
          <Button variant="outline">Back to Vendors</Button>
        </Link>
      </div>
    );
  }

  const address = [vendor.addressLine1, vendor.addressLine2, vendor.city, vendor.state, vendor.pincode, vendor.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="p-6 lg:p-8 max-w-[900px] mx-auto space-y-6">
      <Link href="/vendors">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2">
          <ArrowLeft className="size-4" />
          Back to Vendors
        </Button>
      </Link>

      <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">{vendor.companyName}</h1>
              <StatusBadge status={vendor.status} />
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {formatCategory(vendor.category)}
            </p>
            {vendor.rating != null && vendor.rating > 0 && (
              <div className="flex items-center gap-1 mt-2 text-sm">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{formatRating(vendor.rating)}</span>
                <span className="text-[hsl(var(--muted-foreground))]">· {vendor.totalPos} POs</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Contact
            </h2>
            {vendor.contactName && (
              <p className="text-sm">{vendor.contactName}</p>
            )}
            {vendor.contactEmail && (
              <p className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <Mail className="size-4 shrink-0" />
                {vendor.contactEmail}
              </p>
            )}
            {vendor.contactPhone && (
              <p className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <Phone className="size-4 shrink-0" />
                {vendor.contactPhone}
              </p>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Tax Details
            </h2>
            <p className="text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">GST: </span>
              <span className="font-mono">{vendor.gstNumber ?? "—"}</span>
            </p>
            <p className="text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">PAN: </span>
              <span className="font-mono">{vendor.panNumber ?? "—"}</span>
            </p>
          </section>

          {address && (
            <section className="space-y-3 sm:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Address
              </h2>
              <p className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <MapPin className="size-4 shrink-0 mt-0.5" />
                {address}
              </p>
            </section>
          )}

          {(vendor.bankName || vendor.bankAccountNo) && (
            <section className="space-y-3 sm:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Bank Details
              </h2>
              <p className="flex items-center gap-2 text-sm">
                <Building2 className="size-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
                {vendor.bankName} · {vendor.bankAccountNo} · {vendor.bankIfsc}
              </p>
            </section>
          )}

          {vendor.notes && (
            <section className="space-y-3 sm:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Notes
              </h2>
              <p className={cn("text-sm text-[hsl(var(--muted-foreground))] leading-relaxed")}>
                {vendor.notes}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
