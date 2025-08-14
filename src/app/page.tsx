import OverviewCards from "@/components/dashboard/overview-cards";
import RecentSales from "@/components/dashboard/recent-sales";
import StockChart from "@/components/dashboard/stock-chart";
import SuggestedActionsCard from "@/components/ai/suggested-actions-card";
import PageHeader from "@/components/page-header";
import { RocketIcon } from "@/components/icons/rocket";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <PageHeader 
          title="Dashboard Overview"
          description="Enhanced inventory management with grouped navigation and smart button interactions"
          icon={<RocketIcon className="h-6 w-6 text-blue-500" />}
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-600 border-blue-200">Smart Buttons Active</Badge>
              <Badge variant="outline" className="bg-purple-100 text-purple-600 border-purple-200">Grouped Navigation</Badge>
              <Badge variant="outline" className="bg-green-100 text-green-600 border-green-200">Enhanced UX</Badge>
            </div>
          }
        />
        <Separator className="my-4" />
      </div>
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
