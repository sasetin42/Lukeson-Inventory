
'use client';
import { useState, useEffect } from 'react';
import { invoices, suppliers } from '@/lib/data';
import { ShoppingCart, AlertTriangle, DollarSign, Users, Package } from 'lucide-react';
import KpiCard from '@/components/kpi-card';
import { useToast } from '@/hooks/use-toast';
import { products } from '@/lib/products-data';

export default function OverviewCards() {
  const { toast } = useToast();

  const activeSalesOrders = 5; // Mock data
  const totalCustomers = 10; // Mock data
  const totalProducts = products.length;

  const cardData = [
    { 
      title: 'Total Products', 
      value: totalProducts,
      icon: Package, 
      trend: '+5 from last month',
      color: 'purple' as const
    },
    { 
      title: 'Active Sales Orders', 
      value: activeSalesOrders, 
      icon: ShoppingCart, 
      trend: '+8% from last week',
      color: 'green' as const
    },
    { 
      title: 'Pending Bills', 
      value: 3, 
      icon: AlertTriangle, 
      trend: `2 are overdue`,
      color: 'yellow' as const
    },
    { 
        title: 'Total Customers', 
        value: totalCustomers, 
        icon: Users, 
        trend: '+2 this month',
        color: 'blue' as const
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
          color={card.color}
          style={{ animationDelay: `${index * 100}ms` }}
          className="fade-in-up"
        />
      ))}
    </div>
  );
}
