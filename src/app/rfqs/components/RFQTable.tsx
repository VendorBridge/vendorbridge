"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatRfqCreatorName,
  formatRfqDeadline,
  isRfqPastDue,
  truncateTitle,
  type RfqListItem,
} from "@/lib/rfqs";
import RFQStatusBadge from "./RFQStatusBadge";
import { RFQTableSkeleton } from "./RFQSkeleton";

interface RFQTableProps {
  rfqs: RfqListItem[];
  loading?: boolean;
  isEmpty?: boolean;
  hasActiveFilters?: boolean;
}

export default function RFQTable({
  rfqs,
  loading,
  isEmpty,
  hasActiveFilters,
}: RFQTableProps) {
  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-sm min-w-[900px]">
        <thead>
          <tr className="border-b border-[hsl(var(--border))]">
            {[
              "RFQ Number",
              "Title",
              "Deadline",
              "Status",
              "Quotations",
              "Created By",
              "Action",
            ].map((col) => (
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
            <RFQTableSkeleton />
          ) : rfqs.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center">
                {isEmpty && !hasActiveFilters ? (
                  <div className="space-y-3">
                    <p className="text-[hsl(var(--muted-foreground))]">
                      No RFQs yet. Create your first request for quotation to get started.
                    </p>
                    <Link href="/rfqs/new">
                      <Button className="rounded-xl shadow-md shadow-[hsl(var(--primary))]/20">
                        Create your first RFQ
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-[hsl(var(--muted-foreground))]">
                    No RFQs found. Try adjusting your search or filters.
                  </p>
                )}
              </td>
            </tr>
          ) : (
            rfqs.map((rfq) => (
              <tr
                key={rfq.id}
                className={cn(
                  "border-b border-[hsl(var(--border))]/50 last:border-0",
                  "hover:bg-[hsl(var(--accent))]/50 transition-colors duration-150"
                )}
              >
                <td className="py-3.5 px-3">
                  <Link
                    href={`/rfqs/${rfq.id}`}
                    className="font-medium text-[hsl(var(--primary))] hover:underline"
                  >
                    {rfq.rfqNumber}
                  </Link>
                </td>
                <td
                  className="py-3.5 px-3 text-[hsl(var(--foreground))]"
                  title={rfq.title.length > 50 ? rfq.title : undefined}
                >
                  {truncateTitle(rfq.title)}
                </td>
                <td
                  className={cn(
                    "py-3.5 px-3",
                    isRfqPastDue(rfq.deadline)
                      ? "text-red-600 dark:text-red-400 font-medium"
                      : "text-[hsl(var(--muted-foreground))]"
                  )}
                >
                  {formatRfqDeadline(rfq.deadline)}
                </td>
                <td className="py-3.5 px-3">
                  <RFQStatusBadge status={rfq.status} />
                </td>
                <td className="py-3.5 px-3 text-[hsl(var(--muted-foreground))]">
                  {rfq.quotationCount}
                </td>
                <td className="py-3.5 px-3 text-[hsl(var(--muted-foreground))]">
                  {formatRfqCreatorName(rfq.createdBy)}
                </td>
                <td className="py-3.5 px-3">
                  <Link href={`/rfqs/${rfq.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5 rounded-lg">
                      <Eye className="size-4" />
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
