
'use client';

import { useState, useEffect, useMemo } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, DollarSign, CheckCircle, XCircle, Search, AlertCircle } from "lucide-react";
import InvoiceList from "@/components/invoices/invoice-list";
import { Invoice } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoiceTemplate from '@/components/invoices/invoice-template';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import InvoiceFormModal from '@/components/invoices/invoice-form-modal';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

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

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch =
        invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (invoice.customerName && invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);
  
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalPaid = invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + inv.amount, 0);
  const totalOverdue = invoices.filter(inv => inv.status === 'Overdue').reduce((acc, inv) => acc + inv.amount, 0);

  const kpis = [
      { title: "Total Invoiced", value: `₱${totalInvoiced.toLocaleString()}`, icon: DollarSign, color: "blue" as const },
      { title: "Total Paid", value: `₱${totalPaid.toLocaleString()}`, icon: CheckCircle, color: "green" as const },
      { title: "Total Overdue", value: `₱${totalOverdue.toLocaleString()}`, icon: XCircle, color: "red" as const },
  ];

  const handleOpenModal = (invoice: Invoice | null) => {
    setEditingInvoice(invoice);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInvoice(null);
  }

  const handleSaveInvoice = async (invoiceData: Omit<Invoice, 'id'> & {id?: string}) => {
    try {
        const { id, ...dataToSave } = invoiceData;
        const docRef = doc(db, "invoices", id as string);
        await setDoc(docRef, { ...dataToSave, createdAt: serverTimestamp() });
        toast({ title: "Success", description: "Invoice created successfully.", variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
        
        // Update Sales Order status
        if (invoiceData.salesOrderId) {
            const soRef = doc(db, "salesOrders", invoiceData.salesOrderId);
            await setDoc(soRef, { status: 'Invoiced', invoicedStatus: 'Fully Invoiced' }, { merge: true });
        }

        handleCloseModal();
    } catch (error) {
        console.error("Error saving invoice: ", error);
        toast({ title: "Error", description: "Failed to save invoice.", variant: "destructive", icon: <AlertCircle className="h-5 w-5" /> });
    }
  };


  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Sales Invoices"
        description="Manage your invoices and track payments."
        icon={<FileText className="h-6 w-6 text-purple-500" />}
        actions={
          <Button onClick={() => handleOpenModal(null)}>
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
            <Card>
              <CardHeader>
                  <CardTitle>Invoice List</CardTitle>
                  <CardDescription>A list of all your sales invoices.</CardDescription>
                  <div className="flex items-center gap-2 pt-4">
                      <div className="relative w-full">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                              placeholder="Search by Invoice ID or Customer..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-8 sm:w-1/2"
                          />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="Paid">Paid</SelectItem>
                              <SelectItem value="Posted">Posted</SelectItem>
                              <SelectItem value="Overdue">Overdue</SelectItem>
                              <SelectItem value="Draft">Draft</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
              </CardHeader>
              <CardContent>
                  <InvoiceList invoices={filteredInvoices} />
              </CardContent>
          </Card>
        </div>
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
            <InvoiceTemplate />
        </TabsContent>
      </Tabs>
      
      {isModalOpen && (
          <InvoiceFormModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveInvoice}
            invoice={editingInvoice}
          />
      )}
    </div>
  );
}
