
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
import { db } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, limitToLast, push, get, serverTimestamp, set, equalTo } from "firebase/database";
import { Product, Sales } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sales[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const seedInitialCategories = async () => {
        const categoriesRef = ref(db, 'categories');
        const categoriesToAdd = [
            { name: 'STRIPLIGHT', description: 'Various types of LED striplights.' },
            { name: 'POWER SUPPLY', description: 'Power supplies for LED lighting.' },
            { name: 'GENERAL LIGHTING', description: 'General purpose lighting fixtures.' },
            { name: 'ALUMINIUM PROFILE', description: 'Aluminium profiles for LED strips.' },
        ];

        for (const category of categoriesToAdd) {
            const q = query(categoriesRef, orderByChild('name'), equalTo(category.name));
            const snapshot = await get(q);
            if (!snapshot.exists()) {
                const newCategoryRef = push(categoriesRef);
                await set(newCategoryRef, {
                    ...category,
                    createdAt: serverTimestamp(),
                });
                console.log(`Added category: ${category.name}`);
            }
        }
    };
    seedInitialCategories();
  }, []);

  useEffect(() => {
    const productsRef = ref(db, "products");
    const productsUnsub = onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        const productsData = data ? Object.entries(data).map(([id, value]) => ({ id, ...(value as Omit<Product, 'id'>) })) : [];
        setProducts(productsData);
        setLoading(false);
    }, (error) => {
        console.error(error);
        toast({ title: "Error", description: "Failed to load products.", variant: "destructive" });
        setLoading(false);
    });

    const salesRef = query(ref(db, 'sales'), orderByChild('date'), limitToLast(10));
    const salesUnsub = onValue(salesRef, (snapshot) => {
        const data = snapshot.val();
        const salesData = data ? Object.entries(data).map(([id, value]) => ({ id, ...(value as Omit<Sales, 'id'>), date: new Date((value as Sales).date) })) : [];
        setSales(salesData.reverse());
    }, (error) => {
        console.error(error);
        toast({ title: "Error", description: "Failed to load sales data.", variant: "destructive" });
    });

    return () => {
        productsUnsub();
        salesUnsub();
    }
  }, [toast]);

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
