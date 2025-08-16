
'use client';
import { useState, useEffect } from 'react';
import { invoices, suppliers } from '@/lib/data';
import { ShoppingCart, AlertTriangle, DollarSign, Users } from 'lucide-react';
import KpiCard from '@/components/kpi-card';
import { useToast } from '@/hooks/use-toast';

export default function OverviewCards() {
  const { toast } = useToast();

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
      title: 'Pending Bills', 
      value: 3, 
      icon: AlertTriangle, 
      trend: `2 are overdue`,
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
