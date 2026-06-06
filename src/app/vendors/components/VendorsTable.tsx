"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCategory, formatRating } from "@/lib/vendors";
import type { VendorListItem } from "@/lib/vendors";
import StatusBadge from "./StatusBadge";

interface VendorsTableProps {
  vendors: VendorListItem[];
  loading?: boolean;
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-[hsl(var(--border))]/50">
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j} className="py-4 px-3">
              <div className="h-4 bg-[hsl(var(--muted))] rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function VendorsTable({ vendors, loading }: VendorsTableProps) {
  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr className="border-b border-[hsl(var(--border))]">
            {["Vendor Name", "Category", "GST No.", "Contact No.", "Status", "Action"].map((col) => (
              <th
                key={col}
                className="text-left py-3 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <TableSkeleton />
          ) : vendors.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-[hsl(var(--muted-foreground))]">
                No vendors found. Try adjusting your filters or add a new vendor.
              </td>
            </tr>
          ) : (
            vendors.map((vendor) => (
              <tr
                key={vendor.id}
                className={cn(
                  "border-b border-[hsl(var(--border))]/50 last:border-0",
                  "hover:bg-[hsl(var(--accent))]/50 transition-colors duration-150"
                )}
              >
                <td className="py-3.5 px-3">
                  <div className="font-medium text-[hsl(var(--foreground))]">{vendor.companyName}</div>
                  {vendor.rating != null && vendor.rating > 0 && (
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {formatRating(vendor.rating)}
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-3 text-[hsl(var(--muted-foreground))]">
                  {formatCategory(vendor.category)}
                </td>
                <td className="py-3.5 px-3 font-mono text-xs text-[hsl(var(--muted-foreground))]">
                  {vendor.gstNumber ?? "—"}
                </td>
                <td className="py-3.5 px-3 text-[hsl(var(--muted-foreground))]">
                  {vendor.contactPhone ?? "—"}
                </td>
                <td className="py-3.5 px-3">
                  <StatusBadge status={vendor.status} />
                </td>
                <td className="py-3.5 px-3">
                  <Link href={`/vendors/${vendor.id}`}>
                    <Button variant="outline" size="sm" className="rounded-lg">
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
