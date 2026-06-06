"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Search, Users, X, Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCategory } from "@/lib/vendors";
import type { RfqFormValues } from "@/lib/rfq-schema";
import type { VendorCategory } from "@prisma/client";

interface VendorOption {
  id: string;
  companyName: string;
  category: VendorCategory;
  rating: number | null;
}

interface VendorMultiSelectProps {
  category: VendorCategory;
}

export function VendorMultiSelect({ category }: VendorMultiSelectProps) {
  const { watch, setValue, formState } = useFormContext<RfqFormValues>();
  const vendorIds = watch("vendorIds") ?? [];
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/vendors?category=${category}&status=ACTIVE&limit=100`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.success) {
          setVendors(data.vendors ?? []);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  const selectedVendors = useMemo(
    () => vendors.filter((v) => vendorIds.includes(v.id)),
    [vendors, vendorIds]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vendors.filter(
      (v) =>
        !q ||
        v.companyName.toLowerCase().includes(q) ||
        formatCategory(v.category).toLowerCase().includes(q)
    );
  }, [vendors, search]);

  const toggleVendor = (id: string) => {
    const next = vendorIds.includes(id)
      ? vendorIds.filter((v) => v !== id)
      : [...vendorIds, id];
    setValue("vendorIds", next, { shouldDirty: true });
  };

  const removeVendor = (id: string) => {
    setValue(
      "vendorIds",
      vendorIds.filter((v) => v !== id),
      { shouldDirty: true }
    );
  };

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-3">
          <div
            className="size-9 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md"
            style={{
              background:
                "linear-gradient(135deg, hsl(249,82%,50%) 0%, hsl(262,80%,55%) 100%)",
            }}
          >
            <Users className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
              Assign Vendors
            </h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {vendorIds.length} vendor{vendorIds.length !== 1 ? "s" : ""} selected
              {category ? ` · filtered by ${formatCategory(category)}` : ""}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="gap-1.5 rounded-lg"
        >
          <Plus className="size-3.5" />
          Add vendor
        </Button>
      </div>

      <div className="p-6">
        {selectedVendors.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-6">
            No vendors selected. Click &quot;Add vendor&quot; to invite vendors matching this category.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedVendors.map((v) => (
              <Badge
                key={v.id}
                variant="secondary"
                className="gap-1.5 py-1.5 px-3 text-sm"
              >
                <span className="font-medium">{v.companyName}</span>
                <span className="text-[hsl(var(--muted-foreground))]">·</span>
                <span className="text-[hsl(var(--muted-foreground))]">
                  {formatCategory(v.category)}
                </span>
                {v.rating != null && (
                  <>
                    <span className="text-[hsl(var(--muted-foreground))]">·</span>
                    <span className="flex items-center gap-0.5">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {v.rating.toFixed(1)}
                    </span>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => removeVendor(v.id)}
                  className="ml-1 opacity-60 hover:opacity-100"
                  aria-label={`Remove ${v.companyName}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {formState.errors.vendorIds && (
          <p className="text-xs text-red-500 mt-3">
            {formState.errors.vendorIds.message}
          </p>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
              <h3 className="text-base font-semibold">Select Vendors</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[hsl(var(--accent))]"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 border-b border-[hsl(var(--border))]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search vendors..."
                  className="pl-9 rounded-xl"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 min-h-[150px]">
              {loading ? (
                <p className="text-sm text-center py-8 text-[hsl(var(--muted-foreground))]">
                  Loading vendors...
                </p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-center py-8 text-[hsl(var(--muted-foreground))]">
                  No active vendors found for this category.
                </p>
              ) : (
                filtered.map((v) => {
                  const selected = vendorIds.includes(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleVendor(v.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors",
                        selected
                          ? "bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30"
                          : "hover:bg-[hsl(var(--accent))] border border-transparent"
                      )}
                    >
                      <div
                        className={cn(
                          "size-4 rounded border shrink-0 flex items-center justify-center",
                          selected
                            ? "bg-[hsl(var(--primary))] border-[hsl(var(--primary))]"
                            : "border-[hsl(var(--border))]"
                        )}
                      >
                        {selected && (
                          <svg viewBox="0 0 12 12" className="size-2.5 text-white fill-current">
                            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{v.companyName}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {formatCategory(v.category)}
                          {v.rating != null && ` · ★ ${v.rating.toFixed(1)}`}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-6 py-4 border-t border-[hsl(var(--border))] flex justify-end">
              <Button type="button" onClick={() => setModalOpen(false)} className="rounded-xl">
                Done ({vendorIds.length} selected)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
