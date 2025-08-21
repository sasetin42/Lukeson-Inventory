
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle } from "lucide-react";
import InvoiceList from "@/components/invoices/invoice-list";
import { Invoice } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';


export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'invoices'), (snapshot) => {
        const invoicesData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: (data.date as Timestamp).toDate(),
            } as Invoice;
        });
        setInvoices(invoicesData);
    }, (error) => {
        console.error("Failed to load invoices from Firestore", error);
        toast({ title: "Error", description: "Failed to load invoices.", variant: "destructive" });
    });

    return () => unsub();
  }, [toast]);


  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Invoices"
        description="Manage your invoices and track payments."
        icon={<FileText className="h-6 w-6 text-purple-500" />}
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        }
      />
      <InvoiceList invoices={invoices} />
    </div>
  );
}
