
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
import { Product, Sales, ItemCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sales[]>([]);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const productsRef = collection(db, 'products');
    const salesRef = collection(db, 'sales');
    const categoriesRef = collection(db, 'categories');

    const unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
        const loadedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(loadedProducts);
        setLoading(false);
    });

    const unsubscribeSales = onSnapshot(salesRef, (snapshot) => {
        const loadedSales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sales));
        setSales(loadedSales);
    });

    const unsubscribeCategories = onSnapshot(categoriesRef, (snapshot) => {
        const loadedCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ItemCategory));
        setCategories(loadedCategories);
    });

    return () => {
        unsubscribeProducts();
        unsubscribeSales();
        unsubscribeCategories();
    };
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
