
'use client';
import { useState, useEffect } from 'react';
import { invoices, suppliers } from '@/lib/data';
import { ShoppingCart, AlertTriangle, DollarSign, Users } from 'lucide-react';
import KpiCard from '@/components/kpi-card';
import { getProducts } from '@/lib/firebase/product-service';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function OverviewCards() {
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = getProducts(
      (products) => {
        setProducts(products);
      },
      (error) => {
        console.error('Failed to fetch products for overview:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch product data for overview cards.',
        });
      }
    );
    return () => unsubscribe();
  }, [toast]);

  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.reorderLevel).length;
  const activeSalesOrders = 5; // Mock data
  const totalCustomers = 10; // Mock data
  const monthlyRevenue = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0);

  const cardData = [
    { 
      title: 'Total Revenue', 
      value: `₱${monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: DollarSign, 
      trend: '+15% from last month',
      color: 'purple'
    },
    { 
      title: 'Active Sales Orders', 
      value: activeSalesOrders, 
      icon: ShoppingCart, 
      trend: '+8% from last week',
      color: 'green'
    },
    { 
      title: 'Low Stock Items', 
      value: lowStockItems, 
      icon: AlertTriangle, 
      trend: `${lowStockItems} items need reordering`,
      color: 'yellow'
    },
    { 
        title: 'Total Customers', 
        value: totalCustomers, 
        icon: Users, 
        trend: '+2 this month',
        color: 'blue'
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card, index) => (
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
  );
}
