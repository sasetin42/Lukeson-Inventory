
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ShoppingCart, PlusCircle, CheckCircle, Clock, XCircle, DollarSign } from "lucide-react";
import PurchaseOrderList from "@/components/purchase-orders/purchase-order-list";
import { PurchaseOrder } from '@/lib/types';
import PurchaseOrderFormModal from '@/components/purchase-orders/purchase-order-form-modal';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const { toast } = useToast();

  const fetchPurchaseOrders = async () => {
    try {
      const poRef = collection(db, 'purchaseOrders');
      const snapshot = await getDocs(poRef);
      const loadedPOs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PurchaseOrder));
      setPurchaseOrders(loadedPOs);
    } catch (error) {
      console.error("Error fetching purchase orders: ", error);
      toast({
        title: "Error",
        description: "Failed to load purchase orders. Please check your connection and permissions.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const handleOpenModal = (purchaseOrder: PurchaseOrder | null) => {
    setEditingPurchaseOrder(purchaseOrder);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPurchaseOrder(null);
  }

  const handleSavePurchaseOrder = async (purchaseOrderData: Omit<PurchaseOrder, 'id'> & { id?: string }) => {
      try {
          if (purchaseOrderData.id) {
              const { id, ...dataToSave } = purchaseOrderData;
              const poRef = doc(db, "purchaseOrders", id);
              await setDoc(poRef, { ...dataToSave, modifiedAt: serverTimestamp() }, { merge: true });
              toast({ title: "Success", description: "Purchase Order updated successfully.", variant: "success" });
          } else {
              const { id, ...dataToSave } = purchaseOrderData;
              await addDoc(collection(db, "purchaseOrders"), { ...dataToSave, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
              toast({ title: "Success", description: "Purchase Order added successfully.", variant: "success" });
          }
          handleCloseModal();
          fetchPurchaseOrders();
      } catch (error) {
          console.error("Error saving purchase order: ", error);
          toast({ title: "Error", description: "Failed to save purchase order.", variant: "destructive" });
      }
  };


  const handleDeletePurchaseOrder = async (purchaseOrderId: string) => {
    await deleteDoc(doc(db, "purchaseOrders", purchaseOrderId));
    toast({ title: "Success", description: "Purchase Order deleted successfully.", variant: "success" });
    fetchPurchaseOrders();
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
        icon={<ShoppingCart className="h-6 w-6 text-orange-500" />}
        actions={
          <Button onClick={() => handleOpenModal(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Purchase Order
          </Button>
        }
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
      <PurchaseOrderList
        purchaseOrders={purchaseOrders}
        onEdit={handleOpenModal}
        onDelete={handleDeletePurchaseOrder}
      />
      {isModalOpen && (
        <PurchaseOrderFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSavePurchaseOrder}
          purchaseOrder={editingPurchaseOrder}
        />
      )}
    </div>
  );
}
