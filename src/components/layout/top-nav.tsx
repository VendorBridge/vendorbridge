"use client";

import { Sparkles, Bell, Sun, Moon, LogOut, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function TopNav() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header
      className={cn(
        "h-16 flex items-center justify-between px-6",
        "border-b border-[hsl(var(--border))]",
        "bg-[hsl(var(--background))]/80 backdrop-blur-xl",
        "sticky top-0 z-40"
      )}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div
          className="size-9 rounded-xl flex items-center justify-center shadow-lg"
          style={{
            background:
              "linear-gradient(135deg, hsl(249,82%,50%) 0%, hsl(262,80%,55%) 100%)",
          }}
        >
          <Sparkles className="size-4 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-[hsl(var(--foreground))]">
            VendorBridge
          </span>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium -mt-0.5 hidden sm:block">
            Procurement & Vendor ERP
          </p>
        </div>
      </div>

      {/* Center: Search (subtle) */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div
          className={cn(
            "flex items-center gap-2 w-full px-4 py-2 rounded-xl",
            "bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))]",
            "text-sm text-[hsl(var(--muted-foreground))]",
            "hover:border-[hsl(var(--ring))]/30 transition-colors duration-200",
            "cursor-text"
          )}
        >
          <Search className="size-4 shrink-0" />
          <span>Search anything...</span>
          <kbd className="ml-auto hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        {mounted && (
          <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "p-2 rounded-xl transition-colors duration-200 cursor-pointer",
              "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
              "hover:bg-[hsl(var(--accent))]"
            )}
          >
            <Sun className="size-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 -mt-[18px]" />
          </button>
        )}

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => setShowNotifications(!showNotifications)}
          className={cn(
            "relative p-2 rounded-xl transition-colors duration-200 cursor-pointer",
            "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
            "hover:bg-[hsl(var(--accent))]"
          )}
        >
          <Bell className="size-[18px]" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500 ring-2 ring-[hsl(var(--background))]" />
        </button>

        {/* Avatar */}
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 ml-1 p-1 pr-3 rounded-xl cursor-pointer",
            "hover:bg-[hsl(var(--accent))] transition-colors duration-200"
          )}
        >
          <div
            className="size-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
            style={{
              background:
                "linear-gradient(135deg, hsl(249,82%,50%) 0%, hsl(262,80%,55%) 100%)",
            }}
          >
            PP
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-[hsl(var(--foreground))] leading-none">
              Priya Patel
            </p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-tight mt-0.5">
              Procurement Officer
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
