
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, DollarSign, CheckCircle, XCircle, Search, AlertCircle } from "lucide-react";
import InvoiceList from "@/components/invoices/invoice-list";
import { Invoice, PaymentMethod, SalesOrder, Customer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, serverTimestamp, deleteDoc, getDoc, addDoc } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoiceTemplate from '@/components/invoices/invoice-template';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import InvoiceFormModal from '@/components/invoices/invoice-form-modal';
import InvoiceViewModal from '@/components/invoices/invoice-view-modal';
import PaymentFormModal from '@/components/payments/payment-form-modal';

function InvoicesContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [invoiceToPay, setInvoiceToPay] = useState<Invoice | null>(null);
  const searchParams = useSearchParams();
  const fromSalesOrder = searchParams.get('fromSalesOrder');

  useEffect(() => {
    if (fromSalesOrder) {
        try {
            const soData: SalesOrder = JSON.parse(decodeURIComponent(fromSalesOrder));
            const newInvoice: Partial<Invoice> = {
                customerId: soData.customerId,
                salesOrderId: soData.id,
                lines: soData.lines,
                notes: soData.notes,
                discountType: soData.discountType,
                discountValue: soData.discountValue,
            };
            setEditingInvoice(newInvoice as Invoice);
            setIsFormModalOpen(true);
        } catch (error) {
            console.error("Error parsing sales order data for invoice:", error);
            toast({ title: "Error", description: "Could not create invoice from sales order.", variant: "destructive" });
        }
    }
  }, [fromSalesOrder, toast]);


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

  const handleOpenFormModal = (invoice: Invoice | null) => {
    setEditingInvoice(invoice);
    setIsFormModalOpen(true);
  }

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingInvoice(null);
  }

  const handleSaveInvoice = async (invoiceData: Omit<Invoice, 'id'> & {id?: string}) => {
    try {
        const { id, ...dataToSave } = invoiceData;

        // Fetch customer details to enrich the invoice
        let customerData: Partial<Customer> = {};
        if(dataToSave.customerId) {
            const customerRef = doc(db, 'customers', dataToSave.customerId);
            const customerSnap = await getDoc(customerRef);
            if(customerSnap.exists()) {
                customerData = customerSnap.data();
            }
        }
        
        const finalData = {
            ...dataToSave,
            customerName: customerData.name || dataToSave.customerName,
            customerTin: customerData.tin || '',
            customerEmail: customerData.email || '',
            customerPhone: customerData.phone || '',
        };
        
        if (id) {
            const docRef = doc(db, "invoices", id);
            if (editingInvoice && editingInvoice.id) { // Editing
                await setDoc(docRef, { ...finalData, modifiedAt: serverTimestamp() }, { merge: true });
                toast({ title: "Success", description: "Invoice updated successfully.", variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
            } else { // Creating from SO or scratch
                 await setDoc(docRef, { ...finalData, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
                toast({ title: "Success", description: "Invoice created successfully.", variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
            }
        } else { // Should not happen with current logic, but as a fallback
            await addDoc(collection(db, 'invoices'), { ...finalData, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
            toast({ title: "Success", description: "Invoice created successfully.", variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
        }
        
        // Update Sales Order status
        if (invoiceData.salesOrderId) {
            const soRef = doc(db, "salesOrders", invoiceData.salesOrderId);
            await setDoc(soRef, { status: 'Invoiced', invoicedStatus: 'Fully Invoiced' }, { merge: true });
        }

        handleCloseFormModal();
    } catch (error) {
        console.error("Error saving invoice: ", error);
        toast({ title: "Error", description: "Failed to save invoice.", variant: "destructive", icon: <AlertCircle className="h-5 w-5" /> });
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice);
  }
  
  const handleOpenPaymentModal = (invoice: Invoice) => {
      setInvoiceToPay(invoice);
      setIsPaymentModalOpen(true);
  }

  const handleClosePaymentModal = () => {
      setIsPaymentModalOpen(false);
      setInvoiceToPay(null);
  }
  
  const handleRecordPayment = async (invoiceId: string, paymentMethod?: PaymentMethod, transactionProof?: string) => {
      try {
          const invoiceRef = doc(db, "invoices", invoiceId);
          const invoiceSnap = await getDoc(invoiceRef);
          if(!invoiceSnap.exists()) throw new Error("Invoice not found");

          const invoiceData = invoiceSnap.data() as Invoice;
          const isPaid = !!(paymentMethod && transactionProof);
          const newStatus = isPaid ? 'Paid' : 'Posted';
          const newPaidAmount = isPaid ? invoiceData.amount : (invoiceData.paidAmount || 0);
          const newBalance = isPaid ? 0 : invoiceData.amount;
          
          await setDoc(invoiceRef, { 
              status: newStatus, 
              paidAmount: newPaidAmount,
              balance: newBalance,
              paidDate: isPaid ? serverTimestamp() : null,
              paymentMethod: paymentMethod || null,
              transactionProof: transactionProof || null
          }, { merge: true });
          
          toast({ title: "Success", description: `Invoice has been marked as ${newStatus}.`, variant: "success" });
          handleClosePaymentModal();
      } catch (error) {
          console.error("Error updating invoice status: ", error);
          toast({ title: "Error", description: "Failed to update invoice status.", variant: "destructive" });
          handleClosePaymentModal();
      }
  }


  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await deleteDoc(doc(db, "invoices", invoiceId));
      toast({ title: "Success", description: "Invoice deleted successfully.", variant: "success" });
    } catch (error) {
      console.error("Error deleting invoice: ", error);
      toast({ title: "Error", description: "Failed to delete invoice.", variant: "destructive" });
    }
  }


  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Sales Invoices"
        description="Manage your invoices and track payments."
        icon={<FileText className="h-6 w-6 text-purple-500" />}
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
                  <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Sales Invoices List</CardTitle>
                        <CardDescription>A list of all your sales invoices.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenFormModal(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Invoice
                    </Button>
                  </div>
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
                  <InvoiceList 
                    invoices={filteredInvoices}
                    onView={handleViewInvoice}
                    onMarkAsPaid={handleOpenPaymentModal}
                    onDelete={handleDeleteInvoice}
                  />
              </CardContent>
          </Card>
        </div>
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
            <InvoiceTemplate />
        </TabsContent>
      </Tabs>
      
      {isFormModalOpen && (
          <InvoiceFormModal 
            isOpen={isFormModalOpen}
            onClose={handleCloseFormModal}
            onSave={handleSaveInvoice}
            invoice={editingInvoice}
          />
      )}
      {viewingInvoice && (
          <InvoiceViewModal 
            isOpen={!!viewingInvoice}
            onClose={() => setViewingInvoice(null)}
            invoice={viewingInvoice}
            onEdit={(invoiceToEdit) => {
              setViewingInvoice(null);
              handleOpenFormModal(invoiceToEdit);
            }}
          />
      )}
      {isPaymentModalOpen && invoiceToPay && (
          <PaymentFormModal
            isOpen={isPaymentModalOpen}
            onClose={handleClosePaymentModal}
            invoice={invoiceToPay}
            onSave={handleRecordPayment}
          />
      )}
    </div>
  );
}


export default function InvoicesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InvoicesContent />
        </Suspense>
    )
}
 
      

    