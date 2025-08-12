import OverviewCards from "@/components/dashboard/overview-cards";
import RecentSales from "@/components/dashboard/recent-sales";
import StockChart from "@/components/dashboard/stock-chart";
import SuggestedActionsCard from "@/components/ai/suggested-actions-card";
import PageHeader from "@/components/page-header";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description="A real-time snapshot of your inventory." />
      <div className="grid gap-6">
        <OverviewCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StockChart />
          </div>
          <div className="lg:col-span-1">
            <RecentSales />
          </div>
        </div>
        <SuggestedActionsCard />
      </div>
    </div>
  );
}
