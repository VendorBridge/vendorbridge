"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RfqStatusTab } from "@/lib/rfqs";
import type { RfqTabCounts } from "@/lib/rfqs";

const STATUS_TABS: { key: RfqStatusTab; label: string; countKey: keyof RfqTabCounts }[] = [
  { key: "ALL", label: "All", countKey: "all" },
  { key: "DRAFT", label: "Draft", countKey: "draft" },
  { key: "PUBLISHED", label: "Published", countKey: "published" },
  { key: "CLOSED", label: "Closed", countKey: "closed" },
  { key: "CANCELLED", label: "Cancelled", countKey: "cancelled" },
  { key: "AWARDED", label: "Awarded", countKey: "awarded" },
];

interface RFQFiltersProps {
  search: string;
  statusTab: RfqStatusTab;
  counts: RfqTabCounts;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: RfqStatusTab) => void;
  onClear: () => void;
}

export default function RFQFilters({
  search,
  statusTab,
  counts,
  onSearchChange,
  onStatusChange,
  onClear,
}: RFQFiltersProps) {
  const hasFilters = search.trim() !== "" || statusTab !== "ALL";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[hsl(var(--muted-foreground))]" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by RFQ number or title..."
            className="pl-10 h-11"
            aria-label="Search RFQs"
          />
        </div>

        {hasFilters && (
          <Button type="button" variant="outline" onClick={onClear} className="gap-2 h-11 rounded-xl">
            <X className="size-4" />
            Clear filters
          </Button>
        )}
      </div>

      <div className="flex gap-1 border-b border-[hsl(var(--border))] overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onStatusChange(tab.key)}
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
    </div>
  );
}
