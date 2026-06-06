import { cn } from "@/lib/utils";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("bg-[hsl(var(--muted))] rounded animate-pulse", className)} />;
}

export function RFQStatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-3"
        >
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function RFQTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-[hsl(var(--border))]/50">
          {Array.from({ length: 7 }).map((__, j) => (
            <td key={j} className="py-4 px-3">
              <SkeletonBlock className="h-4 w-full max-w-[120px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
