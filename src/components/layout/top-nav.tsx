"use client";

import { Sparkles, Bell, Sun, Moon, LogOut, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getCurrentUser } from "@/app/actions/session";
import { signOut } from "next-auth/react";

export function TopNav() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<{ firstName: string; lastName: string; role: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    getCurrentUser().then((res) => {
      if (res) {
        setUser(res);
      }
    });
  }, []);

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "PP";

  const fullName = user
    ? `${user.firstName} ${user.lastName}`
    : "Priya Patel";

  const formatRole = (role: string) => {
    if (!role) return "Procurement Officer";
    return role.split("_").map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(" ");
  };

  const roleName = user
    ? formatRole(user.role)
    : "Procurement Officer";

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
        {/* Theme toggle — smooth spin animation */}
        {mounted && (
          <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "relative p-2.5 rounded-xl cursor-pointer overflow-hidden",
              "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
              "hover:bg-[hsl(var(--accent))]",
              "transition-colors duration-300"
            )}
          >
            <div className="relative size-[18px]">
              {/* Sun icon */}
              <Sun
                className={cn(
                  "absolute inset-0 size-[18px] transition-all duration-500 ease-in-out",
                  theme === "dark"
                    ? "rotate-90 scale-0 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                )}
              />
              {/* Moon icon */}
              <Moon
                className={cn(
                  "absolute inset-0 size-[18px] transition-all duration-500 ease-in-out",
                  theme === "dark"
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                )}
              />
            </div>
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

        {/* Avatar / Sign Out */}
        <button
          type="button"
          onClick={() => {
            if (confirm("Are you sure you want to sign out?")) {
              signOut({ callbackUrl: "/login" });
            }
          }}
          title="Sign Out"
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
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-[hsl(var(--foreground))] leading-none">
              {fullName}
            </p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-tight mt-0.5">
              {roleName}
            </p>
          </div>
          <LogOut className="size-3.5 text-[hsl(var(--muted-foreground))] ml-1 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
