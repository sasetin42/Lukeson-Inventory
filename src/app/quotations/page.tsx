
'use client';

import { useState, useEffect, useMemo } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, Check, Clock, DollarSign, CheckCircle, AlertCircle, Search } from "lucide-react";
import QuotationList from "@/components/quotations/quotation-list";
import { Quotation, Customer, SalesOrder, JobOrder, Product } from '@/lib/types';
import QuotationFormModal from '@/components/quotations/quotation-form-modal';
import QuotationDetailsModal from '@/components/quotations/quotation-details-modal';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';
import CustomerViewModal from '@/components/customers/customer-view-modal';
import SalesOrderViewModal from '@/components/sales-orders/sales-order-view-modal';
import JobOrderViewModal from '@/components/job-orders/job-order-view-modal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isSalesOrderModalOpen, setIsSalesOrderModalOpen] = useState(false);
  const [isJobOrderModalOpen, setIsJobOrderModalOpen] = useState(false);

  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [viewingSalesOrder, setViewingSalesOrder] = useState<SalesOrder | null>(null);
  const [viewingJobOrder, setViewingJobOrder] = useState<JobOrder | null>(null);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const quotationsRef = collection(db, 'quotations');
    const customersRef = collection(db, 'customers');
    const salesOrdersRef = collection(db, 'salesOrders');
    const jobOrdersRef = collection(db, 'jobOrders');
    const productsRef = collection(db, 'products');

    const unsubscribeQtns = onSnapshot(quotationsRef, (snapshot) => {
        const loadedQuotations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quotation));
        setQuotations(loadedQuotations);
    }, (error) => {
        console.error("Error fetching quotations:", error);
        toast({ title: "Error", description: "Failed to load quotations.", variant: "destructive", icon: <AlertCircle className="h-5 w-5" /> });
    });

    const unsubscribeCustomers = onSnapshot(customersRef, (snapshot) => {
        const loadedCustomers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
        setCustomers(loadedCustomers);
    }, (error) => {
        console.error("Error fetching customers:", error);
        toast({ title: "Error", description: "Failed to load customers.", variant: "destructive", icon: <AlertCircle className="h-5 w-5" /> });
    });
      
    const unsubscribeSalesOrders = onSnapshot(salesOrdersRef, (snapshot) => {
        const loadedSalesOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOrder));
        setSalesOrders(loadedSalesOrders);
    }, (error) => {
        console.error("Error fetching sales orders:", error);
        toast({ title: "Error", description: "Failed to load sales orders.", variant: "destructive", icon: <AlertCircle className="h-5 w-5" /> });
    });

    const unsubscribeJobOrders = onSnapshot(jobOrdersRef, (snapshot) => {
        const loadedJobOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobOrder));
        setJobOrders(loadedJobOrders);
    }, (error) => {
        console.error("Error fetching job orders:", error);
        toast({ title: "Error", description: "Failed to load job orders.", variant: "destructive", icon: <AlertCircle className="h-5 w-5" /> });
    });

    const unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });

    return () => {
        unsubscribeQtns();
        unsubscribeCustomers();
        unsubscribeSalesOrders();
        unsubscribeJobOrders();
        unsubscribeProducts();
    };
  }, [toast]);

  const filteredQuotations = useMemo(() => {
    return quotations.filter(quotation => {
      const matchesSearch =
        quotation.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (quotation.customerName && quotation.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchQuery, statusFilter]);

  const handleOpenFormModal = (quotation: Quotation | null) => {
    setEditingQuotation(quotation);
    setIsFormModalOpen(true);
    setIsDetailsModalOpen(false); // Close details modal if open
  };
  
  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingQuotation(null);
  }

  const handleOpenDetailsModal = (quotation: Quotation) => {
    setViewingQuotation(quotation);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setViewingQuotation(null);
  }
  
  const handleOpenCustomerModal = (customer: Customer) => {
    setViewingCustomer(customer);
    setIsCustomerModalOpen(true);
  }

  const handleCloseCustomerModal = () => {
    setIsCustomerModalOpen(false);
    setViewingCustomer(null);
  }
  
  const handleOpenSalesOrderModal = (salesOrder: SalesOrder) => {
      setViewingSalesOrder(salesOrder);
      setIsSalesOrderModalOpen(true);
  }

  const handleCloseSalesOrderModal = () => {
    setIsSalesOrderModalOpen(false);
    setViewingSalesOrder(null);
  }
  
  const handleOpenJobOrderModal = (jobOrder: JobOrder) => {
      setViewingJobOrder(jobOrder);
      setIsJobOrderModalOpen(true);
  }

  const handleCloseJobOrderModal = () => {
    setIsJobOrderModalOpen(false);
    setViewingJobOrder(null);
  }


  const handleSaveQuotation = async (quotationData: Omit<Quotation, 'id'> & { id?: string }) => {
    try {
      if (editingQuotation) { // We are editing
        const { id, ...dataToSave } = quotationData;
        const docRef = doc(db, "quotations", editingQuotation.id);
        await setDoc(docRef, { ...dataToSave, modifiedAt: serverTimestamp() }, { merge: true });
        toast({ title: "Success", description: "Quotation updated successfully.", variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
      } else { // We are creating
        const { id, ...dataToSave } = quotationData;
        const docRef = doc(db, "quotations", id as string);
        await setDoc(docRef, { ...dataToSave, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
        toast({ title: "Success", description: "Quotation added successfully.", variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
      }

      handleCloseFormModal();
    } catch (error) {
      console.error("Error saving quotation: ", error);
      toast({ title: "Error", description: "Failed to save quotation.", variant: "destructive", icon: <AlertCircle className="h-5 w-5" /> });
    }
  };


  const handleDeleteQuotation = async (quotationId: string) => {
    await deleteDoc(doc(db, "quotations", quotationId));
    toast({ title: "Success", description: "Quotation deleted successfully.", variant: "destructive" });
  };

  const handleApproveQuotation = async (quotation: Quotation) => {
    const docRef = doc(db, "quotations", quotation.id);
    try {
        await setDoc(docRef, { status: 'Accepted', modifiedAt: serverTimestamp() }, { merge: true });
        toast({ title: 'Success', description: `Quotation ${quotation.id} has been approved.`, variant: 'success', icon: <CheckCircle className="h-5 w-5" /> });
    } catch (error) {
        console.error("Error approving quotation: ", error);
        toast({ title: 'Error', description: 'Failed to approve quotation.', variant: 'destructive', icon: <AlertCircle className="h-5 w-5" /> });
    }
  }

  const totalQuotations = quotations.length;
  const pendingQuotations = quotations.filter(q => q.status === 'Sent' || q.status === 'Draft').length;
  const acceptedQuotations = quotations.filter(q => q.status === 'Accepted').length;
  const acceptanceRate = totalQuotations > 0 ? (acceptedQuotations / totalQuotations) * 100 : 0;
  const totalQuotedValue = quotations.reduce((sum, q) => sum + q.totalAmount, 0);

  const kpis = [
      { title: "Total Quotations", value: totalQuotations, icon: FileText, color: "blue" as const },
      { title: "Pending", value: pendingQuotations, icon: Clock, color: "yellow" as const },
      { title: "Total Quoted Value", value: `₱${totalQuotedValue.toLocaleString()}`, icon: DollarSign, color: "green" as const },
      { title: "Acceptance Rate", value: `${acceptanceRate.toFixed(1)}%`, icon: Check, color: "purple" as const }
  ];


  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Quotations"
        description="Create and manage customer quotations."
        icon={<FileText className="h-6 w-6 text-purple-500" />}
      />
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
      <QuotationList
        quotations={filteredQuotations}
        customers={customers}
        salesOrders={salesOrders}
        onView={handleOpenDetailsModal}
        onEdit={handleOpenFormModal}
        onCreate={() => handleOpenFormModal(null)}
        onDelete={handleDeleteQuotation}
        onApprove={handleApproveQuotation}
        onViewCustomer={handleOpenCustomerModal}
        onViewSalesOrder={handleOpenSalesOrderModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      {isFormModalOpen && (
        <QuotationFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModal}
          onSave={handleSaveQuotation}
          quotation={editingQuotation}
        />
      )}
      {isDetailsModalOpen && (
        <QuotationDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          onEdit={handleOpenFormModal}
          quotation={viewingQuotation}
          salesOrders={salesOrders}
        />
      )}
      {isCustomerModalOpen && (
          <CustomerViewModal 
            isOpen={isCustomerModalOpen}
            onClose={handleCloseCustomerModal}
            customer={viewingCustomer}
          />
      )}
      {isSalesOrderModalOpen && (
        <SalesOrderViewModal
            isOpen={isSalesOrderModalOpen}
            onClose={handleCloseSalesOrderModal}
            salesOrder={viewingSalesOrder}
            products={products}
            quotations={quotations}
            jobOrders={jobOrders}
            onEdit={(so) => {
                handleCloseSalesOrderModal();
                toast({title: "Info", description: "To edit a Sales Order, please go to the Sales Orders page."});
            }}
        />
      )}
       {isJobOrderModalOpen && viewingJobOrder && (
          <JobOrderViewModal
            isOpen={isJobOrderModalOpen}
            onClose={handleCloseJobOrderModal}
            jobOrder={viewingJobOrder}
            salesOrder={salesOrders.find(so => so.id === viewingJobOrder.salesOrderId)}
            quotation={quotations.find(q => q.id === salesOrders.find(so => so.id === viewingJobOrder.salesOrderId)?.quotationId)}
            onEdit={() => {
                handleCloseJobOrderModal();
                toast({title: "Info", description: "To edit a Job Order, please go to the Job Orders page."});
            }}
          />
      )}
    </div>
  );
}
