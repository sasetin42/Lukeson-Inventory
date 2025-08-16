
import OverviewCards from "@/components/dashboard/overview-cards";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import PageHeader from "@/components/page-header";
import { RocketIcon } from "@/components/icons/rocket";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Dashboard"
        description="A real-time overview of your business operations."
        icon={<RocketIcon className="h-6 w-6 text-blue-500" />}
      />
      <div className="grid gap-6">
        <OverviewCards />
        <RecentTransactions />
      </div>
    </div>
  );
}
