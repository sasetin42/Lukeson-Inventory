
'use client';

import { useState } from 'react';
import PageHeader from "@/components/page-header";
import { BarChart2, Calendar, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KpiCard from "@/components/kpi-card";
import RevenueProfitChart from "@/components/analytics/revenue-profit-chart";
import { getAnalyticsKpiData } from "@/lib/analytics-data";
import SalesByCustomerChart from "@/components/analytics/sales-by-customer-chart";
import SalesOverTimeChart from "@/components/analytics/sales-over-time-chart";
import InventoryValueByCategoryChart from "@/components/analytics/inventory-value-by-category-chart";
import SupplierPerformanceList from "@/components/analytics/supplier-performance-list";
import ProductPerformanceDetails from "@/components/analytics/product-performance-details";
import InventoryTurnoverByCategoryChart from "@/components/analytics/inventory-turnover-by-category-chart";
import StockMovementTrendChart from "@/components/analytics/stock-movement-trend-chart";
import InventoryOptimizationRecommendations from "@/components/analytics/inventory-optimization-recommendations";
import SupplierOnTimeChart from "@/components/analytics/supplier-on-time-chart";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30");
  const analyticsKpiData = getAnalyticsKpiData(Number(dateRange));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Analytics"
        description="Detailed analytics and reports."
        icon={<BarChart2 className="h-6 w-6 text-green-500" />}
        actions={
            <div className="flex items-center gap-2">
                <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[180px]">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <SelectValue placeholder="Last 30 days" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 3 months</SelectItem>
                        <SelectItem value="180">Last 6 months</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Analysis</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
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
                <RevenueProfitChart dateRange={Number(dateRange)} />
            </div>
        </TabsContent>
        <TabsContent value="sales" className="mt-4 grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <SalesByCustomerChart dateRange={Number(dateRange)} />
              <SalesOverTimeChart dateRange={Number(dateRange)} />
            </div>
            <ProductPerformanceDetails dateRange={Number(dateRange)} />
        </TabsContent>
        <TabsContent value="inventory" className="mt-4 grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <InventoryValueByCategoryChart />
              <InventoryTurnoverByCategoryChart dateRange={Number(dateRange)} />
            </div>
            <StockMovementTrendChart dateRange={Number(dateRange)} />
            <InventoryOptimizationRecommendations />
        </TabsContent>
        <TabsContent value="suppliers" className="mt-4 grid gap-6">
            <SupplierPerformanceList dateRange={Number(dateRange)} />
            <SupplierOnTimeChart dateRange={Number(dateRange)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
