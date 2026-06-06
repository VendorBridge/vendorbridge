"use client";

import { FileText, FilePen, Send, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RfqStats } from "@/lib/rfqs";
import { RFQStatsCardsSkeleton } from "./RFQSkeleton";

interface RFQStatsCardsProps {
  stats: RfqStats;
  loading?: boolean;
  mounted?: boolean;
}

const STAT_ITEMS = [
  {
    key: "total" as const,
    label: "Total RFQs",
    icon: FileText,
    color: "text-[hsl(var(--primary))]",
    bg: "bg-[hsl(var(--primary))]/10",
  },
  {
    key: "draft" as const,
    label: "Draft",
    icon: FilePen,
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-500/10",
  },
  {
    key: "published" as const,
    label: "Published",
    icon: Send,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    key: "closedAndAwarded" as const,
    label: "Closed & Awarded",
    icon: Trophy,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

export default function RFQStatsCards({ stats, loading, mounted = true }: RFQStatsCardsProps) {
  if (loading) {
    return <RFQStatsCardsSkeleton />;
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 transition-all duration-700",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{ transitionDelay: "100ms" }}
    >
      {STAT_ITEMS.map(({ key, label, icon: Icon, color, bg }) => (
        <Card key={key} className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{label}</p>
                <p className="text-2xl font-bold tracking-tight mt-1 text-[hsl(var(--foreground))]">
                  {stats[key]}
                </p>
              </div>
              <div className={cn("rounded-xl p-2.5", bg)}>
                <Icon className={cn("size-5", color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
