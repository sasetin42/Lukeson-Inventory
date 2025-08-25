
'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import Link from 'next/link';
import { Customer, SalesOrder, Invoice } from '@/lib/types';

interface QuickStatsProps {
  customers: Customer[];
  salesOrders: SalesOrder[];
  invoices: Invoice[];
}

export default function QuickStats({ customers, salesOrders, invoices }: QuickStatsProps) {
  const [stats, setStats] = useState([
    { label: "New Customers", value: "0" },
    { label: "Pending Orders", value: "0" },
    { label: "Open Invoices", value: "0" },
    { label: "Fulfilled Orders", value: "0" },
  ]);

  useEffect(() => {
    const newCustomers = customers.filter(c => {
      // Assuming createdAt is available and is a Firestore timestamp
      const createdAt = (c as any).createdAt?.toDate ? (c as any).createdAt.toDate() : new Date(0);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdAt > thirtyDaysAgo;
    }).length;

    const pendingOrders = salesOrders.filter(so => so.status === 'Confirmed' || so.status === 'Draft').length;
    
    const openInvoices = invoices.filter(inv => inv.status !== 'Paid').length;
    
    const fulfilledOrders = salesOrders.filter(so => so.status === 'Fulfilled').length;

    setStats([
      { label: "New Customers", value: newCustomers.toString() },
      { label: "Pending Orders", value: pendingOrders.toString() },
      { label: "Open Invoices", value: openInvoices.toString() },
      { label: "Fulfilled Orders", value: fulfilledOrders.toString() },
    ]);
  }, [customers, salesOrders, invoices]);

  const statLinks = {
    "New Customers": "/customer",
    "Pending Orders": "/sales-orders",
    "Open Invoices": "/invoices",
    "Fulfilled Orders": "/sales-orders"
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <CardTitle>Quick Stats</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <Link href={statLinks[stat.label as keyof typeof statLinks] || '#'} key={stat.label}>
                <div className="p-4 rounded-lg bg-muted/50 flex flex-col items-center justify-center text-center hover:bg-muted transition-colors h-full">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
