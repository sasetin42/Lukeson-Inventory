
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
import { Product, SalesOrder, ItemCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productsRef = collection(db, 'products');
        const salesRef = collection(db, 'salesOrders');

        const [productsSnapshot, salesSnapshot] = await Promise.all([
            getDocs(productsRef),
            getDocs(salesRef)
        ]);

        const loadedProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(loadedProducts);

        const loadedSales = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOrder));
        setSales(loadedSales);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please check permissions.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  // Transform sales orders to a flat list of sales for compatibility with existing components
  const flatSales = sales.flatMap(order => 
    order.lines.map(line => ({
        id: `${order.id}-${line.id}`,
        productId: line.itemId,
        productName: line.description,
        customerName: order.customerName || 'Unknown',
        date: order.orderDate,
        quantity: line.quantity,
        total: line.total,
    }))
  );

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
          <TopSellingItems products={products} sales={flatSales} />
          <SlowMovingItems products={products} sales={flatSales} />
      </div>

      <RecentTransactions sales={flatSales} />
    </div>
  );
}
