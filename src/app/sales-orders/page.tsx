
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ShoppingCart, PlusCircle, CheckCircle, Clock, XCircle, DollarSign } from "lucide-react";
import SalesOrderList from "@/components/sales-orders/sales-order-list";
import { SalesOrder, Customer, Quotation } from '@/lib/types';
import SalesOrderFormModal from "@/components/sales-orders/sales-order-form-modal";
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, serverTimestamp, query, where, getDoc } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesOrderTemplate from '@/components/sales-orders/sales-order-template';
import SalesOrderViewModal from '@/components/sales-orders/sales-order-view-modal';

function SalesOrdersContent() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingSalesOrder, setEditingSalesOrder] = useState<SalesOrder | null>(null);
  const [viewingSalesOrder, setViewingSalesOrder] = useState<SalesOrder | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const customerIdFilter = searchParams.get('customerId');
  const fromQuotation = searchParams.get('fromQuotation');
  const [customerName, setCustomerName] = useState<string | null>(null);

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
        toast({ title: "Error", description: "Could not create sales order from quotation.", variant: "destructive" });
      }
    }
  }, [fromQuotation, toast]);

  const fetchSalesOrders = async () => {
    try {
      const salesOrdersRef = collection(db, 'salesOrders');
      let q = query(salesOrdersRef);
      if (customerIdFilter) {
        q = query(salesOrdersRef, where("customerId", "==", customerIdFilter));
        const customerRef = doc(db, 'customers', customerIdFilter);
        const customerSnap = await getDoc(customerRef);
        if (customerSnap.exists()) {
          setCustomerName(customerSnap.data().name);
        }
      }
      
      const snapshot = await getDocs(q);
      const loadedSalesOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOrder));
      setSalesOrders(loadedSalesOrders);
    } catch (error) {
      console.error("Error fetching sales orders: ", error);
      toast({
        title: "Error",
        description: "Failed to load sales orders. Please check your connection and permissions.",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    fetchSalesOrders();
  }, [customerIdFilter]);

  const handleOpenModal = (salesOrder: SalesOrder | null) => {
    setEditingSalesOrder(salesOrder);
    setIsModalOpen(true);
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

  const handleSaveSalesOrder = async (salesOrderData: Omit<SalesOrder, 'id'> & { id?: string }) => {
      try {
          if (salesOrderData.id) {
              const { id, ...dataToSave } = salesOrderData;
              const soRef = doc(db, "salesOrders", id);
              await setDoc(soRef, { ...dataToSave, modifiedAt: serverTimestamp() }, { merge: true });
              toast({ title: "Success", description: "Sales Order updated successfully.", variant: "success" });
          } else {
              const { id, ...dataToSave } = salesOrderData;
              await addDoc(collection(db, "salesOrders"), { ...dataToSave, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
              toast({ title: "Success", description: "Sales Order added successfully.", variant: "success" });
          }
          handleCloseModal();
          fetchSalesOrders();
      } catch (error) {
          console.error("Error saving sales order: ", error);
          toast({ title: "Error", description: "Failed to save sales order.", variant: "destructive" });
      }
  };


  const handleDeleteSalesOrder = async (salesOrderId: string) => {
    await deleteDoc(doc(db, "salesOrders", salesOrderId));
    toast({ title: "Success", description: "Sales Order deleted successfully.", variant: "success" });
    fetchSalesOrders();
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
                salesOrders={salesOrders}
                onEdit={handleOpenModal}
                onDelete={handleDeleteSalesOrder}
                onView={handleOpenViewModal}
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
        />
      )}
      
      {isViewModalOpen && (
        <SalesOrderViewModal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          salesOrder={viewingSalesOrder}
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
