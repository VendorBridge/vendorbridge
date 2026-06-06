"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getApprovals } from "./actions";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  APPROVED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
  ESCALATED: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

export default function ApprovalsPage() {
  const [mounted, setMounted] = useState(false);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusTab, setStatusTab] = useState("ALL");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getApprovals({
        page,
        limit: 10,
        status: statusTab,
        search: debouncedSearch,
      });

      if (res.success) {
        setApprovals(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusTab, debouncedSearch]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  useEffect(() => {
    setPage(1);
  }, [statusTab, debouncedSearch]);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Approvals
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Review vendor quotations and internal requests
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className={cn(
          "flex gap-1 border-b border-[hsl(var(--border))] overflow-x-auto transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{ transitionDelay: "100ms" }}
      >
        {["ALL", "PENDING", "APPROVED", "REJECTED", "ESCALATED"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusTab(tab)}
            className={cn(
              "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              statusTab === tab
                ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div
        className={cn(
          "rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{ transitionDelay: "200ms" }}
      >
        <div className="p-6 space-y-5">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[hsl(var(--muted-foreground))]" />
              <input
                type="text"
                placeholder="Search RFQs or Vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[hsl(var(--muted))]/40 border border-[hsl(var(--border))] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--ring))]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Details
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Quotation & Vendor
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                      Loading approvals...
                    </td>
                  </tr>
                ) : approvals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                      No approvals found.
                    </td>
                  </tr>
                ) : (
                  approvals.map((app) => (
                    <tr
                      key={app.id}
                      className="border-b border-[hsl(var(--border))]/50 last:border-0 hover:bg-[hsl(var(--accent))]/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-[hsl(var(--foreground))]">{app.rfqTitle}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">{app.rfqNumber}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-[hsl(var(--foreground))]">{app.vendor}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">{app.quotationNumber}</div>
                      </td>
                      <td className="py-4 px-4 text-[hsl(var(--muted-foreground))]">
                        {new Date(app.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-4 px-4 font-semibold text-[hsl(var(--foreground))]">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(app.amount)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                            STATUS_STYLES[app.status] || ""
                          )}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link href={`/approvals/${app.id}`}>
                          <Button variant="ghost" size="sm" className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]">
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[hsl(var(--border))]">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="gap-1 rounded-lg"
              >
                <ChevronLeft className="size-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="gap-1 rounded-lg"
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
