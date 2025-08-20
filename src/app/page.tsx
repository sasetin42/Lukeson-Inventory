
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
import { ref, onValue, query, orderByChild, limitToLast } from "firebase/database";
import { Product, Sales } from '@/lib/types';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sales[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = ref(db, "products");
    const productsUnsub = onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        const productsData = data ? Object.entries(data).map(([id, value]) => ({ id, ...(value as Omit<Product, 'id'>) })) : [];
        setProducts(productsData);
        setLoading(false);
    });

    const salesRef = query(ref(db, 'sales'), orderByChild('date'), limitToLast(10));
    const salesUnsub = onValue(salesRef, (snapshot) => {
        const data = snapshot.val();
        const salesData = data ? Object.entries(data).map(([id, value]) => ({ id, ...(value as Omit<Sales, 'id'>), date: new Date((value as Sales).date) })) : [];
        setSales(salesData.reverse());
    });

    return () => {
        productsUnsub();
        salesUnsub();
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
