import { cn } from "@/lib/utils";
import { formatStatus } from "@/lib/vendors";
import type { VendorStatus } from "@prisma/client";

const STATUS_STYLES: Record<VendorStatus, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  INACTIVE: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20",
  PENDING_VERIFICATION: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  BLACKLISTED: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
};

export default function StatusBadge({ status }: { status: VendorStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
        STATUS_STYLES[status]
      )}
    >
      {formatStatus(status)}
    </span>
  );
}
