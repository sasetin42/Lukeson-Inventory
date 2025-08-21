
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
import { collection, getDocs, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sales[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const seedInitialCategories = async () => {
        const categoriesCol = collection(db, 'categories');
        const snapshot = await getDocs(categoriesCol);
        if (snapshot.empty) {
            const categoriesToAdd = [
                { id: '1', name: 'STRIPLIGHT', description: 'Various types of LED striplights.' },
                { id: '2', name: 'POWER SUPPLY', description: 'Power supplies for LED lighting.' },
                { id: '3', name: 'GENERAL LIGHTING', description: 'General purpose lighting fixtures.' },
                { id: '4', name: 'ALUMINIUM PROFILE', description: 'Aluminium profiles for LED strips.' },
            ];
            const batch = writeBatch(db);
            categoriesToAdd.forEach(cat => {
                const docRef = doc(db, 'categories', cat.id);
                batch.set(docRef, cat);
            });
            await batch.commit();
            console.log('Seeded initial categories to Firestore');
        }
    };
    seedInitialCategories();
  }, []);

  useEffect(() => {
      const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
          const productsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp)?.toDate(),
                modifiedAt: (data.modifiedAt as Timestamp)?.toDate(),
            } as Product;
          });
          setProducts(productsData);
          setLoading(false);
      }, (error) => {
          console.error(error);
          toast({ title: "Error", description: "Failed to load products from Firestore.", variant: "destructive" });
          setLoading(false);
      });

      const unsubSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
          const salesData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: (data.date as Timestamp)?.toDate(),
            } as Sales;
          });
          setSales(salesData);
      }, (error) => {
          console.error(error);
          toast({ title: "Error", description: "Failed to load sales from Firestore.", variant: "destructive" });
      });

      return () => {
          unsubProducts();
          unsubSales();
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
