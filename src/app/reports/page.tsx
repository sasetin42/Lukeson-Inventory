
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { BarChart3, DollarSign, Download, Package, ShoppingCart, Users, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiCard from '@/components/kpi-card';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Product, SalesOrder, Customer, Supplier, PurchaseOrder, Invoice } from '@/lib/types';
import SalesOverTimeChart from '@/components/analytics/sales-over-time-chart';
import RevenueByCategoryChart from '@/components/reports/revenue-by-category-chart';
import SalesStatusChart from '@/components/reports/sales-status-chart';
import PurchaseStatusChart from '@/components/reports/purchase-status-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


export default function ReportsPage() {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<SalesOrder[]>([]);
    const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    useEffect(() => {
        const collections = {
            products: setProducts,
            salesOrders: setSales,
            purchaseOrders: setPurchases,
            customers: setCustomers,
            suppliers: setSuppliers,
        };

        const unsubscribes = Object.entries(collections).map(([col, setter]) => 
            onSnapshot(collection(db, col), (snapshot) => {
                setter(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
            }, (error) => {
                console.error(`Error fetching ${col}:`, error);
                toast({ title: 'Error', description: `Failed to load ${col} data.`, variant: 'destructive' });
            })
        );

        return () => unsubscribes.forEach(unsub => unsub());
    }, [toast]);

    const totalRevenue = sales.reduce((acc, so) => acc + so.totalAmount, 0);
    const totalPurchaseValue = purchases.reduce((acc, po) => acc + po.totalAmount, 0);
    const inventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const totalCustomers = customers.length;
    const totalSuppliers = suppliers.length;

    const kpis = [
        { title: 'Total Sales Revenue', value: `₱${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'green' as const },
        { title: 'Total Purchase Value', value: `₱${totalPurchaseValue.toLocaleString()}`, icon: ShoppingCart, color: 'blue' as const },
        { title: 'Total Inventory Value', value: `₱${inventoryValue.toLocaleString()}`, icon: Package, color: 'orange' as const },
        { title: 'Total Customers', value: totalCustomers, icon: Users, color: 'purple' as const },
        { title: 'Total Suppliers', value: totalSuppliers, icon: Truck, color: 'teal' as const },
    ];


  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="System Reports" 
        description="A comprehensive overview of your business operations." 
        icon={<BarChart3 className="h-6 w-6 text-orange-500" />}
        actions={
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Summary
            </Button>
        }
      />
      
      <Tabs defaultValue="overview">
        <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ar-ap-aging">AR/AP Aging</TabsTrigger>
            <TabsTrigger value="inventory-valuation">Inventory Valuation</TabsTrigger>
            <TabsTrigger value="pnl">Profit & Loss</TabsTrigger>
            <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
            <TabsTrigger value="sales-by-customer">Sales by Customer</TabsTrigger>
            <TabsTrigger value="sales-by-item">Sales by Item</TabsTrigger>
            <TabsTrigger value="cashflow">Cashflow Statement</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                {kpis.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <SalesOverTimeChart sales={sales} dateRange={30} />
                <RevenueByCategoryChart products={products} sales={sales} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <SalesStatusChart sales={sales} />
                <PurchaseStatusChart purchases={purchases} />
            </div>
        </TabsContent>
        <TabsContent value="ar-ap-aging" className="mt-4">
            <Card>
                <CardHeader><CardTitle>AR/AP Aging Report</CardTitle></CardHeader>
                <CardContent><p>AR/AP Aging Report content will go here.</p></CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="inventory-valuation" className="mt-4">
            <Card>
                <CardHeader><CardTitle>Inventory Valuation Report</CardTitle></CardHeader>
                <CardContent><p>Inventory Valuation Report content will go here.</p></CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="pnl" className="mt-4">
            <Card>
                <CardHeader><CardTitle>Profit & Loss Statement</CardTitle></CardHeader>
                <CardContent><p>Profit & Loss Statement content will go here.</p></CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="balance-sheet" className="mt-4">
            <Card>
                <CardHeader><CardTitle>Balance Sheet</CardTitle></CardHeader>
                <CardContent><p>Balance Sheet content will go here.</p></CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="sales-by-customer" className="mt-4">
            <Card>
                <CardHeader><CardTitle>Sales by Customer Report</CardTitle></CardHeader>
                <CardContent><p>Sales by Customer Report content will go here.</p></CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="sales-by-item" className="mt-4">
            <Card>
                <CardHeader><CardTitle>Sales by Item Report</CardTitle></CardHeader>
                <CardContent><p>Sales by Item Report content will go here.</p></CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="cashflow" className="mt-4">
            <Card>
                <CardHeader><CardTitle>Cashflow Statement</CardTitle></CardHeader>
                <CardContent><p>Cashflow Statement content will go here.</p></CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

