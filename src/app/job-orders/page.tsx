
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, DollarSign, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import JobOrderList from "@/components/job-orders/job-order-list";
import { JobOrder, Quotation, SalesOrder } from '@/lib/types';
import JobOrderFormModal from '@/components/job-orders/job-order-form-modal';
import JobOrderViewModal from '@/components/job-orders/job-order-view-modal';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JobOrderSettings from '@/components/job-orders/job-order-settings';

function JobOrdersContent() {
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingJobOrder, setEditingJobOrder] = useState<JobOrder | null>(null);
  const [viewingJobOrder, setViewingJobOrder] = useState<JobOrder | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const fromSalesOrder = searchParams.get('fromSalesOrder');

  useEffect(() => {
    if (fromSalesOrder) {
      try {
        const soData: SalesOrder = JSON.parse(decodeURIComponent(fromSalesOrder));
        const newJobOrder: Omit<JobOrder, 'id' | 'createdAt' | 'modifiedAt'> = {
          customerId: soData.customerId,
          customerName: soData.customerName,
          salesOrderId: soData.id,
          jobOrderDate: new Date(),
          status: 'Draft',
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

    return () => {
        unsubscribeJOs();
        unsubscribeSOs();
        unsubscribeQtns();
    };
  }, [toast]);

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

  const handleSaveJobOrder = async (jobOrderData: Omit<JobOrder, 'id'> & {id?: string}) => {
      try {
          const { id, ...dataToSave } = jobOrderData;
          const finalStatus = !jobOrderData.id ? 'In Progress' : jobOrderData.status;

          if (jobOrderData.id && editingJobOrder) { // check for editingJobOrder to be sure
              const joRef = doc(db, "jobOrders", id as string);
              await setDoc(joRef, { ...dataToSave, status: finalStatus, modifiedAt: serverTimestamp() }, { merge: true });
              toast({ title: "Success", description: "Job Order updated successfully.", variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
          } else {
              const docId = id as string; // The formatted ID is passed from the form
              const joRef = doc(db, "jobOrders", docId);
              await setDoc(joRef, { ...dataToSave, status: finalStatus, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
              toast({ title: "Success", description: "Job Order added successfully.", variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
          }

          // If job order is completed, update the sales order status to fulfilled
          if (finalStatus === 'Completed' && jobOrderData.salesOrderId) {
            const soRef = doc(db, "salesOrders", jobOrderData.salesOrderId);
            await updateDoc(soRef, {
                status: 'Fulfilled',
                modifiedAt: serverTimestamp()
            });
            toast({ title: "Sales Order Updated", description: `Sales Order ${jobOrderData.salesOrderId} has been marked as Fulfilled.`, variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
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

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Job Orders"
        description="Manage job orders for your customers."
        icon={<PlusCircle className="h-6 w-6 text-orange-500" />}
        actions={
          <Button onClick={() => handleOpenFormModal(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Job Order
          </Button>
        }
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
              jobOrders={jobOrders} 
              salesOrders={salesOrders}
              onEdit={handleOpenFormModal}
              onDelete={handleDeleteJobOrder}
              onView={handleOpenViewModal}
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
            salesOrder={salesOrders.find(so => so.id === viewingJobOrder.salesOrderId)}
            quotation={quotations.find(q => q.id === salesOrders.find(so => so.id === viewingJobOrder.salesOrderId)?.quotationId)}
            onEdit={handleOpenFormModal}
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
