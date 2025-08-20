
'use client';
import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { RocketIcon } from "@/components/icons/rocket";
import TopSellingItems from "@/components/dashboard/top-selling-items";
import SlowMovingItems from "@/components/dashboard/slow-moving-items";
import InventoryOverview from "@/components/dashboard/inventory-overview";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import QuickStats from "@/components/dashboard/quick-stats";
import LowStockAlerts from "@/components/dashboard/low-stock-alerts";
import { Product, Sales } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sales[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const seedInitialCategories = () => {
        const categoriesRef = 'categories';
        const storedCategories = localStorage.getItem(categoriesRef);

        if(!storedCategories) {
            const categoriesToAdd = [
                { id: '1', name: 'STRIPLIGHT', description: 'Various types of LED striplights.', createdAt: new Date() },
                { id: '2', name: 'POWER SUPPLY', description: 'Power supplies for LED lighting.', createdAt: new Date() },
                { id: '3', name: 'GENERAL LIGHTING', description: 'General purpose lighting fixtures.', createdAt: new Date() },
                { id: '4', name: 'ALUMINIUM PROFILE', description: 'Aluminium profiles for LED strips.', createdAt: new Date() },
            ];
            localStorage.setItem(categoriesRef, JSON.stringify(categoriesToAdd));
            console.log('Seeded initial categories to localStorage');
        }
    };
    seedInitialCategories();
  }, []);

  useEffect(() => {
      try {
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
            setProducts(JSON.parse(storedProducts).map((p:any) => ({...p, createdAt: new Date(p.createdAt)})));
        }

        const storedSales = localStorage.getItem('sales');
        if (storedSales) {
            setSales(JSON.parse(storedSales).map((s:any) => ({...s, date: new Date(s.date)})));
        }
      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Failed to load data from localStorage.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Dashboard"
        description="A real-time overview of your business operations."
        icon={<RocketIcon className="h-6 w-6 text-blue-500" />}
      />
      
      {/* KPI Cards Section */}
      <InventoryOverview products={products} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickStats />
        <LowStockAlerts products={products} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopSellingItems products={products} sales={sales} />
          <SlowMovingItems products={products} sales={sales} />
      </div>

      <RecentTransactions sales={sales} />
    </div>
  );
}
