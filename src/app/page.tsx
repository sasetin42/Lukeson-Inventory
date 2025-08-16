
import OverviewCards from "@/components/dashboard/overview-cards";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import StockChart from "@/components/dashboard/stock-chart";
import SuggestedActionsCard from "@/components/ai/suggested-actions-card";
import PageHeader from "@/components/page-header";
import { RocketIcon } from "@/components/icons/rocket";
import TopSellingItems from "@/components/dashboard/top-selling-items";
import SlowMovingItems from "@/components/dashboard/slow-moving-items";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Company Dashboard"
        description="A real-time overview of your business operations."
        icon={<RocketIcon className="h-6 w-6 text-blue-500" />}
      />
      <div className="grid gap-6">
        <OverviewCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StockChart />
          </div>
          <div className="lg:col-span-1 grid gap-6">
            <TopSellingItems />
            <SlowMovingItems />
          </div>
        </div>
        <RecentTransactions />
        <SuggestedActionsCard />
      </div>
    </div>
  );
}
