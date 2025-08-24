
'use client';
import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { RocketIcon } from "@/components/icons/rocket";
import TopSellingItems from "@/components/dashboard/top-selling-items";
import SlowMovingItems from "@/components/dashboard/slow-moving-items";
import InventoryOverview from "@/components/dashboard/inventory-overview";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import QuickStats from "@/components/dashboard/quick-stats";
import LowStockAlerts from "@/components/dashboard/low-stock-alerts";
import { Product, SalesOrder, ItemCategory, PurchaseOrder, Quotation, JobOrder, Invoice, RecentTransaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, serverTimestamp, orderBy, query, limit } from 'firebase/firestore';
import PurchaseOrderFormModal from '@/components/purchase-orders/purchase-order-form-modal';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SalesOrder[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productsRef = collection(db, 'products');
        const salesRef = collection(db, 'salesOrders');
        const quotationsRef = collection(db, 'quotations');
        const jobOrdersRef = collection(db, 'jobOrders');
        const invoicesRef = collection(db, 'invoices');

        const recentSalesQuery = query(salesRef, orderBy("orderDate", "desc"), limit(10));

        const [productsSnapshot, salesSnapshot, quotationsSnapshot, jobOrdersSnapshot, invoicesSnapshot] = await Promise.all([
            getDocs(productsRef),
            getDocs(recentSalesQuery),
            getDocs(quotationsRef),
            getDocs(jobOrdersRef),
            getDocs(invoicesRef),
        ]);

        const loadedProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(loadedProducts);

        const loadedSales = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOrder));
        setSales(loadedSales);

        const loadedQuotations = quotationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quotation));
        const loadedJobOrders = jobOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobOrder));
        const loadedInvoices = invoicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
        
        const enrichedTransactions = loadedSales.map(sale => {
            const quotation = sale.quotationId ? loadedQuotations.find(q => q.id === sale.quotationId) : undefined;
            const jobOrder = loadedJobOrders.find(j => j.salesOrderId === sale.id);
            const invoice = loadedInvoices.find(i => i.salesOrderId === sale.id);

            return {
                salesOrder: sale,
                quotation: quotation,
                jobOrder: jobOrder,
                invoice: invoice
            };
        });

        setRecentTransactions(enrichedTransactions);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please check permissions.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  // Transform sales orders to a flat list of sales for compatibility with existing components
  const flatSales = sales.flatMap(order => 
    order.lines.map(line => ({
        id: `${order.id}-${line.id}`,
        productId: line.itemId,
        productName: line.description,
        customerName: order.customerName || 'Unknown',
        date: order.orderDate,
        quantity: line.quantity,
        total: line.total,
    }))
  );

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
          const { id, ...dataToSave } = purchaseOrderData;
          const poRef = doc(db, "purchaseOrders", id as string);
          await setDoc(poRef, { ...dataToSave, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
          toast({ title: "Success", description: "Purchase Order added successfully.", variant: "success" });
          handleCloseModal();
      } catch (error) {
          console.error("Error saving purchase order: ", error);
          toast({ title: "Error", description: "Failed to save purchase order.", variant: "destructive" });
      }
  };

  const handleCreatePO = (product: Product) => {
    const newPO: Partial<PurchaseOrder> = {
        supplierId: '', 
        supplierName: product.supplier.name,
        status: 'Draft',
        lines: [{
            id: `line-${Date.now()}`,
            itemId: product.id,
            description: product.name,
            quantity: product.reOrderLevel,
            uom: product.uom,
            unitPrice: product.price,
            taxRate: 0.12,
            total: product.reOrderLevel * product.price * 1.12,
            vatType: 'VATable',
        }]
    };
    handleOpenModal(newPO as PurchaseOrder);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Dashboard"
        description="A real-time overview of your business operations."
        icon={<RocketIcon className="h-6 w-6 text-blue-500" />}
      />
      
      {/* KPI Cards Section */}
      <InventoryOverview products={products} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickStats />
        <LowStockAlerts products={products} onCreatePO={handleCreatePO} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopSellingItems products={products} sales={flatSales} />
          <SlowMovingItems products={products} sales={flatSales} />
      </div>

      <RecentTransactions transactions={recentTransactions} />

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
