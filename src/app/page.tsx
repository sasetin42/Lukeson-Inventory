
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
import { Product, SalesOrder, ItemCategory, PurchaseOrder, Quotation, JobOrder, Invoice, RecentTransaction, Customer, FlatSale } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, addDoc, serverTimestamp, orderBy, query, limit, getDocs } from 'firebase/firestore';
import PurchaseOrderFormModal from '@/components/purchase-orders/purchase-order-form-modal';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<SalesOrder[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    setLoading(true);
    const productsRef = collection(db, 'products');
    const salesRef = collection(db, 'salesOrders');
    const quotationsRef = collection(db, 'quotations');
    const jobOrdersRef = collection(db, 'jobOrders');
    const invoicesRef = collection(db, 'invoices');
    const customersRef = collection(db, 'customers');
    
    const recentSalesQuery = query(salesRef, orderBy("orderDate", "desc"), limit(10));

    const unsubscribes = [
      onSnapshot(productsRef, (snapshot) => setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))), (err) => { console.error(err); toast({ title: "Error", description: "Failed to load products.", variant: "destructive" });}),
      onSnapshot(customersRef, (snapshot) => setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer))), (err) => { console.error(err); toast({ title: "Error", description: "Failed to load customers.", variant: "destructive" });}),
      onSnapshot(salesRef, (snapshot) => setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOrder))), (err) => { console.error(err); toast({ title: "Error", description: "Failed to load sales.", variant: "destructive" });}),
      onSnapshot(quotationsRef, (quotationsSnapshot) => {
        setQuotations(quotationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quotation)))
      }, (err) => { console.error(err); toast({ title: "Error", description: "Failed to load quotations.", variant: "destructive" });}),
      onSnapshot(jobOrdersRef, (jobOrdersSnapshot) => {
        setJobOrders(jobOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobOrder)))
      }, (err) => { console.error(err); toast({ title: "Error", description: "Failed to load job orders.", variant: "destructive" });}),
      onSnapshot(invoicesRef, (invoicesSnapshot) => {
        setInvoices(invoicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice)))
      }, (err) => { console.error(err); toast({ title: "Error", description: "Failed to load invoices.", variant: "destructive" });}),
      onSnapshot(recentSalesQuery, (salesSnapshot) => {
        const loadedSales = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOrder));
        // We need all quotations, jobOrders, and invoices to link, so we fetch them above and use the state here.
        // This onSnapshot is now just for getting the *most recent* sales.
        setLoading(false);
      }, (err) => { console.error(err); toast({ title: "Error", description: "Failed to load recent sales.", variant: "destructive" }); setLoading(false);})
    ];

    return () => unsubscribes.forEach(unsub => unsub());

  }, [toast]);

  useEffect(() => {
    // This effect runs when sales, quotations, jobOrders, or invoices change,
    // and rebuilds the recentTransactions list.
    const recentSales = sales.sort((a, b) => ((b.orderDate as any).toDate() || new Date(b.orderDate as string)).getTime() - ((a.orderDate as any).toDate() || new Date(a.orderDate as string)).getTime()).slice(0, 10);
    
    const enrichedTransactions = recentSales.map(sale => {
        const quotation = sale.quotationId ? quotations.find(q => q.id === sale.quotationId) : undefined;
        const jobOrder = jobOrders.find(j => j.salesOrderId === sale.id);
        const invoice = invoices.find(i => i.salesOrderId === sale.id);
        return { salesOrder: sale, quotation, jobOrder, invoice };
    });
    setRecentTransactions(enrichedTransactions);

  }, [sales, quotations, jobOrders, invoices])

  // Transform sales orders to a flat list of sales for compatibility with existing components
  const flatSales: FlatSale[] = sales.flatMap(order => 
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
          let docId = id;
          if (!docId) {
            const poRef = collection(db, 'purchaseOrders');
            const snapshot = await getDocs(poRef);
            const poCount = snapshot.size;
            const year = new Date().getFullYear();
            docId = `PO-${year}-${(poCount + 1).toString().padStart(4, '0')}`;
          }

          const poRef = doc(db, "purchaseOrders", docId);
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
        <QuickStats 
          customers={customers}
          salesOrders={sales}
          invoices={invoices}
        />
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
