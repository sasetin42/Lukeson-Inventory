
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Banknote, PlusCircle, CheckCircle, Clock, Calendar, History, List, AlertCircle } from "lucide-react";
import { Invoice, Customer, SalesOrder, Quotation, JobOrder, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, onSnapshot, writeBatch, query, where } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';
import PaymentList from '@/components/payments/payment-list';
import { differenceInDays } from 'date-fns';
import TransactionViewModal from '@/components/payments/transaction-view-modal';
import SalesOrderViewModal from '@/components/sales-orders/sales-order-view-modal';
import CustomerViewModal from '@/components/customers/customer-view-modal';
import InvoiceViewModal from '@/components/invoices/invoice-view-modal';
import InvoiceFormModal from '@/components/invoices/invoice-form-modal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [viewingTransaction, setViewingTransaction] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isInvoiceFormModalOpen, setIsInvoiceFormModalOpen] = useState(false);
  const [viewingSalesOrder, setViewingSalesOrder] = useState<SalesOrder | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [isSalesOrderModalOpen, setIsSalesOrderModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isClearHistoryAlertOpen, setIsClearHistoryAlertOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const invoicesRef = collection(db, 'invoices');
    const customersRef = collection(db, 'customers');
    const salesOrdersRef = collection(db, 'salesOrders');
    const quotationsRef = collection(db, 'quotations');
    const jobOrdersRef = collection(db, 'jobOrders');
    const productsRef = collection(db, 'products');

    const unsubInvoices = onSnapshot(invoicesRef, (snapshot) => {
        const loadedInvoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
        setInvoices(loadedInvoices);
    }, (error) => {
        console.error("Error fetching invoices: ", error);
        toast({ title: "Error", description: "Failed to load payment data.", variant: "destructive" });
    });

    const unsubCustomers = onSnapshot(customersRef, (snapshot) => {
        setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
    });

    const unsubSalesOrders = onSnapshot(salesOrdersRef, (snapshot) => {
        setSalesOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOrder)));
    });
    
    const unsubQuotations = onSnapshot(quotationsRef, (snapshot) => {
        setQuotations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quotation)));
    });

    const unsubJobOrders = onSnapshot(jobOrdersRef, (snapshot) => {
        setJobOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobOrder)));
    });

    const unsubProducts = onSnapshot(productsRef, (snapshot) => {
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });
    
    return () => {
        unsubInvoices();
        unsubCustomers();
        unsubSalesOrders();
        unsubQuotations();
        unsubJobOrders();
        unsubProducts();
    };
  }, [toast]);
  
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid' && !inv.archived);
  const totalCollected = paidInvoices.reduce((acc, inv) => acc + inv.amount, 0);
  const pendingCollection = invoices.filter(inv => inv.status === 'Posted' || inv.status === 'Overdue' || inv.status === 'Draft').reduce((acc, inv) => acc + inv.balance, 0);
  
  const collectionTimes = paidInvoices.map(inv => {
    const issueDate = (inv.date as any).toDate ? (inv.date as any).toDate() : new Date(inv.date as string);
    const paidDate = (inv as any).paidDate ? ((inv as any).paidDate.toDate ? (inv as any).paidDate.toDate() : new Date((inv as any).paidDate as string)) : new Date();
    return differenceInDays(paidDate, issueDate);
  }).filter(days => days >= 0);

  const avgCollectionTime = collectionTimes.length > 0 ? collectionTimes.reduce((a, b) => a + b, 0) / collectionTimes.length : 0;


  const kpis = [
      { title: "Total Collected", value: `₱${totalCollected.toLocaleString()}`, icon: CheckCircle, color: "green" as const },
      { title: "Pending Collection", value: `₱${pendingCollection.toLocaleString()}`, icon: Clock, color: "yellow" as const },
      { title: "Avg. Collection Time", value: `${avgCollectionTime.toFixed(1)} days`, icon: Calendar, color: "blue" as const },
  ];

  const handleViewTransaction = (invoice: Invoice) => setViewingTransaction(invoice);

  const handleViewSalesInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice);
  };

  const handleEditInvoice = (invoiceToEdit: Invoice) => {
    setViewingInvoice(null);
    setEditingInvoice(invoiceToEdit);
    setIsInvoiceFormModalOpen(true);
  }

  const handleViewCustomer = (invoice: Invoice) => {
      const customer = customers.find(c => c.id === invoice.customerId);
       if(customer) {
        setViewingCustomer(customer);
        setIsCustomerModalOpen(true);
      } else {
        toast({ title: "Not Found", description: "Associated Customer not found.", variant: "destructive" });
      }
  }
  
  const handleClearHistory = async () => {
    const q = query(collection(db, 'invoices'), where('status', '==', 'Paid'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        toast({ title: "No Paid Invoices", description: "There are no paid invoices to archive.", variant: "default" });
        return;
    }

    const batch = writeBatch(db);
    snapshot.forEach(doc => {
        batch.update(doc.ref, { archived: true });
    });

    try {
        await batch.commit();
        toast({ title: "History Cleared", description: "All paid invoices have been archived.", variant: "success" });
    } catch (error) {
        console.error("Error clearing history:", error);
        toast({ title: "Error", description: "Failed to clear payment history.", variant: "destructive" });
    }
  }


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
      <PaymentList 
        invoices={paidInvoices} 
        onViewTransaction={handleViewTransaction}
        onViewSalesInvoice={handleViewSalesInvoice}
        onViewCustomer={handleViewCustomer}
        onClearHistory={() => setIsClearHistoryAlertOpen(true)}
      />
      
      {viewingTransaction && (
          <TransactionViewModal 
            isOpen={!!viewingTransaction}
            onClose={() => setViewingTransaction(null)}
            invoice={viewingTransaction}
          />
      )}

      {viewingInvoice && (
        <InvoiceViewModal
            isOpen={!!viewingInvoice}
            onClose={() => setViewingInvoice(null)}
            invoice={viewingInvoice}
            products={products}
            onEdit={handleEditInvoice}
        />
      )}

      {isInvoiceFormModalOpen && (
          <InvoiceFormModal 
            isOpen={isInvoiceFormModalOpen}
            onClose={() => setIsInvoiceFormModalOpen(false)}
            onSave={() => {}}
            invoice={editingInvoice}
          />
      )}
      
      {isCustomerModalOpen && viewingCustomer && (
          <CustomerViewModal
            isOpen={isCustomerModalOpen}
            onClose={() => setIsCustomerModalOpen(false)}
            customer={viewingCustomer}
          />
      )}

      <AlertDialog open={isClearHistoryAlertOpen} onOpenChange={setIsClearHistoryAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action will archive all paid invoices. They will no longer appear in the main list but will be kept in the database.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearHistory}>Confirm & Archive</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
