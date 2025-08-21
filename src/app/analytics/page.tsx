
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { BarChart2, Calendar, Download, DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KpiCard from "@/components/kpi-card";
import RevenueProfitChart from "@/components/analytics/revenue-profit-chart";
import SalesByCustomerChart from "@/components/analytics/sales-by-customer-chart";
import SalesOverTimeChart from "@/components/analytics/sales-over-time-chart";
import InventoryValueByCategoryChart from "@/components/analytics/inventory-value-by-category-chart";
import SupplierPerformanceList from "@/components/analytics/supplier-performance-list";
import ProductPerformanceDetails from "@/components/analytics/product-performance-details";
import InventoryTurnoverByCategoryChart from "@/components/analytics/inventory-turnover-by-category-chart";
import StockMovementTrendChart from "@/components/analytics/stock-movement-trend-chart";
import InventoryOptimizationRecommendations from "@/components/analytics/inventory-optimization-recommendations";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, Sales, Supplier } from '@/lib/types';
import SupplierOnTimeChart from '@/components/analytics/supplier-on-time-chart';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30");
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sales[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [kpiData, setKpiData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRef = collection(db, 'products');
        const salesRef = collection(db, 'sales');
        const suppliersRef = collection(db, 'suppliers');

        const productsSnapshot = await getDocs(productsRef);
        const loadedProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(loadedProducts);

        const salesSnapshot = await getDocs(salesRef);
        const loadedSales = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sales));
        setSales(loadedSales);

        const suppliersSnapshot = await getDocs(suppliersRef);
        const loadedSuppliers = suppliersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
        setSuppliers(loadedSuppliers);
      } catch (error) {
        console.error("Error fetching data: ", error);
        toast({
          title: "Error",
          description: "Failed to load analytics data. Please check your connection and permissions.",
          variant: "destructive"
        })
      }
    };
    fetchData();
  }, [toast]);

  useEffect(() => {
    function calculateKpis() {
        const days = Number(dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const filteredSales = sales.filter(s => {
          const saleDate = (s.date as any).toDate ? (s.date as any).toDate() : new Date(s.date as string);
          return saleDate >= cutoffDate;
        });
        
        const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
        const unitsSold = filteredSales.reduce((acc, s) => acc + s.quantity, 0);
        const avgOrderValue = totalRevenue / (filteredSales.length || 1);

        const cogs = filteredSales.reduce((acc, sale) => {
          const product = products.find(p => p.id === sale.productId);
          return acc + (product ? product.price * sale.quantity : 0);
        }, 0);
        
        const avgInventoryValue = products.reduce((acc, p) => acc + p.price * p.stock, 0) / (products.length || 1);
        const inventoryTurnover = avgInventoryValue > 0 ? cogs / avgInventoryValue : 0;
        
        const baseData = {
            totalRevenue,
            unitsSold,
            avgOrderValue,
            inventoryTurnover,
        };

        setKpiData([
            {
              title: "Total Revenue",
              value: `₱${baseData.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
              icon: DollarSign,
              trend: `+15.2% from last period`,
              color: "green"
            },
            {
              title: "Units Sold",
              value: baseData.unitsSold.toLocaleString(undefined, { maximumFractionDigits: 0 }),
              icon: Package,
              trend: `+8.1% from last period`,
              color: "blue"
            },
            {
              title: "Avg Order Value",
              value: `₱${baseData.avgOrderValue.toFixed(2)}`,
              icon: ShoppingCart,
              trend: `-2.3% from last period`,
              color: "purple"
            },
            {
              title: "Inventory Turnover",
              value: baseData.inventoryTurnover.toFixed(1) + 'x',
              icon: TrendingUp,
              trend: `+12.5% from last period`,
              color: "yellow"
            },
        ]);
    }
    if(sales.length > 0 || products.length > 0){
        calculateKpis();
    }
  }, [dateRange, sales, products]);

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
                {kpiData.map((card, index) => (
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
                <RevenueProfitChart sales={sales} products={products} dateRange={Number(dateRange)} />
            </div>
        </TabsContent>
        <TabsContent value="sales" className="mt-4 grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <SalesByCustomerChart sales={sales} dateRange={Number(dateRange)} />
              <SalesOverTimeChart sales={sales} dateRange={Number(dateRange)} />
            </div>
            <ProductPerformanceDetails products={products} sales={sales} dateRange={Number(dateRange)} />
        </TabsContent>
        <TabsContent value="inventory" className="mt-4 grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <InventoryValueByCategoryChart products={products} />
              <InventoryTurnoverByCategoryChart products={products} sales={sales} dateRange={Number(dateRange)} />
            </div>
            <StockMovementTrendChart dateRange={Number(dateRange)} />
            <InventoryOptimizationRecommendations />
        </TabsContent>
        <TabsContent value="suppliers" className="mt-4 grid gap-6">
            <SupplierPerformanceList suppliers={suppliers} dateRange={Number(dateRange)} />
            <SupplierOnTimeChart suppliers={suppliers} dateRange={Number(dateRange)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
