
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle } from "lucide-react";
import InvoiceList from "@/components/invoices/invoice-list";
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Invoice } from '@/lib/types';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const invoicesRef = ref(db, "invoices");
    const unsubscribe = onValue(invoicesRef, (snapshot) => {
      const data = snapshot.val();
      const invoicesData = data ? Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as Omit<Invoice, 'id'>),
        date: new Date((value as Invoice).date).toLocaleDateString(),
      })) : [];
      setInvoices(invoicesData);
    });
    return () => unsubscribe();
  }, []);

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
