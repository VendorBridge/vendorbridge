"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StatusTab } from "@/lib/vendors";
import type { VendorListItem } from "@/lib/vendors";
import type { VendorCategory } from "@prisma/client";
import VendorFilters from "./components/VendorFilters";
import VendorsTable from "./components/VendorsTable";
import AddVendorModal from "./components/AddVendorModal";

interface TabCounts {
  all: number;
  active: number;
  pending: number;
  blocked: number;
}

const TABS: { key: StatusTab; label: string; countKey: keyof TabCounts }[] = [
  { key: "ALL", label: "All", countKey: "all" },
  { key: "ACTIVE", label: "Active", countKey: "active" },
  { key: "PENDING", label: "Pending", countKey: "pending" },
  { key: "BLOCKED", label: "Blocked", countKey: "blocked" },
];

export default function VendorsPage() {
  const [mounted, setMounted] = useState(false);
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<TabCounts>({ all: 0, active: 0, pending: 0, blocked: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusTab, setStatusTab] = useState<StatusTab>("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<VendorCategory | "">("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        status: statusTab,
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (category) params.set("category", category);

      const res = await fetch(`/api/vendors?${params}`);
      const data = await res.json();

      if (data.success) {
        setVendors(data.vendors);
        setCounts(data.counts);
        setTotalPages(data.pagination.totalPages);
      }
    } catch {
      setToast("Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  }, [page, statusTab, debouncedSearch, category]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  useEffect(() => {
    setPage(1);
  }, [statusTab, debouncedSearch, category]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
  };

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
            Vendors
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Manage supplier profiles and registrations
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setModalOpen(true)}
          className="gap-2 rounded-xl shadow-md shadow-[hsl(var(--primary))]/20"
        >
          <Plus className="size-4" />
          Add Vendor
        </Button>
      </div>

      {/* Stats tabs */}
      <div
        className={cn(
          "flex gap-1 border-b border-[hsl(var(--border))] overflow-x-auto transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{ transitionDelay: "100ms" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusTab(tab.key)}
            className={cn(
              "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              statusTab === tab.key
                ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/50"
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">({counts[tab.countKey]})</span>
          </button>
        ))}
      </div>

      {/* Filters + Table card */}
      <div
        className={cn(
          "rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{ transitionDelay: "200ms" }}
      >
        <div className="p-6 space-y-5">
          <VendorFilters
            search={search}
            category={category}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onClear={handleClearFilters}
          />
          <VendorsTable vendors={vendors} loading={loading} />
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

      <AddVendorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setToast("Vendor created successfully.");
          fetchVendors();
        }}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium
          bg-[hsl(var(--foreground))] text-[hsl(var(--background))] shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
}
