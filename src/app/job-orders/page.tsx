
'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, DollarSign, CheckCircle, Clock, XCircle, AlertCircle, Search } from "lucide-react";
import JobOrderList from "@/components/job-orders/job-order-list";
import { JobOrder, Quotation, SalesOrder, Customer } from '@/lib/types';
import JobOrderFormModal from '@/components/job-orders/job-order-form-modal';
import JobOrderViewModal from '@/components/job-orders/job-order-view-modal';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JobOrderSettings from '@/components/job-orders/job-order-settings';
import CustomerViewModal from '@/components/customers/customer-view-modal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function JobOrdersContent() {
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingJobOrder, setEditingJobOrder] = useState<JobOrder | null>(null);
  const [viewingJobOrder, setViewingJobOrder] = useState<JobOrder | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const fromSalesOrder = searchParams.get('fromSalesOrder');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (fromSalesOrder) {
      try {
        const soData: SalesOrder = JSON.parse(decodeURIComponent(fromSalesOrder));
        const newJobOrder: Omit<JobOrder, 'id' | 'createdAt' | 'modifiedAt'> = {
          customerId: soData.customerId,
          customerName: soData.customerName,
          salesOrderId: soData.id,
          jobOrderDate: new Date(),
          status: 'Scheduled',
          lines: soData.lines,
          totalAmount: soData.totalAmount,
          notes: soData.notes,
        };
        setEditingJobOrder(newJobOrder as JobOrder);
        setIsFormModalOpen(true);
      } catch (error) {
        console.error("Error parsing sales order data:", error);
        toast({ title: "Error", description: "Could not create job order from sales order.", variant: "destructive", icon: <AlertCircle className="h-5 w-5" /> });
      }
    }
  }, [fromSalesOrder, toast]);

  useEffect(() => {
    const joRef = collection(db, 'jobOrders');
    const soRef = collection(db, 'salesOrders');
    const qtnRef = collection(db, 'quotations');
    const customersRef = collection(db, 'customers');

    const unsubscribeJOs = onSnapshot(joRef, (snapshot) => {
        const loadedJOs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobOrder));
        setJobOrders(loadedJOs);
    }, (error) => {
        console.error("Error fetching job orders:", error);
        toast({ title: "Error", description: "Failed to load job orders.", variant: "destructive", icon: <AlertCircle className="h-5 w-5" /> });
    });

    const unsubscribeSOs = onSnapshot(soRef, (snapshot) => {
        const loadedSOs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOrder));
        setSalesOrders(loadedSOs);
    }, (error) => {
        console.error("Error fetching sales orders:", error);
        toast({ title: "Error", description: "Failed to load sales orders.", variant: "destructive", icon: <AlertCircle className="h-5 w-5" /> });
    });

    const unsubscribeQtns = onSnapshot(qtnRef, (snapshot) => {
        const loadedQtns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quotation));
        setQuotations(loadedQtns);
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

    return () => {
        unsubscribeJOs();
        unsubscribeSOs();
        unsubscribeQtns();
        unsubscribeCustomers();
    };
  }, [toast]);

  const filteredJobOrders = useMemo(() => {
    return jobOrders.filter(jo => {
      const matchesSearch =
        jo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (jo.customerName && jo.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || jo.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobOrders, searchQuery, statusFilter]);

  const handleOpenFormModal = (jobOrder: JobOrder | null) => {
    setEditingJobOrder(jobOrder);
    setIsFormModalOpen(true);
  };
  
  const handleCloseFormModal = () => {
      setIsFormModalOpen(false);
      setEditingJobOrder(null);
  }

  const handleOpenViewModal = (jobOrder: JobOrder) => {
    setViewingJobOrder(jobOrder);
  }
  
  const handleCloseViewModal = () => {
    setViewingJobOrder(null);
  }

  const handleOpenCustomerModal = (customer: Customer) => {
    setViewingCustomer(customer);
    setIsCustomerModalOpen(true);
  }

  const handleCloseCustomerModal = () => {
    setIsCustomerModalOpen(false);
    setViewingCustomer(null);
  }

  const handleSaveJobOrder = async (jobOrderData: Omit<JobOrder, 'id'> & {id?: string}) => {
      try {
          if (jobOrderData.id) { // This is an edit
              const { id, ...dataToSave } = jobOrderData;
              const joRef = doc(db, "jobOrders", id);
              await setDoc(joRef, { ...dataToSave, modifiedAt: serverTimestamp() }, { merge: true });
              toast({ title: "Success", description: "Job Order updated successfully.", variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
          } else { // This is a new record from sales order
              const { id, ...dataToSave } = jobOrderData;
              const docRef = doc(collection(db, "jobOrders")); // Let Firestore generate the ID
              await setDoc(docRef, { ...dataToSave, status: 'Scheduled', createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
              toast({ title: "Success", description: "Job Order added successfully.", variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
          }

          const finalStatus = jobOrderData.status || 'In Progress';

          if (jobOrderData.salesOrderId) {
            const soRef = doc(db, "salesOrders", jobOrderData.salesOrderId);
            let soUpdate: { status: string; modifiedAt: any; } | null = null;
            let soToastMessage: string | null = null;

            switch(finalStatus) {
                case 'Completed':
                    soUpdate = { status: 'Fulfilled', modifiedAt: serverTimestamp() };
                    soToastMessage = `Sales Order ${jobOrderData.salesOrderId} has been marked as Fulfilled.`;
                    break;
                case 'In Progress':
                case 'Scheduled':
                case 'On Hold':
                    soUpdate = { status: 'Confirmed', modifiedAt: serverTimestamp() };
                    soToastMessage = `Sales Order ${jobOrderData.salesOrderId} is now Confirmed.`;
                    break;
                case 'Draft':
                case 'Cancelled':
                    soUpdate = { status: 'Draft', modifiedAt: serverTimestamp() };
                    soToastMessage = `Sales Order ${jobOrderData.salesOrderId} has been reverted to Draft.`;
                    break;
            }
            
            if (soUpdate) {
                await updateDoc(soRef, soUpdate);
                toast({ title: "Sales Order Updated", description: soToastMessage!, variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
            }
          }

          handleCloseFormModal();
      } catch (error) {
          console.error("Error saving job order: ", error);
          toast({ title: "Error", description: "Failed to save job order.", variant: "destructive", icon: <AlertCircle className="h-5 w-5" /> });
      }
  };


  const handleDeleteJobOrder = async (jobOrderId: string) => {
    await deleteDoc(doc(db, "jobOrders", jobOrderId));
    toast({ title: "Success", description: "Job Order deleted successfully.", variant: "destructive" });
  };
  
  const handleStatusUpdate = async (jobOrderId: string, newStatus: JobOrder['status']) => {
    const joRef = doc(db, 'jobOrders', jobOrderId);
    try {
        await updateDoc(joRef, { status: newStatus, modifiedAt: serverTimestamp() });
        toast({
            title: "Status Updated",
            description: `Job order ${jobOrderId} has been updated to "${newStatus}".`,
            variant: "success"
        });

        const joDoc = await getDoc(joRef);
        if (joDoc.exists()) {
            const jobOrder = joDoc.data() as JobOrder;
            if (jobOrder.salesOrderId) {
                const soRef = doc(db, 'salesOrders', jobOrder.salesOrderId);
                let soUpdate: { status: string; modifiedAt: any; } | null = null;
                let soToastMessage: string | null = null;
                
                 switch(newStatus) {
                    case 'Completed':
                        soUpdate = { status: 'Fulfilled', modifiedAt: serverTimestamp() };
                        soToastMessage = `Sales Order ${jobOrder.salesOrderId} has been marked as Fulfilled.`;
                        break;
                    case 'In Progress':
                    case 'Scheduled':
                    case 'On Hold':
                        soUpdate = { status: 'Confirmed', modifiedAt: serverTimestamp() };
                        soToastMessage = `Sales Order ${jobOrder.salesOrderId} is now Confirmed.`;
                        break;
                    case 'Draft':
                    case 'Cancelled':
                        soUpdate = { status: 'Draft', modifiedAt: serverTimestamp() };
                        soToastMessage = `Sales Order ${jobOrder.salesOrderId} has been reverted to Draft.`;
                        break;
                }

                if (soUpdate) {
                    await updateDoc(soRef, soUpdate);
                    toast({
                        title: "Sales Order Updated",
                        description: soToastMessage!,
                        variant: "success"
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error updating JO status:", error);
        toast({
            title: "Error",
            description: "Failed to update job order status.",
            variant: "destructive"
        });
    }
  };


  const totalValue = jobOrders.reduce((sum, jo) => sum + jo.totalAmount, 0);
  const totalCompleted = jobOrders.filter(jo => jo.status === 'Completed').length;
  const totalInProgress = jobOrders.filter(jo => jo.status === 'In Progress').length;
  const totalCancelled = jobOrders.filter(jo => jo.status === 'Cancelled').length;

  const kpis = [
      { title: "Total Job Value", value: `₱${totalValue.toLocaleString()}`, icon: DollarSign, color: "green" as const },
      { title: "Completed Jobs", value: totalCompleted, icon: CheckCircle, color: "blue" as const },
      { title: "In Progress", value: totalInProgress, icon: Clock, color: "yellow" as const },
      { title: "Cancelled Jobs", value: totalCancelled, icon: XCircle, color: "red" as const }
  ];

  const viewingSalesOrder = viewingJobOrder ? salesOrders.find(so => so.id === viewingJobOrder.salesOrderId) : undefined;
  const viewingQuotation = viewingSalesOrder ? quotations.find(q => q.id === viewingSalesOrder.quotationId) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Job Orders"
        description="Manage job orders for your customers."
        icon={<PlusCircle className="h-6 w-6 text-orange-500" />}
      />
       <Tabs defaultValue="job-orders">
        <TabsList>
          <TabsTrigger value="job-orders">Job Orders</TabsTrigger>
          <TabsTrigger value="settings">Job Order Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="job-orders" className="mt-4">
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
            <JobOrderList 
              jobOrders={filteredJobOrders} 
              salesOrders={salesOrders}
              customers={customers}
              onCreate={() => handleOpenFormModal(null)}
              onEdit={handleOpenFormModal}
              onDelete={handleDeleteJobOrder}
              onView={handleOpenViewModal}
              onViewCustomer={handleOpenCustomerModal}
              onStatusChange={handleStatusUpdate}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          </div>
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
            <JobOrderSettings />
        </TabsContent>
      </Tabs>
      {isFormModalOpen && (
        <JobOrderFormModal
            isOpen={isFormModalOpen}
            onClose={handleCloseFormModal}
            onSave={handleSaveJobOrder}
            jobOrder={editingJobOrder}
        />
      )}
      {viewingJobOrder && (
          <JobOrderViewModal
            isOpen={!!viewingJobOrder}
            onClose={handleCloseViewModal}
            jobOrder={viewingJobOrder}
            salesOrder={viewingSalesOrder}
            quotation={viewingQuotation}
            onEdit={handleOpenFormModal}
          />
      )}
      {isCustomerModalOpen && (
        <CustomerViewModal
            isOpen={isCustomerModalOpen}
            onClose={handleCloseCustomerModal}
            customer={viewingCustomer}
        />
      )}
    </div>
  );
}

export default function JobOrdersPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <JobOrdersContent />
        </Suspense>
    )
}

    
