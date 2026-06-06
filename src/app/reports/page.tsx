"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  IndianRupee,
  Users,
  PackageCheck,
  AlertTriangle,
  Download,
  Calendar,
  ChevronDown,
  TrendingUp,
} from "lucide-react";

// ─────────────────────────────────────────────────────
// Types & demo data
// ─────────────────────────────────────────────────────
interface StatCard {
  label: string;
  value: string;
  color: string;
  icon: React.ElementType;
}

interface CategorySpend {
  label: string;
  amount: number;
  display: string;
  color: string;
}

interface TopVendor {
  name: string;
  spend: number;
  pos: number;
}

interface MonthlyTrend {
  month: string;
  value: number;
}

const MONTH_OPTIONS = [
  "January 2025",
  "February 2025",
  "March 2025",
  "April 2025",
  "May 2025",
];

const STATS: StatCard[] = [
  {
    label: "Total Spend",
    value: "₹1.2M",
    color: "hsl(249, 82%, 56%)",
    icon: IndianRupee,
  },
  {
    label: "Active Vendors",
    value: "28",
    color: "hsl(160, 84%, 39%)",
    icon: Users,
  },
  {
    label: "PO Fulfillment",
    value: "94%",
    color: "hsl(38, 92%, 50%)",
    icon: PackageCheck,
  },
  {
    label: "Overdue Invoices",
    value: "3",
    color: "hsl(0, 84%, 60%)",
    icon: AlertTriangle,
  },
];

const CATEGORY_SPEND: CategorySpend[] = [
  { label: "IT Hardware", amount: 480000, display: "₹4.8L", color: "hsl(249, 82%, 56%)" },
  { label: "Furniture", amount: 320000, display: "₹3.2L", color: "hsl(160, 84%, 39%)" },
  { label: "Stationery", amount: 210000, display: "₹2.1L", color: "hsl(38, 92%, 50%)" },
  { label: "Logistics", amount: 230000, display: "₹2.3L", color: "hsl(0, 84%, 60%)" },
];

const TOP_VENDORS: TopVendor[] = [
  { name: "TechCore Ltd", spend: 420000, pos: 6 },
  { name: "Infra Supplies", spend: 310000, pos: 4 },
  { name: "FastLog", spend: 190000, pos: 3 },
];

const MONTHLY_TREND: MonthlyTrend[] = [
  { month: "Dec", value: 820000 },
  { month: "Jan", value: 910000 },
  { month: "Feb", value: 780000 },
  { month: "Mar", value: 1050000 },
  { month: "Apr", value: 980000 },
  { month: "May", value: 1200000 },
];

// ─────────────────────────────────────────────────────
// Animated counter
// ─────────────────────────────────────────────────────
function AnimatedValue({ value, className }: { value: string; className?: string }) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const numericPart = value.replace(/[^0-9.]/g, "");
    const num = parseFloat(numericPart);
    if (isNaN(num)) {
      setDisplay(value);
      return;
    }

    const prefix = value.match(/^[^0-9.]*/)?.[0] || "";
    const suffix = value.match(/[^0-9.]*$/)?.[0] || "";
    const hasDecimal = numericPart.includes(".");
    const duration = 1200;
    const steps = 40;
    const stepDuration = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = num * eased;
      setDisplay(
        prefix +
          (hasDecimal ? current.toFixed(1) : Math.round(current).toString()) +
          suffix
      );
      if (step >= steps) clearInterval(interval);
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value]);

  return <span className={className}>{display}</span>;
}

function formatIndianNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

// ─────────────────────────────────────────────────────
// Spend by category bars
// ─────────────────────────────────────────────────────
function CategoryBars({ mounted }: { mounted: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const maxAmount = Math.max(...CATEGORY_SPEND.map((c) => c.amount));

  return (
    <div className="space-y-5">
      {CATEGORY_SPEND.map((cat, i) => {
        const pct = (cat.amount / maxAmount) * 100;
        return (
          <div
            key={cat.label}
            className="group cursor-default"
            onMouseEnter={() => setHovered(cat.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  hovered === cat.label
                    ? "text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--foreground))]"
                )}
              >
                {cat.label}
              </span>
              <span
                className="text-sm font-bold tabular-nums transition-transform"
                style={{
                  color: cat.color,
                  transform: hovered === cat.label ? "scale(1.05)" : "scale(1)",
                }}
              >
                {cat.display}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-[hsl(var(--muted))]/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: mounted ? `${pct}%` : "0%",
                  backgroundColor: cat.color,
                  transitionDelay: `${i * 100 + 400}ms`,
                  opacity: hovered && hovered !== cat.label ? 0.45 : 1,
                  boxShadow: hovered === cat.label ? `0 0 12px ${cat.color}40` : "none",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Monthly bar chart
// ─────────────────────────────────────────────────────
function MonthlyTrendChart({ mounted }: { mounted: boolean }) {
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
  const maxVal = Math.max(...MONTHLY_TREND.map((d) => d.value));
  const chartHeight = 160;
  const barWidth = 36;
  const gap = 16;
  const totalWidth = MONTHLY_TREND.length * barWidth + (MONTHLY_TREND.length - 1) * gap;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${totalWidth + 20} ${chartHeight + 32}`}
        className="w-full h-auto min-h-[180px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {MONTHLY_TREND.map((d, i) => {
          const barH = (d.value / maxVal) * chartHeight;
          const x = 10 + i * (barWidth + gap);
          const y = chartHeight - barH;
          const isCurrent = d.month === "May";
          const isHovered = hoveredMonth === d.month;

          return (
            <g
              key={d.month}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredMonth(d.month)}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              {isHovered && (
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className="fill-[hsl(var(--foreground))]"
                  style={{ fontSize: "10px", fontWeight: 600, fontFamily: "var(--font-sans)" }}
                >
                  ₹{(d.value / 100000).toFixed(1)}L
                </text>
              )}
              <rect
                x={x}
                y={mounted ? y : chartHeight}
                width={barWidth}
                height={mounted ? barH : 0}
                rx={6}
                fill={
                  isCurrent
                    ? "hsl(249, 82%, 56%)"
                    : isHovered
                    ? "hsl(249, 70%, 65%)"
                    : "hsl(249, 82%, 56%)"
                }
                opacity={isCurrent ? 1 : isHovered ? 0.85 : 0.35}
                className="transition-all duration-700 ease-out"
                style={{ transitionDelay: `${i * 80 + 500}ms` }}
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight + 20}
                textAnchor="middle"
                className={cn(
                  "transition-colors",
                  isCurrent || isHovered
                    ? "fill-[hsl(var(--foreground))]"
                    : "fill-[hsl(var(--muted-foreground))]"
                )}
                style={{
                  fontSize: "11px",
                  fontWeight: isCurrent ? 700 : 500,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Month picker dropdown
// ─────────────────────────────────────────────────────
function MonthPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (month: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        className="gap-2 rounded-xl hover:border-[hsl(var(--ring))]/30 transition-all min-w-[140px] justify-between"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex items-center gap-2">
          <Calendar className="size-4 text-[hsl(var(--muted-foreground))]" />
          {value.split(" ")[0]} {value.split(" ")[1]}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-[hsl(var(--muted-foreground))] transition-transform",
            open && "rotate-180"
          )}
        />
      </Button>

      {open && (
        <div
          className={cn(
            "absolute right-0 top-full mt-2 z-50 min-w-[180px]",
            "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))]",
            "shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-200"
          )}
        >
          {MONTH_OPTIONS.map((month) => (
            <button
              key={month}
              onClick={() => {
                onChange(month);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm transition-colors",
                value === month
                  ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] font-medium"
                  : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
              )}
            >
              {month}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Reports Page
// ─────────────────────────────────────────────────────
export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("May 2025");
  const [exporting, setExporting] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1500);
  };

  const monthLabel = selectedMonth.split(" ")[0];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* ── Header ── */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4",
          "transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Reports &amp; Analytics
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 flex items-center gap-1.5">
            <TrendingUp className="size-3.5" />
            Procurement Insights — {selectedMonth}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
          <Button
            variant="outline"
            className="gap-2 rounded-xl hover:border-[hsl(var(--ring))]/30 transition-all"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className={cn("size-4", exporting && "animate-bounce")} />
            {exporting ? "Exporting…" : "Export"}
          </Button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={cn(
                "group relative overflow-hidden rounded-2xl p-5",
                "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
                "hover:border-[hsl(var(--ring))]/30 hover:shadow-lg",
                "transition-all duration-500 cursor-default",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
              style={{ transitionDelay: `${i * 100 + 200}ms` }}
            >
              <div
                className="absolute -top-8 -right-8 size-24 rounded-full opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500 blur-2xl"
                style={{ background: stat.color }}
              />

              <div className="relative z-10 text-center sm:text-left">
                <div
                  className="text-3xl lg:text-4xl font-bold tracking-tight mb-1"
                  style={{ color: stat.color }}
                >
                  <AnimatedValue value={stat.value} />
                </div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  {stat.label}
                </p>
              </div>

              <div
                className="absolute bottom-4 right-4 size-9 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: `${stat.color}18`, color: stat.color }}
              >
                <Icon className="size-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Analytics Panel ── */}
      <div
        className={cn(
          "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]",
          "shadow-sm overflow-hidden transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
        style={{ transitionDelay: "550ms" }}
      >
        <div
          className="h-1"
          style={{
            background:
              "linear-gradient(90deg, hsl(249,82%,56%) 0%, hsl(160,84%,39%) 50%, hsl(38,92%,50%) 100%)",
          }}
        />

        <div className="p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* Spend by Category */}
            <div>
              <h2 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-6">
                Spend by Category
              </h2>
              <CategoryBars mounted={mounted} />
            </div>

            {/* Right column: Vendors + Trend */}
            <div className="space-y-8">
              {/* Top Vendors */}
              <div>
                <h2 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-4">
                  Top Vendors by Spend
                </h2>
                <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[hsl(var(--muted))]/30 border-b border-[hsl(var(--border))]">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                          Vendor
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                          Spend (₹)
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                          POs
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {TOP_VENDORS.map((vendor, i) => (
                        <tr
                          key={vendor.name}
                          className={cn(
                            "border-b border-[hsl(var(--border))]/50 last:border-0",
                            "hover:bg-[hsl(var(--accent))]/50 transition-colors duration-150 cursor-pointer"
                          )}
                        >
                          <td className="py-3.5 px-4 font-medium text-[hsl(var(--foreground))]">
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                style={{
                                  background: `hsl(${249 - i * 20}, 82%, ${56 - i * 4}%)`,
                                }}
                              >
                                {vendor.name.charAt(0)}
                              </span>
                              {vendor.name}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold text-[hsl(var(--foreground))] tabular-nums">
                            {formatIndianNumber(vendor.spend)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-semibold bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                              {vendor.pos}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monthly Trend */}
              <div>
                <h2 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-4">
                  Monthly Trend
                </h2>
                <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10 p-4 lg:p-6">
                  <MonthlyTrendChart mounted={mounted} />
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] text-center mt-2">
                    Highlighted bar = {monthLabel} {selectedMonth.split(" ")[1]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
