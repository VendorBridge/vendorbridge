import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getRfqById } from "../new/actions";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Package,
  TrendingUp,
  User,
  Star,
  Award,
  ShieldCheck,
  Info,
} from "lucide-react";
import CompareActions from "./components/CompareActions";
import { cn } from "@/lib/utils";

// Format currency helper
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RfqDetailPage({ params }: PageProps) {
  const { id } = await params;
  const rfq = await getRfqById(id);

  if (!rfq) {
    notFound();
  }

  // Fetch submitted quotations
  const quotations = await db.quotation.findMany({
    where: { rfqId: id, status: "SUBMITTED" },
    include: {
      vendor: {
        select: {
          companyName: true,
          rating: true,
        },
      },
      items: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { grandTotal: "asc" }, // Ascending so cheapest shows first
  });

  const isRfqClosed = rfq.status === "CLOSED";

  // Calculate lowest price indicators per item
  const lowestPriceMap = new Map<string, number>();
  rfq.lineItems.forEach((rfqItem) => {
    let minPrice = Infinity;
    quotations.forEach((q) => {
      // Find matching item in quotation by name
      const qItem = q.items.find(
        (qi: any) => qi.itemName.toLowerCase() === rfqItem.itemName.toLowerCase()
      );
      if (qItem && Number(qItem.unitPrice) > 0) {
        minPrice = Math.min(minPrice, Number(qItem.unitPrice));
      }
    });
    if (minPrice !== Infinity) {
      lowestPriceMap.set(rfqItem.itemName.toLowerCase(), minPrice);
    }
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link href="/rfqs">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-[hsl(var(--muted-foreground))]">
            <ArrowLeft className="size-4" />
            Back to RFQs
          </Button>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[hsl(var(--border))] pb-6">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] uppercase">
            {rfq.category}
          </span>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] mt-2">
            {rfq.title}
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            RFQ Number: <span className="font-semibold">{rfq.rfqNumber}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] px-4 py-2 rounded-xl">
            <Calendar className="size-4 text-amber-500" />
            <span className="text-[hsl(var(--muted-foreground))]">
              Deadline: <span className="font-semibold text-[hsl(var(--foreground))]">{new Date(rfq.deadline).toLocaleDateString("en-IN")}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] px-4 py-2 rounded-xl">
            <ShieldCheck className="size-4 text-[hsl(var(--primary))]" />
            <span className="text-[hsl(var(--muted-foreground))]">
              Status: <span className="font-semibold text-[hsl(var(--foreground))]">{rfq.status}</span>
            </span>
          </div>
        </div>
      </div>

      {/* RFQ Description */}
      {rfq.description && (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-2">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Requirements Description</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{rfq.description}</p>
        </div>
      )}

      {/* Grid: Left: Items, Right: Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Line Items Table */}
        <div className="lg:col-span-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4">
          <h3 className="text-base font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
            <Package className="size-4 text-[hsl(var(--primary))]" />
            RFQ Requested Items
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                  <th className="text-left py-3 px-2 font-semibold">Item Name</th>
                  <th className="text-center py-3 px-2 font-semibold w-[15%]">Quantity</th>
                  <th className="text-left py-3 px-2 font-semibold w-[20%]">Unit</th>
                  <th className="text-right py-3 px-2 font-semibold w-[25%]">Est. Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {rfq.lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-[hsl(var(--border))]/50 last:border-0 hover:bg-[hsl(var(--accent))]/30 transition-colors">
                    <td className="py-3 px-2 font-medium text-[hsl(var(--foreground))]">{item.itemName}</td>
                    <td className="py-3 px-2 text-center font-medium">{item.quantity}</td>
                    <td className="py-3 px-2 text-[hsl(var(--muted-foreground))]">{item.unit ?? "Units"}</td>
                    <td className="py-3 px-2 text-right font-semibold">
                      {item.estimatedUnitPrice ? formatCurrency(item.estimatedUnitPrice) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 col: Bidding overview */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-5">
          <h3 className="text-base font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
            <TrendingUp className="size-4 text-emerald-500" />
            Bidding Activity
          </h3>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">Total Bids Received</span>
              <span className="text-lg font-bold text-[hsl(var(--foreground))]">{quotations.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">Cheapest Bid</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {quotations.length > 0 ? formatCurrency(Number(quotations[0].grandTotal)) : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">Invited Vendors</span>
              <span className="font-semibold text-[hsl(var(--foreground))]">{rfq.vendorIds.length}</span>
            </div>
          </div>

          <div className="border-t border-[hsl(var(--border))] pt-4 text-xs text-[hsl(var(--muted-foreground))] flex items-start gap-2 bg-[hsl(var(--muted))]/30 p-3 rounded-xl">
            <Info className="size-4 shrink-0 text-[hsl(var(--primary))] mt-0.5" />
            <span>
              Once you select a vendor bid, click &quot;Submit for Approval&quot; to send it to the Manager for signing.
            </span>
          </div>
        </div>
      </div>

      {/* Quotation Comparison Matrix (Task 3.3) */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-6">
        <div>
          <h3 className="text-base font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
            <Award className="size-4 text-amber-500" />
            Quotation Comparison Matrix
          </h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            Green highlights represent the lowest unit price offered for each line item.
          </p>
        </div>

        {quotations.length === 0 ? (
          <div className="border border-dashed border-[hsl(var(--border))] rounded-xl p-12 text-center">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No quotations submitted for this RFQ yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-[hsl(var(--border))] rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-[hsl(var(--muted))]/50 border-b border-[hsl(var(--border))]">
                  <th className="text-left py-3 px-4 font-semibold w-[25%]">Line Item</th>
                  <th className="text-center py-3 px-2 font-semibold w-[10%]">QTY</th>
                  {quotations.map((q) => (
                    <th key={q.id} className="text-center py-3 px-4 font-semibold border-l border-[hsl(var(--border))] min-w-[200px]">
                      <div className="space-y-0.5">
                        <span className="font-bold text-[hsl(var(--foreground))] line-clamp-1">{q.vendor.companyName}</span>
                        <div className="flex justify-center items-center gap-1 text-xs text-amber-500 font-medium">
                          <Star className="size-3 fill-amber-500" />
                          <span>{q.vendor.rating ? q.vendor.rating.toFixed(1) : "—"}</span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rfq.lineItems.map((rfqItem) => {
                  const rfqKey = rfqItem.itemName.toLowerCase();
                  const minPrice = lowestPriceMap.get(rfqKey);

                  return (
                    <tr key={itemKey(rfqItem)} className="border-b border-[hsl(var(--border))]/50 last:border-0 hover:bg-[hsl(var(--accent))]/30 transition-colors">
                      <td className="py-4 px-4 font-medium text-[hsl(var(--foreground))]">{rfqItem.itemName}</td>
                      <td className="py-4 px-2 text-center font-medium text-[hsl(var(--muted-foreground))]">{rfqItem.quantity}</td>
                      {quotations.map((q) => {
                        const qItem = q.items.find(
                          (qi: any) => qi.itemName.toLowerCase() === rfqKey
                        );
                        const price = qItem ? Number(qItem.unitPrice) : null;
                        const total = qItem ? Number(qItem.lineTotal) : null;
                        const isCheapest = price && minPrice && price === minPrice;

                        return (
                          <td key={q.id} className="py-4 px-4 text-center border-l border-[hsl(var(--border))]/50">
                            {price ? (
                              <div className="space-y-1">
                                <span className={cn(
                                  "text-sm font-semibold",
                                  isCheapest && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20 px-2 py-0.5 rounded"
                                )}>
                                  {formatCurrency(price)}
                                </span>
                                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                                  Total: {formatCurrency(total ?? 0)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[hsl(var(--muted-foreground))]">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Summaries Row */}
                <tr className="bg-[hsl(var(--muted))]/20 border-t border-[hsl(var(--border))] font-semibold">
                  <td className="py-4 px-4 text-left font-bold text-[hsl(var(--foreground))]">Bidding Summary</td>
                  <td className="py-4 px-2" />
                  {quotations.map((q) => (
                    <td key={q.id} className="py-4 px-4 text-center border-l border-[hsl(var(--border))]/50">
                      <div className="space-y-2">
                        <div className="text-sm font-bold text-[hsl(var(--primary))]">
                          {formatCurrency(Number(q.grandTotal))}
                        </div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                          Delivery: <span className="font-semibold text-[hsl(var(--foreground))]">{q.deliveryDays} Days</span>
                        </div>
                        <div className="pt-2">
                          <CompareActions
                            rfqId={id}
                            quotationId={q.id}
                            vendorId={q.vendorId}
                            vendorName={q.vendor.companyName}
                            isRfqClosed={isRfqClosed}
                          />
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function itemKey(item: { id: string; itemName: string }): string {
  return `${item.id}-${item.itemName}`;
}
