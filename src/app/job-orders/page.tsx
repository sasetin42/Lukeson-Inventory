
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, DollarSign, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import JobOrderList from "@/components/job-orders/job-order-list";
import { JobOrder } from '@/lib/types';
import JobOrderFormModal from '@/components/job-orders/job-order-form-modal';
import JobOrderViewModal from '@/components/job-orders/job-order-view-modal';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JobOrderTemplate from '@/components/job-orders/job-order-template';

export default function JobOrdersPage() {
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingJobOrder, setEditingJobOrder] = useState<JobOrder | null>(null);
  const [viewingJobOrder, setViewingJobOrder] = useState<JobOrder | null>(null);
  const { toast } = useToast();

  const fetchJobOrders = async () => {
    try {
      const joRef = collection(db, 'jobOrders');
      const snapshot = await getDocs(joRef);
      const loadedJOs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobOrder));
      setJobOrders(loadedJOs);
    } catch (error) {
      console.error("Error fetching job orders: ", error);
      toast({
        title: "Error",
        description: "Failed to load job orders. Please check your connection and permissions.",
        variant: "destructive",
        icon: <AlertCircle className="h-5 w-5" />
      });
    }
  };

  useEffect(() => {
    fetchJobOrders();
  }, []);

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
          if (jobOrderData.id) {
              const { id, ...dataToSave } = jobOrderData;
              const joRef = doc(db, "jobOrders", id);
              await setDoc(joRef, { ...dataToSave, modifiedAt: serverTimestamp() }, { merge: true });
              toast({ title: "Success", description: "Job Order updated successfully.", variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
          } else {
              const { id, ...dataToSave } = jobOrderData;
              await addDoc(collection(db, "jobOrders"), { ...dataToSave, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
              toast({ title: "Success", description: "Job Order added successfully.", variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
          }
          handleCloseFormModal();
          fetchJobOrders();
      } catch (error) {
          console.error("Error saving job order: ", error);
          toast({ title: "Error", description: "Failed to save job order.", variant: "destructive", icon: <AlertCircle className="h-5 w-5" /> });
      }
  };


  const handleDeleteJobOrder = async (jobOrderId: string) => {
    await deleteDoc(doc(db, "jobOrders", jobOrderId));
    toast({ title: "Success", description: "Job Order deleted successfully.", variant: "destructive" });
    fetchJobOrders();
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
          <TabsTrigger value="templates">Job Order Template</TabsTrigger>
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
              onEdit={handleOpenFormModal}
              onDelete={handleDeleteJobOrder}
              onView={handleOpenViewModal}
            />
          </div>
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
            <JobOrderTemplate />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
            <p>Job Order Settings will go here.</p>
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
          />
      )}
    </div>
  );
}
