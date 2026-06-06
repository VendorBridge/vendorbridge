"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquareQuote,
  ShieldCheck,
  ShoppingCart,
  Receipt,
  BarChart3,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getCurrentUser } from "@/app/actions/session";

// ─────────────────────────────────────────────────────
// Navigation items
// ─────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Vendors", href: "/vendors", icon: Users },
  { label: "RFQ's", href: "/rfqs", icon: FileText },
  { label: "Quotations", href: "/quotations", icon: MessageSquareQuote },
  { label: "Approvals", href: "/approvals", icon: ShieldCheck },
  { label: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart },
  { label: "Invoices", href: "/invoices", icon: Receipt },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Activity", href: "/activity", icon: Activity },
];

const ROLE_NAV_ITEMS: Record<string, string[]> = {
  ADMIN: ["Dashboard", "Vendors", "RFQ's", "Approvals", "Purchase Orders", "Invoices", "Reports", "Activity"],
  MANAGER: ["Dashboard", "RFQ's", "Approvals", "Purchase Orders", "Invoices", "Reports", "Activity"],
  PROCUREMENT_OFFICER: ["Dashboard", "Vendors", "RFQ's", "Approvals", "Purchase Orders", "Invoices", "Reports", "Activity"],
  VENDOR: ["Dashboard", "RFQ's", "Quotations", "Purchase Orders", "Invoices", "Activity"],
};

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user?.role) {
        setRole(user.role);
      }
    });
  }, []);

  const filteredItems = NAV_ITEMS.filter((item) => {
    if (!role) return true; // Show all while loading
    const allowed = ROLE_NAV_ITEMS[role] || [];
    return allowed.includes(item.label);
  });

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full border-r border-[hsl(var(--sidebar-border))]",
        "bg-[hsl(var(--sidebar))] transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-7 z-50 flex items-center justify-center",
          "size-6 rounded-full border border-[hsl(var(--border))]",
          "bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]",
          "hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
          "shadow-sm transition-colors duration-200 cursor-pointer"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="size-3.5" />
        ) : (
          <ChevronLeft className="size-3.5" />
        )}
      </button>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                "transition-all duration-200 relative overflow-hidden",
                isActive
                  ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-md shadow-[hsl(var(--sidebar-primary))]/25"
                  : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              {/* Active indicator glow */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
              )}
              <Icon
                className={cn(
                  "shrink-0 transition-transform duration-200",
                  isActive ? "size-[18px]" : "size-[18px] group-hover:scale-110"
                )}
              />
              {!collapsed && (
                <span className="truncate transition-opacity duration-200">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom info */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-[hsl(var(--sidebar-border))]">
          <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-medium">
            VendorBridge v1.0
          </p>
        </div>
      )}
    </aside>
  );
}

