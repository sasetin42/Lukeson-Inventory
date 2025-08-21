
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle } from "lucide-react";
import InvoiceList from "@/components/invoices/invoice-list";
import { Invoice } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadInvoices = () => {
      try {
        const storedInvoices = localStorage.getItem('invoices');
        if (storedInvoices) {
          setInvoices(JSON.parse(storedInvoices));
        }
      } catch (error) {
        console.error("Failed to load invoices from local storage", error);
        toast({ title: "Error", description: "Failed to load invoices.", variant: "destructive" });
      }
    };
    
    loadInvoices();

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'invoices') {
            loadInvoices();
        }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    }
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
