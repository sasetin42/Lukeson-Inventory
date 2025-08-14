import PageHeader from "@/components/page-header";
import { BarChart2, DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KpiCard from "@/components/kpi-card";
import RevenueProfitChart from "@/components/analytics/revenue-profit-chart";
import { analyticsKpiData } from "@/lib/analytics-data";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Analytics"
        description="Detailed analytics and reports."
        icon={<BarChart2 className="h-6 w-6" />}
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
        <TabsContent value="sales">
            <Card>
                <CardHeader>
                    <CardTitle>Sales Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Sales analytics content goes here.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="inventory">
            <Card>
                <CardHeader>
                    <CardTitle>Inventory Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Inventory analysis content goes here.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="suppliers">
            <Card>
                <CardHeader>
                    <CardTitle>Supplier Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Supplier performance content goes here.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
