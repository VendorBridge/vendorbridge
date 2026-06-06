import DashboardClient from "./DashboardClient";
import { getDashboardStats, getRecentPurchaseOrders, getSpendingTrends } from "./actions";

export default async function DashboardPage() {
  const [stats, recentPos, spendingData] = await Promise.all([
    getDashboardStats(),
    getRecentPurchaseOrders(),
    getSpendingTrends()
  ]);

  return (
    <DashboardClient 
      stats={stats} 
      recentPos={recentPos} 
      trends={spendingData.trends} 
      categories={spendingData.categories} 
      totalSpend={spendingData.totalSpend} 
    />
  );
}
