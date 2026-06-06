"use client";

import { cn } from "@/lib/utils";

export function RfqFormSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 animate-pulse">
      <div className="h-9 w-64 bg-[hsl(var(--muted))] rounded-lg" />
      <div className="h-4 w-96 bg-[hsl(var(--muted))] rounded" />

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <div className="rounded-2xl border border-[hsl(var(--border))] p-6 space-y-4">
            <div className="h-4 w-24 bg-[hsl(var(--muted))] rounded" />
            <div className="h-10 bg-[hsl(var(--muted))] rounded-xl" />
            <div className="h-10 bg-[hsl(var(--muted))] rounded-xl" />
            <div className="h-10 bg-[hsl(var(--muted))] rounded-xl" />
            <div className="h-24 bg-[hsl(var(--muted))] rounded-xl" />
          </div>
        </div>
        <div className="rounded-2xl border border-[hsl(var(--border))] p-6 space-y-4">
          <div className="h-4 w-32 bg-[hsl(var(--muted))] rounded" />
          <div className="h-12 bg-[hsl(var(--muted))] rounded-xl" />
          <div className="h-12 bg-[hsl(var(--muted))] rounded-xl" />
        </div>
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border))] p-6">
        <div className="h-4 w-28 bg-[hsl(var(--muted))] rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-[hsl(var(--muted))] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
