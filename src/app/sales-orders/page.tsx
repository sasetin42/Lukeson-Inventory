
'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ShoppingCart, PlusCircle, CheckCircle, Clock, XCircle, DollarSign, AlertCircle, Trash2, Search } from "lucide-react";
import SalesOrderList from "@/components/sales-orders/sales-order-list";
import { SalesOrder, Customer, Quotation, JobOrder } from '@/lib/types';
import SalesOrderFormModal from "@/components/sales-orders/sales-order-form-modal";
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, serverTimestamp, query, where, getDoc } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesOrderTemplate from '@/components/sales-orders/sales-order-template';
import SalesOrderViewModal from '@/components/sales-orders/sales-order-view-modal';
import JobOrderViewModal from '@/components/job-orders/job-order-view-modal';
import QuotationDetailsModal from '@/components/quotations/quotation-details-modal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function SalesOrdersContent() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isJoViewModalOpen, setIsJoViewModalOpen] = useState(false);
  const [isQtnViewModalOpen, setIsQtnViewModalOpen] = useState(false);
  const [editingSalesOrder, setEditingSalesOrder] = useState<SalesOrder | null>(null);
  const [viewingSalesOrder, setViewingSalesOrder] = useState<SalesOrder | null>(null);
  const [viewingJobOrder, setViewingJobOrder] = useState<JobOrder | null>(null);
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const customerIdFilter = searchParams.get('customerId');
  const fromQuotation = searchParams.get('fromQuotation');
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (fromQuotation) {
      try {
        const quotationData: Quotation = JSON.parse(decodeURIComponent(fromQuotation));
        const newSalesOrder: Omit<SalesOrder, 'id'> = {
            customerId: quotationData.customerId,
            customerName: quotationData.customerName,
            orderDate: new Date(),
            status: 'Draft',
            lines: quotationData.lines,
            totalAmount: quotationData.totalAmount,
            quotationId: quotationData.id,
            notes: quotationData.notes,
        };
        setEditingSalesOrder(newSalesOrder as SalesOrder);
        setIsModalOpen(true);
      } catch (error) {
        console.error("Error parsing quotation data:", error);
        toast({ title: "Error", description: "Could not create sales order from quotation.", variant: "destructive", icon: <AlertCircle className="h-5 w-5" /> });
      }
    }
  }, [fromQuotation, toast]);

  useEffect(() => {
    const salesOrdersRef = collection(db, 'salesOrders');
    const quotationsRef = collection(db, 'quotations');
    const jobOrdersRef = collection(db, 'jobOrders');

    let q = query(salesOrdersRef);
    if (customerIdFilter) {
      q = query(salesOrdersRef, where("customerId", "==", customerIdFilter));
      getDoc(doc(db, 'customers', customerIdFilter)).then(customerSnap => {
        if (customerSnap.exists()) setCustomerName(customerSnap.data().name);
      });
    }

    const unsubSOs = onSnapshot(q, (snapshot) => {
        setSalesOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOrder)));
    }, (error) => {
        console.error("Error fetching sales orders:", error);
        toast({ title: "Error", description: "Failed to load sales orders.", variant: "destructive" });
    });

    const unsubQtns = onSnapshot(quotationsRef, (snapshot) => {
        setQuotations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quotation)));
    }, (error) => {
        console.error("Error fetching quotations:", error);
        toast({ title: "Error", description: "Failed to load quotations.", variant: "destructive" });
    });

    const unsubJOs = onSnapshot(jobOrdersRef, (snapshot) => {
        setJobOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobOrder)));
    }, (error) => {
        console.error("Error fetching job orders:", error);
        toast({ title: "Error", description: "Failed to load job orders.", variant: "destructive" });
    });
    
    return () => {
        unsubSOs();
        unsubQtns();
        unsubJOs();
    };
  }, [customerIdFilter, toast]);

  const filteredSalesOrders = useMemo(() => {
    return salesOrders.filter(so => {
      const matchesSearch =
        so.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (so.quotationId && so.quotationId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (so.customerName && so.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || so.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [salesOrders, searchQuery, statusFilter]);

  const handleOpenModal = (salesOrder: SalesOrder | null) => {
    setEditingSalesOrder(salesOrder);
    setIsModalOpen(true);
    setIsViewModalOpen(false); // Ensure view modal is closed
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSalesOrder(null);
  }

  const handleOpenViewModal = (salesOrder: SalesOrder) => {
    setViewingSalesOrder(salesOrder);
    setIsViewModalOpen(true);
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingSalesOrder(null);
  }

  const handleOpenJoViewModal = (jobOrder: JobOrder) => {
      setViewingJobOrder(jobOrder);
      setIsJoViewModalOpen(true);
  }

  const handleCloseJoViewModal = () => {
    setIsJoViewModalOpen(false);
    setViewingJobOrder(null);
  }

  const handleOpenQtnViewModal = (quotation: Quotation) => {
    setViewingQuotation(quotation);
    setIsQtnViewModalOpen(true);
  }

  const handleCloseQtnViewModal = () => {
    setIsQtnViewModalOpen(false);
    setViewingQuotation(null);
  }

  const handleSaveSalesOrder = async (salesOrderData: Omit<SalesOrder, 'id'> & { id?: string }) => {
      try {
          const { id, ...dataToSave } = salesOrderData;
          if (editingSalesOrder && editingSalesOrder.id) { // This is an update
              const soRef = doc(db, "salesOrders", editingSalesOrder.id);
              await setDoc(soRef, { ...dataToSave, modifiedAt: serverTimestamp() }, { merge: true });
              toast({ title: "Success", description: "Sales Order updated successfully.", variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
          } else { // This is a new record
              const soRef = doc(db, "salesOrders", id as string);
              await setDoc(soRef, { ...dataToSave, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
              toast({ title: "Success", description: "Sales Order added successfully.", variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
          }
          handleCloseModal();
      } catch (error) {
          console.error("Error saving sales order: ", error);
          toast({ title: "Error", description: "Failed to save sales order.", variant: "destructive", icon: <AlertCircle className="h-5 w-5" /> });
      }
  };


  const handleDeleteSalesOrder = async (salesOrderId: string) => {
    await deleteDoc(doc(db, "salesOrders", salesOrderId));
    toast({ title: "Success", description: "Sales Order deleted successfully.", variant: "destructive", icon: <Trash2 className="h-5 w-5" /> });
  };

  const totalFulfilled = salesOrders.filter(so => so.status === 'Fulfilled').length;
  const totalPending = salesOrders.filter(so => so.status === 'Confirmed' || so.status === 'Draft').length;
  const totalCancelled = salesOrders.filter(so => so.status === 'Cancelled').length;
  const totalValue = salesOrders.reduce((sum, so) => sum + so.totalAmount, 0);

  const kpis = [
      { title: "Total Order Value", value: `₱${totalValue.toLocaleString()}`, icon: DollarSign, color: "green" as const },
      { title: "Fulfilled Orders", value: totalFulfilled, icon: CheckCircle, color: "blue" as const },
      { title: "Pending Orders", value: totalPending, icon: Clock, color: "yellow" as const },
      { title: "Cancelled Orders", value: totalCancelled, icon: XCircle, color: "red" as const }
  ];


  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={customerName ? `Sales Orders for ${customerName}` : 'Sales Orders'}
        description="Manage sales orders."
        icon={<ShoppingCart className="h-6 w-6 text-red-500" />}
        actions={
          <Button onClick={() => handleOpenModal(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Sales Order
          </Button>
        }
      />
      <Tabs defaultValue="sales-orders">
        <TabsList>
          <TabsTrigger value="sales-orders">Sales Orders</TabsTrigger>
          <TabsTrigger value="templates">Sales Order Template</TabsTrigger>
          <TabsTrigger value="settings">Sales Order Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="sales-orders" className="mt-4">
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
          <div className="mt-4">
            <SalesOrderList
                salesOrders={filteredSalesOrders}
                quotations={quotations}
                jobOrders={jobOrders}
                onDelete={handleDeleteSalesOrder}
                onView={handleOpenViewModal}
                onViewJobOrder={handleOpenJoViewModal}
                onViewQuotation={handleOpenQtnViewModal}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
            />
          </div>
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
            <SalesOrderTemplate />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
            <p>Sales Order Settings will go here.</p>
        </TabsContent>
      </Tabs>
      
      {isModalOpen && (
        <SalesOrderFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveSalesOrder}
          salesOrder={editingSalesOrder}
          jobOrders={jobOrders}
        />
      )}
      
      {isViewModalOpen && (
        <SalesOrderViewModal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          salesOrder={viewingSalesOrder}
          quotations={quotations}
          jobOrders={jobOrders}
          onEdit={handleOpenModal}
        />
      )}

      {isJoViewModalOpen && viewingJobOrder && (
          <JobOrderViewModal
            isOpen={isJoViewModalOpen}
            onClose={handleCloseJoViewModal}
            jobOrder={viewingJobOrder}
            salesOrder={salesOrders.find(so => so.id === viewingJobOrder.salesOrderId)}
            quotation={quotations.find(q => q.id === salesOrders.find(so => so.id === viewingJobOrder.salesOrderId)?.quotationId)}
            onEdit={() => {
                handleCloseJoViewModal();
                toast({title: "Info", description: "To edit a Job Order, please go to the Job Orders page."});
            }}
          />
      )}

      {isQtnViewModalOpen && viewingQuotation && (
        <QuotationDetailsModal
          isOpen={isQtnViewModalOpen}
          onClose={handleCloseQtnViewModal}
          onEdit={() => {
              handleCloseQtnViewModal();
              toast({title: "Info", description: "To edit a Quotation, please go to the Quotations page."});
          }}
          quotation={viewingQuotation}
          salesOrders={salesOrders}
        />
      )}
    </div>
  );
}


export default function SalesOrdersPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SalesOrdersContent />
        </Suspense>
    )
}

    