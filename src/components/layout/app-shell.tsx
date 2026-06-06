"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";

/**
 * Shared app shell with TopNav + Sidebar.
 * Used by all authenticated page layouts (dashboard, quotations, vendors, etc.)
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[hsl(var(--background))]">
          {children}
        </main>
      </div>
    </div>
  );
}
