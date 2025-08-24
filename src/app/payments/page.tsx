
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Banknote, PlusCircle, CheckCircle, Clock, Calendar } from "lucide-react";
import { Invoice } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';
import PaymentList from '@/components/payments/payment-list';
import { differenceInDays } from 'date-fns';


export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const invoicesRef = collection(db, 'invoices');
        const snapshot = await getDocs(invoicesRef);
        const loadedInvoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
        setInvoices(loadedInvoices);
      } catch (error) {
        console.error("Error fetching invoices: ", error);
        toast({
          title: "Error",
          description: "Failed to load payment data. Please check your connection and permissions.",
          variant: "destructive"
        });
      }
    };
    fetchInvoices();
  }, [toast]);
  
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
  const totalCollected = paidInvoices.reduce((acc, inv) => acc + inv.amount, 0);
  const pendingCollection = invoices.filter(inv => inv.status === 'Pending' || inv.status === 'Overdue').reduce((acc, inv) => acc + inv.balance, 0);
  
  const collectionTimes = paidInvoices.map(inv => {
    const issueDate = (inv.date as any).toDate ? (inv.date as any).toDate() : new Date(inv.date as string);
    const paidDate = (inv as any).paidDate ? ((inv as any).paidDate.toDate ? (inv as any).paidDate.toDate() : new Date((inv as any).paidDate as string)) : new Date();
    return differenceInDays(paidDate, issueDate);
  });
  const avgCollectionTime = collectionTimes.length > 0 ? collectionTimes.reduce((a, b) => a + b, 0) / collectionTimes.length : 0;


  const kpis = [
      { title: "Total Collected", value: `₱${totalCollected.toLocaleString()}`, icon: CheckCircle, color: "green" as const },
      { title: "Pending Collection", value: `₱${pendingCollection.toLocaleString()}`, icon: Clock, color: "yellow" as const },
      { title: "Avg. Collection Time", value: `${avgCollectionTime.toFixed(1)} days`, icon: Calendar, color: "blue" as const },
  ];


  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Payments Received"
        description="Track and manage all customer payments."
        icon={<Banknote className="h-6 w-6 text-indigo-500" />}
      />
      <div className="grid gap-6 md:grid-cols-3">
        {kpis.map((kpi, index) => (
          <KpiCard
            key={index}
            title={kpi.title}
            value={kpi.value as string}
            icon={kpi.icon}
            color={kpi.color}
            style={{ animationDelay: `${index * 100}ms` }}
            className="fade-in-up"
          />
        ))}
      </div>
      <PaymentList invoices={paidInvoices} />
    </div>
  );
}
