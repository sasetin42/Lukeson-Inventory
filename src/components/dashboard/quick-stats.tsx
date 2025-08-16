
'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { Zap } from "lucide-react";
import Link from 'next/link';

export default function QuickStats() {
  const [stats, setStats] = useState([
    { label: "New Customers", value: "0" },
    { label: "Pending Orders", value: "0" },
    { label: "Open Invoices", value: "0" },
    { label: "Fulfilled Orders", value: "0" },
  ]);

  useEffect(() => {
    // In a real app, you would fetch this data from Firestore
    // For now, we'll use placeholder values and logic
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);

    const customersUnsub = onSnapshot(query(collection(db, "customers"), where("createdAt", ">=", thirtyDaysAgo)), (snapshot) => {
        setStats(prev => prev.map(s => s.label === 'New Customers' ? {...s, value: snapshot.size.toString()} : s));
    });
    
    const ordersUnsub = onSnapshot(collection(db, "salesOrders"), (snapshot) => {
        const pending = snapshot.docs.filter(doc => doc.data().status === 'Confirmed').length;
        const fulfilled = snapshot.docs.filter(doc => doc.data().status === 'Fulfilled').length;
        setStats(prev => prev.map(s => {
            if (s.label === 'Pending Orders') return {...s, value: pending.toString()};
            if (s.label === 'Fulfilled Orders') return {...s, value: fulfilled.toString()};
            return s;
        }));
    });

    const invoicesUnsub = onSnapshot(query(collection(db, "invoices"), where("status", "in", ["Posted", "Overdue"])), (snapshot) => {
        setStats(prev => prev.map(s => s.label === 'Open Invoices' ? {...s, value: snapshot.size.toString()} : s));
    });

    return () => {
        customersUnsub();
        ordersUnsub();
        invoicesUnsub();
    }
  }, []);

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
