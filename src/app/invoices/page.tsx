
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, DollarSign, CheckCircle, XCircle } from "lucide-react";
import InvoiceList from "@/components/invoices/invoice-list";
import { Invoice } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoiceTemplate from '@/components/invoices/invoice-template';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const invoicesRef = collection(db, 'invoices');
    const unsubscribe = onSnapshot(invoicesRef, (snapshot) => {
      const loadedInvoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
      setInvoices(loadedInvoices);
    }, (error) => {
      console.error("Error fetching invoices: ", error);
      toast({
        title: "Error",
        description: "Failed to load invoices. Please check your connection and permissions.",
        variant: "destructive"
      });
    });

    return () => unsubscribe();
  }, [toast]);
  
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalPaid = invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + inv.amount, 0);
  const totalOverdue = invoices.filter(inv => inv.status === 'Overdue').reduce((acc, inv) => acc + inv.amount, 0);

  const kpis = [
      { title: "Total Invoiced", value: `₱${totalInvoiced.toLocaleString()}`, icon: DollarSign, color: "blue" as const },
      { title: "Total Paid", value: `₱${totalPaid.toLocaleString()}`, icon: CheckCircle, color: "green" as const },
      { title: "Total Overdue", value: `₱${totalOverdue.toLocaleString()}`, icon: XCircle, color: "red" as const },
  ];


  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Sales Invoices"
        description="Manage your invoices and track payments."
        icon={<FileText className="h-6 w-6 text-purple-500" />}
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        }
      />
      <Tabs defaultValue="sales-invoices">
        <TabsList>
            <TabsTrigger value="sales-invoices">Sales Invoices</TabsTrigger>
            <TabsTrigger value="templates">Sales Invoices Template</TabsTrigger>
        </TabsList>
        <TabsContent value="sales-invoices" className="mt-4">
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
        <div className="mt-4">
            <InvoiceList invoices={invoices} />
        </div>
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
            <InvoiceTemplate />
        </TabsContent>
      </Tabs>
    </div>
  );
}
