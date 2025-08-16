
import PageHeader from "@/components/page-header";
import { BarChart2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KpiCard from "@/components/kpi-card";
import RevenueProfitChart from "@/components/analytics/revenue-profit-chart";
import { analyticsKpiData } from "@/lib/analytics-data";
import SalesByCustomerChart from "@/components/analytics/sales-by-customer-chart";
import SalesOverTimeChart from "@/components/analytics/sales-over-time-chart";
import InventoryValueByCategoryChart from "@/components/analytics/inventory-value-by-category-chart";
import SupplierPerformanceList from "@/components/analytics/supplier-performance-list";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Analytics"
        description="Detailed analytics and reports."
        icon={<BarChart2 className="h-6 w-6 text-green-500" />}
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Analysis</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {analyticsKpiData.map((card, index) => (
                    <KpiCard
                        key={card.title}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        trend={card.trend}
                        color={card.color as any}
                        style={{ animationDelay: `${index * 100}ms` }}
                        className="fade-in-up"
                    />
                ))}
            </div>
            <div className="mt-6">
                <RevenueProfitChart />
            </div>
        </TabsContent>
        <TabsContent value="sales" className="mt-6 grid gap-6 md:grid-cols-2">
            <SalesByCustomerChart />
            <SalesOverTimeChart />
        </TabsContent>
        <TabsContent value="inventory" className="mt-6">
            <InventoryValueByCategoryChart />
        </TabsContent>
        <TabsContent value="suppliers" className="mt-6">
            <SupplierPerformanceList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
