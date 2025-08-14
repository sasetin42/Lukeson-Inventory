import OverviewCards from "@/components/dashboard/overview-cards";
import RecentSales from "@/components/dashboard/recent-sales";
import StockChart from "@/components/dashboard/stock-chart";
import SuggestedActionsCard from "@/components/ai/suggested-actions-card";
import PageHeader from "@/components/page-header";
import { RocketIcon } from "@/components/icons/rocket";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Dashboard Overview"
        description="Enhanced inventory management with grouped navigation and smart button interactions"
        icon={<RocketIcon className="h-6 w-6 text-blue-500" />}
      />
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
