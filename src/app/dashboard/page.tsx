"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  Receipt,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────
interface StatCard {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
  gradient: string;
}

interface PurchaseOrderRow {
  poNumber: string;
  vendor: string;
  amount: string;
  status: "Approved" | "Pending" | "Draft" | "Issued";
}

// ─────────────────────────────────────────────────────
// Demo data
// ─────────────────────────────────────────────────────
const STATS: StatCard[] = [
  {
    label: "Active RFQ's",
    value: "12",
    change: "+3 this week",
    trend: "up",
    icon: FileText,
    color: "hsl(249, 82%, 56%)",
    gradient: "linear-gradient(135deg, hsl(249,82%,56%) 0%, hsl(262,80%,60%) 100%)",
  },
  {
    label: "Pending Approvals",
    value: "5",
    change: "2 urgent",
    trend: "neutral",
    icon: Clock,
    color: "hsl(38, 92%, 50%)",
    gradient: "linear-gradient(135deg, hsl(38,92%,50%) 0%, hsl(25,95%,53%) 100%)",
  },
  {
    label: "PO's this month",
    value: "₹2.3L",
    change: "+18% vs last month",
    trend: "up",
    icon: ShoppingCart,
    color: "hsl(160, 84%, 39%)",
    gradient: "linear-gradient(135deg, hsl(160,84%,39%) 0%, hsl(172,66%,40%) 100%)",
  },
  {
    label: "Overdue Invoices",
    value: "3",
    change: "₹45K outstanding",
    trend: "down",
    icon: AlertTriangle,
    color: "hsl(0, 84%, 60%)",
    gradient: "linear-gradient(135deg, hsl(0,84%,60%) 0%, hsl(15,80%,55%) 100%)",
  },
];

const RECENT_POS: PurchaseOrderRow[] = [
  { poNumber: "PO-001", vendor: "Infra Solutions", amount: "₹87,000", status: "Approved" },
  { poNumber: "PO-002", vendor: "Tech Core Ltd", amount: "₹1,40,000", status: "Pending" },
  { poNumber: "PO-003", vendor: "OfficeNeed Co.", amount: "₹34,900", status: "Draft" },
  { poNumber: "PO-004", vendor: "FastTrack Logistics", amount: "₹62,500", status: "Issued" },
  { poNumber: "PO-005", vendor: "TechSupply India", amount: "₹1,15,000", status: "Approved" },
];

const STATUS_STYLES: Record<string, string> = {
  Approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Draft: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20",
  Issued: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

// Spending data for the mini chart
const SPENDING_DATA = [
  { month: "Jan", value: 145000 },
  { month: "Feb", value: 198000 },
  { month: "Mar", value: 165000 },
  { month: "Apr", value: 230000 },
  { month: "May", value: 210000 },
  { month: "Jun", value: 280000 },
];

// ─────────────────────────────────────────────────────
// Animated number counter
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
      // Ease-out cubic
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

// ─────────────────────────────────────────────────────
// Mini line chart (SVG)
// ─────────────────────────────────────────────────────
function SpendingChart() {
  const maxVal = Math.max(...SPENDING_DATA.map((d) => d.value));
  const chartWidth = 320;
  const chartHeight = 140;
  const padding = { top: 10, right: 10, bottom: 28, left: 10 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const points = SPENDING_DATA.map((d, i) => ({
    x: padding.left + (i / (SPENDING_DATA.length - 1)) * innerW,
    y: padding.top + innerH - (d.value / maxVal) * innerH,
  }));

  // Smooth curve path
  const linePath = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cpx1 = prev.x + (p.x - prev.x) / 3;
      const cpx2 = prev.x + (2 * (p.x - prev.x)) / 3;
      return `C ${cpx1} ${prev.y} ${cpx2} ${p.y} ${p.x} ${p.y}`;
    })
    .join(" ");

  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`;

  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      className="w-full h-auto"
      style={{ maxHeight: "160px" }}
    >
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(249, 82%, 56%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(249, 82%, 56%)" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(249, 82%, 56%)" />
          <stop offset="100%" stopColor="hsl(262, 80%, 60%)" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path
        d={areaPath}
        fill="url(#chartGradient)"
        className={cn(
          "transition-opacity duration-1000",
          animated ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "transition-all duration-1000",
          animated ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r="4"
            fill="hsl(249, 82%, 56%)"
            stroke="hsl(var(--background))"
            strokeWidth="2"
            className={cn(
              "transition-all duration-500",
              animated ? "opacity-100" : "opacity-0"
            )}
            style={{ transitionDelay: `${i * 100 + 500}ms` }}
          />
        </g>
      ))}

      {/* X-axis labels */}
      {SPENDING_DATA.map((d, i) => (
        <text
          key={d.month}
          x={points[i].x}
          y={chartHeight - 4}
          textAnchor="middle"
          className="fill-[hsl(var(--muted-foreground))]"
          style={{ fontSize: "10px", fontFamily: "var(--font-sans)" }}
        >
          {d.month}
        </text>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────
// Mini donut chart (SVG)
// ─────────────────────────────────────────────────────
function CategoryDonut() {
  const categories = [
    { label: "IT Hardware", value: 45, color: "hsl(249, 82%, 56%)" },
    { label: "Logistics", value: 25, color: "hsl(160, 84%, 39%)" },
    { label: "Raw Materials", value: 20, color: "hsl(38, 92%, 50%)" },
    { label: "Services", value: 10, color: "hsl(0, 84%, 60%)" },
  ];

  const total = categories.reduce((s, c) => s + c.value, 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" className="size-24 shrink-0">
        {categories.map((cat) => {
          const dashLen = (cat.value / total) * circumference;
          const dashGap = circumference - dashLen;
          const currentOffset = offset;
          offset += dashLen;

          return (
            <circle
              key={cat.label}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={cat.color}
              strokeWidth="14"
              strokeDasharray={`${dashLen} ${dashGap}`}
              strokeDashoffset={-currentOffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              className="transition-all duration-1000"
            />
          );
        })}
        <text
          x="60"
          y="56"
          textAnchor="middle"
          className="fill-[hsl(var(--foreground))]"
          style={{ fontSize: "16px", fontWeight: 700, fontFamily: "var(--font-sans)" }}
        >
          ₹12.3L
        </text>
        <text
          x="60"
          y="72"
          textAnchor="middle"
          className="fill-[hsl(var(--muted-foreground))]"
          style={{ fontSize: "9px", fontFamily: "var(--font-sans)" }}
        >
          Total Spend
        </text>
      </svg>
      <div className="space-y-1.5">
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-[hsl(var(--muted-foreground))]">{cat.label}</span>
            <span className="ml-auto font-medium text-[hsl(var(--foreground))]">
              {cat.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Dashboard Page
// ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* ── Header ── */}
      <div
        className={cn(
          "transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
          Dashboard
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Welcome back, Procurement Officer — Today&apos;s Overview
        </p>
      </div>

      {/* ── Stat Cards ── */}
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
                "transition-all duration-500 cursor-pointer",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
              style={{ transitionDelay: `${i * 100 + 200}ms` }}
            >
              {/* Background glow */}
              <div
                className="absolute -top-8 -right-8 size-24 rounded-full opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500 blur-2xl"
                style={{ background: stat.color }}
              />

              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                    {stat.label}
                  </p>
                  <div className="mt-2">
                    <AnimatedValue
                      value={stat.value}
                      className="text-3xl font-bold text-[hsl(var(--foreground))]"
                    />
                  </div>
                  {stat.change && (
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === "up" && (
                        <TrendingUp className="size-3 text-emerald-500" />
                      )}
                      {stat.trend === "down" && (
                        <TrendingDown className="size-3 text-red-500" />
                      )}
                      <span
                        className={cn(
                          "text-xs font-medium",
                          stat.trend === "up"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : stat.trend === "down"
                            ? "text-red-600 dark:text-red-400"
                            : "text-amber-600 dark:text-amber-400"
                        )}
                      >
                        {stat.change}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className="size-11 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0"
                  style={{ background: stat.gradient }}
                >
                  <Icon className="size-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Middle Row: PO Table + Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Recent Purchase Orders — 3 cols */}
        <div
          className={cn(
            "lg:col-span-3 rounded-2xl p-6",
            "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
            "transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
              Recent Purchase Orders
            </h2>
            <Link
              href="/purchase-orders"
              className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--primary))] hover:underline transition-colors"
            >
              View all <ChevronRight className="size-3" />
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    PO#
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {RECENT_POS.map((po, i) => (
                  <tr
                    key={po.poNumber}
                    className={cn(
                      "border-b border-[hsl(var(--border))]/50 last:border-0",
                      "hover:bg-[hsl(var(--accent))]/50 transition-colors duration-150",
                      "cursor-pointer"
                    )}
                  >
                    <td className="py-3.5 px-3 font-medium text-[hsl(var(--foreground))]">
                      {po.poNumber}
                    </td>
                    <td className="py-3.5 px-3 text-[hsl(var(--muted-foreground))]">
                      {po.vendor}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[hsl(var(--foreground))]">
                      {po.amount}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                          STATUS_STYLES[po.status] || ""
                        )}
                      >
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spending Trends — 2 cols */}
        <div
          className={cn(
            "lg:col-span-2 rounded-2xl p-6",
            "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
            "transition-all duration-700 space-y-6",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
          style={{ transitionDelay: "750ms" }}
        >
          <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
            Spending Trends
          </h2>

          {/* Line chart */}
          <div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2 font-medium">
              Last 6 months
            </p>
            <SpendingChart />
          </div>

          {/* Divider */}
          <div className="border-t border-[hsl(var(--border))]" />

          {/* Category breakdown donut */}
          <div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3 font-medium">
              By Category
            </p>
            <CategoryDonut />
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div
        className={cn(
          "pt-2 transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
        style={{ transitionDelay: "900ms" }}
      >
        <div className="border-t border-[hsl(var(--border))] pt-6">
          <h2 className="text-base font-semibold text-[hsl(var(--foreground))] mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/rfqs/new">
              <Button
                size="lg"
                className="gap-2 rounded-xl px-6 shadow-md shadow-[hsl(var(--primary))]/20 hover:shadow-lg hover:shadow-[hsl(var(--primary))]/30 transition-shadow"
              >
                <Plus className="size-4" />
                New RFQ
              </Button>
            </Link>
            <Link href="/vendors">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-xl px-6 hover:border-[hsl(var(--ring))]/30 transition-colors"
              >
                <Users className="size-4" />
                Add Vendor
              </Button>
            </Link>
            <Link href="/invoices">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-xl px-6 hover:border-[hsl(var(--ring))]/30 transition-colors"
              >
                <Receipt className="size-4" />
                View Invoices
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
