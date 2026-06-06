"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Receipt, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getInvoices } from "./actions";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20",
  ISSUED: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  SENT: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
  PAID: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  OVERDUE: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
  CANCELLED: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20",
};

export default function InvoicesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
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

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInvoices({
        page,
        limit: 10,
        status: statusTab,
        search: debouncedSearch,
      });

      if (res.success) {
        setInvoices(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusTab, debouncedSearch]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

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
            Invoices
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Manage vendor invoices and payments
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => {
            alert("Invoices are generated directly from official Purchase Orders. Redirecting you to the Purchase Orders page where you can choose a PO and generate its invoice.");
            router.push("/purchase-orders");
          }}
          className="gap-2 rounded-xl shadow-md shadow-[hsl(var(--primary))]/20"
        >
          <Receipt className="size-4" />
          Create Invoice
        </Button>
      </div>

      {/* Tabs */}
      <div
        className={cn(
          "flex gap-1 border-b border-[hsl(var(--border))] overflow-x-auto transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{ transitionDelay: "100ms" }}
      >
        {["ALL", "DRAFT", "ISSUED", "SENT", "PAID", "OVERDUE", "CANCELLED"].map((tab) => (
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
                placeholder="Search Invoices, POs, Vendors..."
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
                    Invoice No
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Vendor & PO
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Date & Due
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
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-[hsl(var(--border))]/50 last:border-0 hover:bg-[hsl(var(--accent))]/50 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium text-[hsl(var(--foreground))]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-[hsl(var(--foreground))]">{inv.vendor}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">PO: {inv.poNumber}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-[hsl(var(--foreground))]">{new Date(inv.date).toLocaleDateString("en-IN")}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "N/A"}</div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-[hsl(var(--foreground))]">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(inv.amount)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                            STATUS_STYLES[inv.status] || ""
                          )}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link href={`/invoices/${inv.id}`}>
                          <Button variant="ghost" size="sm" className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]">
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
