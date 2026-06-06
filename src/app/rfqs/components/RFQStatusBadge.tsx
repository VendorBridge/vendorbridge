import { cn } from "@/lib/utils";
import { formatRfqStatus } from "@/lib/rfqs";
import type { RfqStatus } from "@prisma/client";

const STATUS_STYLES: Record<RfqStatus, string> = {
  DRAFT: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20",
  PUBLISHED: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  CLOSED: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
  CANCELLED: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
  AWARDED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

export default function RFQStatusBadge({ status }: { status: RfqStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
        STATUS_STYLES[status]
      )}
    >
      {formatRfqStatus(status)}
    </span>
  );
}
