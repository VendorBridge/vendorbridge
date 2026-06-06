"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, VENDOR_CATEGORIES } from "@/lib/vendors";
import type { VendorCategory } from "@prisma/client";

interface VendorFiltersProps {
  search: string;
  category: VendorCategory | "";
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: VendorCategory | "") => void;
  onClear: () => void;
}

export default function VendorFilters({
  search,
  category,
  onSearchChange,
  onCategoryChange,
  onClear,
}: VendorFiltersProps) {
  const hasFilters = search.trim() !== "" || category !== "";

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[hsl(var(--muted-foreground))]" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, GST, email, or phone..."
          className="pl-10 h-11"
          aria-label="Search vendors"
        />
      </div>

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value as VendorCategory | "")}
        className="flex h-11 min-w-[180px] rounded-[var(--radius)] border border-[hsl(var(--border))]
          bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))]
          focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {VENDOR_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {CATEGORY_LABELS[cat]}
          </option>
        ))}
      </select>

      {hasFilters && (
        <Button type="button" variant="outline" onClick={onClear} className="gap-2 h-11 rounded-xl">
          <X className="size-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
