"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
     CheckCircle,
     Clock,
     FileText,
     Users,
     AlertCircle,
     Filter,
} from "lucide-react";

interface ActivityLog {
     id: string;
     type: "quotation" | "approval" | "rfq" | "invoice" | "vendor";
     title: string;
     description: string;
     timestamp: string;
     status?: "completed" | "pending" | "warning";
     icon: React.ElementType;
}

const ACTIVITY_LOGS: ActivityLog[] = [
     {
          id: "1",
          type: "quotation",
          title: "Quotation selected",
          description: "Infra supplies pvt ltd selected for office furniture Q2",
          timestamp: "23 may 2025, 4:15 PM",
          status: "completed",
          icon: CheckCircle,
     },
     {
          id: "2",
          type: "approval",
          title: "Approval pending",
          description: "PO-2024 awaiting L2 approval by priya shah",
          timestamp: "22 may 2025, 09:15 AM",
          status: "pending",
          icon: Clock,
     },
     {
          id: "3",
          type: "rfq",
          title: "RFQ published",
          description: "Office furniture Q2 sent to 3 vendors",
          timestamp: "19 may 2025",
          status: "completed",
          icon: FileText,
     },
     {
          id: "4",
          type: "vendor",
          title: "Vendor added",
          description: "Vendor added - FastTrack transport registered and pending verifications",
          timestamp: "19 may 2025, 3:20 PM",
          status: "pending",
          icon: Users,
     },
];

const FILTER_TABS = [
     { id: "all", label: "All", type: null },
     { id: "rfq", label: "RFQ", type: "rfq" },
     { id: "approvals", label: "Approvals", type: "approval" },
     { id: "invoices", label: "Invoices", type: "invoice" },
     { id: "vendors", label: "Vendors", type: "vendor" },
];

export default function ActivityPage() {
     const [activeFilter, setActiveFilter] = useState<string | null>(null);

     const filteredLogs = activeFilter
          ? ACTIVITY_LOGS.filter((log) => log.type === activeFilter)
          : ACTIVITY_LOGS;

     const getStatusColor = (status?: string) => {
          switch (status) {
               case "completed":
                    return "text-emerald-500";
               case "pending":
                    return "text-amber-500";
               case "warning":
                    return "text-red-500";
               default:
                    return "text-blue-500";
          }
     };

     const getStatusBgColor = (status?: string) => {
          switch (status) {
               case "completed":
                    return "bg-emerald-500/10";
               case "pending":
                    return "bg-amber-500/10";
               case "warning":
                    return "bg-red-500/10";
               default:
                    return "bg-blue-500/10";
          }
     };

     return (
          <div className="flex flex-col gap-8 p-6 lg:p-8">
               {/* Header */}
               <div className="flex flex-col gap-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                         Activity & Logs
                    </h1>
                    <p className="text-sm text-muted-foreground">
                         Procurement audit trail
                    </p>
               </div>

               {/* Filter Tabs */}
               <div className="flex flex-wrap gap-2 pb-4 border-b border-border/50">
                    {FILTER_TABS.map((tab) => (
                         <button
                              key={tab.id}
                              onClick={() => setActiveFilter(tab.type)}
                              className={cn(
                                   "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                   "border border-border/50",
                                   activeFilter === tab.type
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-transparent text-foreground hover:bg-muted hover:border-border"
                              )}
                         >
                              {tab.label}
                         </button>
                    ))}
               </div>

               {/* Activity Timeline */}
               <div className="flex flex-col gap-4">
                    {filteredLogs.map((log, index) => {
                         const Icon = log.icon;
                         return (
                              <div
                                   key={log.id}
                                   className={cn(
                                        "flex gap-4 p-4 rounded-xl",
                                        "bg-card border border-border/50",
                                        "hover:border-border/80 transition-colors",
                                        "group"
                                   )}
                              >
                                   {/* Timeline dot and line */}
                                   <div className="flex flex-col items-center gap-2 pt-1">
                                        <div
                                             className={cn(
                                                  "w-10 h-10 rounded-full flex items-center justify-center",
                                                  "transition-colors",
                                                  getStatusBgColor(log.status)
                                             )}
                                        >
                                             <Icon className={cn("w-5 h-5", getStatusColor(log.status))} />
                                        </div>
                                        {index < filteredLogs.length - 1 && (
                                             <div className="w-0.5 h-8 bg-border/50 group-last:hidden" />
                                        )}
                                   </div>

                                   {/* Content */}
                                   <div className="flex-1 pt-1">
                                        <div className="flex flex-col gap-1">
                                             <h3 className="font-semibold text-foreground text-sm">
                                                  {log.title}
                                             </h3>
                                             <p className="text-xs text-muted-foreground">
                                                  {log.description}
                                             </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground/70 mt-2">
                                             {log.timestamp}
                                        </p>
                                   </div>
                              </div>
                         );
                    })}
               </div>

               {/* Empty state */}
               {filteredLogs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                         <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <FileText className="w-6 h-6 text-muted-foreground" />
                         </div>
                         <p className="text-muted-foreground font-medium">No activity found</p>
                         <p className="text-xs text-muted-foreground/70">
                              Try changing your filter
                         </p>
                    </div>
               )}
          </div>
     );
}
