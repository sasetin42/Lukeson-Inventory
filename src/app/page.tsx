
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
import { collection, getDocs, writeBatch, serverTimestamp, doc } from 'firebase/firestore';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sales[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const seedInitialCategories = async () => {
        const categoriesRef = collection(db, 'categories');
        const snapshot = await getDocs(categoriesRef);

        if(snapshot.empty) {
            const batch = writeBatch(db);
            const categoriesToAdd = [
                { id: '1', name: 'STRIPLIGHT', description: 'Various types of LED striplights.' },
                { id: '2', name: 'POWER SUPPLY', description: 'Power supplies for LED lighting.' },
                { id: '3', name: 'GENERAL LIGHTING', description: 'General purpose lighting fixtures.' },
                { id: '4', name: 'ALUMINIUM PROFILE', description: 'Aluminium profiles for LED strips.' },
            ];
            categoriesToAdd.forEach(category => {
                const docRef = doc(db, 'categories', category.id);
                batch.set(docRef, {...category, createdAt: serverTimestamp()});
            });
            await batch.commit();
            console.log('Seeded initial categories to Firestore');
        }
    };
    seedInitialCategories();
  }, []);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const productsCollection = collection(db, 'products');
              const productsSnapshot = await getDocs(productsCollection);
              const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
              setProducts(productsData);

              const salesCollection = collection(db, 'sales');
              const salesSnapshot = await getDocs(salesCollection);
              const salesData = salesSnapshot.docs.map(doc => {
                  const data = doc.data();
                  return { id: doc.id, ...data, date: (data.date as any).toDate() } as Sales;
              });
              setSales(salesData);
              
          } catch (error) {
              console.error(error);
              toast({ title: "Error", description: "Failed to load data from Firestore.", variant: "destructive" });
          } finally {
              setLoading(false);
          }
      };

      fetchData();
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
