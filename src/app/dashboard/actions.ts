"use server";

import { db } from "@/lib/db";
import { startOfMonth, subMonths, format } from "date-fns";

export async function getDashboardStats() {
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);

  const [
    activeRfqs,
    pendingApprovals,
    posThisMonth,
    overdueInvoices
  ] = await Promise.all([
    db.rfq.count({ where: { status: "PUBLISHED" } }),
    db.approval.count({ where: { status: "PENDING" } }),
    db.purchaseOrder.aggregate({
      where: { createdAt: { gte: startOfCurrentMonth } },
      _sum: { grandTotal: true },
      _count: true
    }),
    db.invoice.count({
      where: { 
        OR: [
          { status: "OVERDUE" },
          { dueDate: { lt: now }, status: { notIn: ["PAID", "CANCELLED"] } }
        ]
      }
    })
  ]);

  return {
    activeRfqs,
    pendingApprovals,
    posThisMonthValue: Number(posThisMonth._sum.grandTotal ?? 0),
    posThisMonthCount: posThisMonth._count,
    overdueInvoices,
  };
}

export async function getRecentPurchaseOrders() {
  const pos = await db.purchaseOrder.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  const vendorIds = [...new Set(pos.map(po => po.vendorId))];
  const vendors = await db.vendor.findMany({
    where: { id: { in: vendorIds } },
    select: { id: true, companyName: true }
  });

  const vendorMap = new Map(vendors.map(v => [v.id, v]));

  return pos.map(po => ({
    poNumber: po.poNumber,
    vendor: vendorMap.get(po.vendorId)?.companyName ?? "Unknown Vendor",
    amount: po.grandTotal.toNumber(),
    status: po.status,
  }));
}

export async function getSpendingTrends() {
  // Get last 6 months spending
  const trends = [];
  let totalSpend = 0;
  
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(new Date(), i));
    const nextMonthStart = startOfMonth(subMonths(new Date(), i - 1));
    
    const sum = await db.purchaseOrder.aggregate({
      where: {
        createdAt: { gte: monthStart, lt: nextMonthStart },
        status: { notIn: ["CANCELLED"] }
      },
      _sum: { grandTotal: true }
    });
    
    const value = Number(sum._sum.grandTotal ?? 0);
    totalSpend += value;
    
    trends.push({
      month: format(monthStart, "MMM"),
      value
    });
  }

  // Get category breakdown
  const categoryStats = await db.purchaseOrder.groupBy({
    by: ['vendorId'],
    _sum: { grandTotal: true },
    where: { status: { notIn: ["CANCELLED"] } }
  });

  // Map vendorId to category
  const vendorIds = categoryStats.map(s => s.vendorId);
  const vendors = await db.vendor.findMany({
    where: { id: { in: vendorIds } },
    select: { id: true, category: true }
  });
  
  const categoryMap = new Map(vendors.map(v => [v.id, v.category]));
  
  const categoryBreakdownMap = new Map<string, number>();
  
  for (const stat of categoryStats) {
    const category = categoryMap.get(stat.vendorId) || "OTHER";
    const amount = Number(stat._sum.grandTotal ?? 0);
    categoryBreakdownMap.set(category, (categoryBreakdownMap.get(category) || 0) + amount);
  }
  
  const categories = Array.from(categoryBreakdownMap.entries()).map(([label, value]) => {
    return { label, value, percentage: totalSpend > 0 ? (value / totalSpend) * 100 : 0 };
  }).sort((a, b) => b.value - a.value).slice(0, 4); // Top 4

  // If empty, return a default empty structure so the chart doesn't crash
  if (trends.every(t => t.value === 0)) {
     // We will return the empty trends but let the frontend handle the display
  }

  return { trends, categories, totalSpend };
}
