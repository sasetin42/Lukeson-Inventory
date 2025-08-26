
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ShoppingCart, PlusCircle, CheckCircle, Clock, XCircle, DollarSign, ShoppingBag, AlertCircle } from "lucide-react";
import PurchaseOrderList from "@/components/purchase-orders/purchase-order-list";
import { PurchaseOrder } from '@/lib/types';
import PurchaseOrderFormModal from '@/components/purchase-orders/purchase-order-form-modal';
import PurchaseOrderViewModal from '@/components/purchase-orders/purchase-order-view-modal';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, serverTimestamp, query, orderBy, onSnapshot, updateDoc } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PurchaseOrderTemplate from '@/components/purchase-orders/purchase-order-template';


export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [viewingPurchaseOrder, setViewingPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const poRef = collection(db, 'purchaseOrders');
    const q = query(poRef, orderBy('__name__'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedPOs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PurchaseOrder));
        setPurchaseOrders(loadedPOs);
    }, (error) => {
        console.error("Error fetching purchase orders: ", error);
        toast({
            title: "Error",
            description: "Failed to load purchase orders. Please check your connection and permissions.",
            variant: "destructive",
            icon: <AlertCircle className="h-5 w-5" />
        });
    });

    return () => unsubscribe();
  }, [toast]);

  const handleOpenModal = (purchaseOrder: PurchaseOrder | null) => {
    setEditingPurchaseOrder(purchaseOrder);
    setIsModalOpen(true);
    setViewingPurchaseOrder(null);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPurchaseOrder(null);
  }

  const handleOpenViewModal = (purchaseOrder: PurchaseOrder) => {
    setViewingPurchaseOrder(purchaseOrder);
  }
  
  const handleCloseViewModal = () => {
    setViewingPurchaseOrder(null);
  }

  const handleSavePurchaseOrder = async (purchaseOrderData: Omit<PurchaseOrder, 'id'> & { id?: string }) => {
      try {
          if (purchaseOrderData.id && editingPurchaseOrder) { // check for editingPurchaseOrder to be sure
              const { id, ...dataToSave } = purchaseOrderData;
              const poRef = doc(db, "purchaseOrders", id);
              await setDoc(poRef, { ...dataToSave, modifiedAt: serverTimestamp() }, { merge: true });
              toast({ title: "Success", description: "Purchase Order updated successfully.", variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
          } else {
              const { id, ...dataToSave } = purchaseOrderData;
              const docId = id as string; // The formatted ID is passed from the form
              const poRef = doc(db, "purchaseOrders", docId);
              await setDoc(poRef, { ...dataToSave, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
              toast({ title: "Success", description: "Purchase Order added successfully.", variant: "success", icon: <CheckCircle className="h-5 w-5" /> });
          }
          handleCloseModal();
      } catch (error) {
          console.error("Error saving purchase order: ", error);
          toast({ title: "Error", description: "Failed to save purchase order.", variant: "destructive", icon: <AlertCircle className="h-5 w-5" /> });
      }
  };

  const handleStatusUpdate = async (purchaseOrderId: string, newStatus: PurchaseOrder['status']) => {
    const poRef = doc(db, 'purchaseOrders', purchaseOrderId);
    try {
      await updateDoc(poRef, { status: newStatus, modifiedAt: serverTimestamp() });
      toast({
        title: "Status Updated",
        description: `Purchase order ${purchaseOrderId} has been updated to "${newStatus}".`,
        variant: "success"
      });
    } catch (error) {
      console.error("Error updating PO status:", error);
      toast({
        title: "Error",
        description: "Failed to update purchase order status.",
        variant: "destructive"
      });
    }
  };


  const handleDeletePurchaseOrder = async (purchaseOrderId: string) => {
    await deleteDoc(doc(db, "purchaseOrders", purchaseOrderId));
    toast({ title: "Success", description: "Purchase Order deleted successfully.", variant: "destructive" });
  };

  const totalReceived = purchaseOrders.filter(po => po.status === 'Received').length;
  const totalPending = purchaseOrders.filter(po => po.status === 'Sent' || po.status === 'Confirmed').length;
  const totalCancelled = purchaseOrders.filter(po => po.status === 'Cancelled').length;
  const totalValue = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);

  const kpis = [
      { title: "Total PO Value", value: `₱${totalValue.toLocaleString()}`, icon: DollarSign, color: "green" as const },
      { title: "Received Orders", value: totalReceived, icon: CheckCircle, color: "blue" as const },
      { title: "Pending Orders", value: totalPending, icon: Clock, color: "yellow" as const },
      { title: "Cancelled Orders", value: totalCancelled, icon: XCircle, color: "red" as const }
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Purchase Orders"
        description="Manage purchase orders for your suppliers."
        icon={<ShoppingBag className="h-6 w-6 text-blue-500" />}
        actions={
          <Button onClick={() => handleOpenModal(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Purchase Order
          </Button>
        }
      />
      <Tabs defaultValue="purchase-orders">
        <TabsList>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="templates">Purchase Order Template</TabsTrigger>
          <TabsTrigger value="settings">Purchase Order Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="purchase-orders" className="mt-4">
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
            <PurchaseOrderList
              purchaseOrders={purchaseOrders}
              onEdit={handleOpenModal}
              onDelete={handleDeletePurchaseOrder}
              onView={handleOpenViewModal}
              onStatusChange={handleStatusUpdate}
            />
          </div>
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
          <PurchaseOrderTemplate />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <p>Purchase Order Settings will go here.</p>
        </TabsContent>
      </Tabs>
      {isModalOpen && (
        <PurchaseOrderFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSavePurchaseOrder}
          purchaseOrder={editingPurchaseOrder}
        />
      )}
      {viewingPurchaseOrder && (
        <PurchaseOrderViewModal
          isOpen={!!viewingPurchaseOrder}
          onClose={handleCloseViewModal}
          purchaseOrder={viewingPurchaseOrder}
          onEdit={handleOpenModal}
        />
      )}
    </div>
  );
}
