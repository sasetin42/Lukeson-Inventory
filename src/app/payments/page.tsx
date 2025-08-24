
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Banknote, PlusCircle, CheckCircle, Clock, Calendar } from "lucide-react";
import { Invoice, Customer, SalesOrder, Quotation, JobOrder } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';
import PaymentList from '@/components/payments/payment-list';
import { differenceInDays } from 'date-fns';
import TransactionViewModal from '@/components/payments/transaction-view-modal';
import SalesOrderViewModal from '@/components/sales-orders/sales-order-view-modal';
import CustomerViewModal from '@/components/customers/customer-view-modal';


export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [viewingTransaction, setViewingTransaction] = useState<Invoice | null>(null);
  const [viewingSalesOrder, setViewingSalesOrder] = useState<SalesOrder | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [isSalesOrderModalOpen, setIsSalesOrderModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const invoicesRef = collection(db, 'invoices');
    const customersRef = collection(db, 'customers');
    const salesOrdersRef = collection(db, 'salesOrders');
    const quotationsRef = collection(db, 'quotations');
    const jobOrdersRef = collection(db, 'jobOrders');

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
    
    return () => {
        unsubInvoices();
        unsubCustomers();
        unsubSalesOrders();
        unsubQuotations();
        unsubJobOrders();
    };
  }, [toast]);
  
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
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
      const so = salesOrders.find(s => s.id === invoice.salesOrderId);
      if(so) {
        setViewingSalesOrder(so);
        setIsSalesOrderModalOpen(true);
      } else {
        toast({ title: "Not Found", description: "Associated Sales Order not found.", variant: "destructive" });
      }
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
      />
      
      {viewingTransaction && (
          <TransactionViewModal 
            isOpen={!!viewingTransaction}
            onClose={() => setViewingTransaction(null)}
            invoice={viewingTransaction}
          />
      )}

      {isSalesOrderModalOpen && viewingSalesOrder && (
        <SalesOrderViewModal
            isOpen={isSalesOrderModalOpen}
            onClose={() => setIsSalesOrderModalOpen(false)}
            salesOrder={viewingSalesOrder}
            quotations={quotations}
            jobOrders={jobOrders}
            onEdit={() => {}}
        />
      )}
      
      {isCustomerModalOpen && viewingCustomer && (
          <CustomerViewModal
            isOpen={isCustomerModalOpen}
            onClose={() => setIsCustomerModalOpen(false)}
            customer={viewingCustomer}
          />
      )}
    </div>
  );
}
