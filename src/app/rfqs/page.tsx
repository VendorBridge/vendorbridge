"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RfqListItem, RfqStats, RfqStatusTab, RfqTabCounts } from "@/lib/rfqs";
import RFQStatsCards from "./components/RFQStatsCards";
import RFQFilters from "./components/RFQFilters";
import RFQTable from "./components/RFQTable";

const EMPTY_STATS: RfqStats = {
  total: 0,
  draft: 0,
  published: 0,
  closedAndAwarded: 0,
};

const EMPTY_COUNTS: RfqTabCounts = {
  all: 0,
  draft: 0,
  published: 0,
  closed: 0,
  cancelled: 0,
  awarded: 0,
};

export default function RfqsPage() {
  const [mounted, setMounted] = useState(false);
  const [rfqs, setRfqs] = useState<RfqListItem[]>([]);
  const [stats, setStats] = useState<RfqStats>(EMPTY_STATS);
  const [counts, setCounts] = useState<RfqTabCounts>(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusTab, setStatusTab] = useState<RfqStatusTab>("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchRfqs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        status: statusTab,
      });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/rfqs?${params}`);
      const data = await res.json();

      if (data.success) {
        setRfqs(data.data);
        setStats(data.stats ?? EMPTY_STATS);
        setCounts(data.counts ?? EMPTY_COUNTS);
        setTotalPages(data.pagination.totalPages);
      } else {
        setToast(data.error ?? "Failed to load RFQs.");
      }
    } catch {
      setToast("Failed to load RFQs.");
    } finally {
      setLoading(false);
    }
  }, [page, statusTab, debouncedSearch]);

  useEffect(() => {
    fetchRfqs();
  }, [fetchRfqs]);

  useEffect(() => {
    setPage(1);
  }, [statusTab, debouncedSearch]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleClearFilters = () => {
    setSearch("");
    setStatusTab("ALL");
  };

  const hasActiveFilters = debouncedSearch.trim() !== "" || statusTab !== "ALL";

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            RFQs
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Manage request for quotations
          </p>
        </div>
        <Link href="/rfqs/new">
          <Button
            size="lg"
            className="gap-2 rounded-xl shadow-md shadow-[hsl(var(--primary))]/20"
          >
            <Plus className="size-4" />
            Create RFQ
          </Button>
        </Link>
      </div>

      <RFQStatsCards stats={stats} loading={loading && rfqs.length === 0 && stats.total === 0} mounted={mounted} />

      <div
        className={cn(
          "rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{ transitionDelay: "200ms" }}
      >
        <div className="p-6 space-y-5">
          <RFQFilters
            search={search}
            statusTab={statusTab}
            counts={counts}
            onSearchChange={setSearch}
            onStatusChange={setStatusTab}
            onClear={handleClearFilters}
          />
          <RFQTable
            rfqs={rfqs}
            loading={loading}
            isEmpty={stats.total === 0}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

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

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium
          bg-[hsl(var(--foreground))] text-[hsl(var(--background))] shadow-lg animate-in fade-in slide-in-from-bottom-2"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
