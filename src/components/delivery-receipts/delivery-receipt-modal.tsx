'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { SalesOrder, Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Truck, Calendar, User, Printer, ChevronRight, PackageCheck, Search, ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import DeliveryReceiptView from './delivery-receipt-view';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface DeliveryReceiptModalProps {
  salesOrders: SalesOrder[];
  isOpen: boolean;
  onClose: () => void;
}

export default function DeliveryReceiptModal({
  salesOrders,
  isOpen,
  onClose,
}: DeliveryReceiptModalProps) {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const printableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const productsRef = collection(db, 'products');
    const unsub = onSnapshot(productsRef, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });
    return () => unsub();
  }, []);

  const handlePrint = () => {
    const printContent = printableRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Delivery Receipt</title>');

        const headElements = document.querySelectorAll('head > link[rel="stylesheet"], head > style');
        headElements.forEach((el) => {
          printWindow.document.head.appendChild(el.cloneNode(true));
        });

        const printStyles = printWindow.document.createElement('style');
        printStyles.innerHTML = `
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              margin: 0;
              padding: 16px;
            }
            .print-container {
              width: 100%;
              margin: 0;
              padding: 0;
            }
          }
        `;
        printWindow.document.head.appendChild(printStyles);

        printWindow.document.write('</head><body><div class="print-container">');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();

        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  const filteredOrders = salesOrders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const idMatch = order.id?.toLowerCase().includes(q);
    const customerMatch = order.customerName?.toLowerCase().includes(q);
    const drMatch = order.id?.replace(/^SO-/, 'DR-').toLowerCase().includes(q);
    return idMatch || customerMatch || drMatch;
  });

  const handleModalClose = () => {
    setSelectedOrder(null);
    setSearchQuery('');
    onClose();
  };

  const handleGoToSalesOrder = (so: SalesOrder) => {
    router.push(`/sales-orders?search=${encodeURIComponent(so.id)}`);
    handleModalClose();
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return format(date.toDate ? date.toDate() : new Date(date), 'PP');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className={selectedOrder ? "sm:max-w-4xl" : "sm:max-w-3xl"}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/60 rounded-md">
              <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {selectedOrder
                  ? `Delivery Receipt: ${selectedOrder.id?.replace(/^SO-/, 'DR-') || selectedOrder.id}`
                  : `Delivery Receipts (${salesOrders.length})`}
              </DialogTitle>
              <DialogDescription>
                {selectedOrder
                  ? `Review and print the official delivery receipt for ${selectedOrder.customerName || selectedOrder.id}.`
                  : 'Manage and print delivery receipts for active and fulfilled sales orders.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {selectedOrder ? (
          /* Detailed Delivery Receipt View */
          <div>
            <div className="flex justify-between items-center mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="text-xs"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to List
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handlePrint}
                  className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
                >
                  <Printer className="h-4 w-4 mr-1.5" />
                  Print Delivery Receipt
                </Button>
              </div>
            </div>

            <ScrollArea className="max-h-[60vh] border rounded-lg p-3 bg-neutral-50/50">
              <div ref={printableRef}>
                <DeliveryReceiptView salesOrder={selectedOrder} products={products} />
              </div>
            </ScrollArea>
          </div>
        ) : (
          /* List of Delivery Receipts */
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by DR / SO number or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm"
              />
            </div>

            <ScrollArea className="max-h-[55vh]">
              <div className="space-y-2.5 p-0.5">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((so) => {
                    const drId = so.id ? so.id.replace(/^SO-/, 'DR-') : 'DR-PENDING';
                    const itemsCount = so.lines?.reduce((acc, l) => acc + (Number(l.quantity) || 0), 0) || 0;
                    return (
                      <div
                        key={so.id}
                        className="p-3.5 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-blue-500 shrink-0" />
                            <div>
                              <span className="font-bold text-blue-700 block text-xs">{drId}</span>
                              <span className="text-[11px] text-muted-foreground">SO: {so.id}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-medium text-xs truncate max-w-[140px]">{so.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-xs">{formatDate(so.deliveryDate || so.orderDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <PackageCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-xs font-semibold">{itemsCount} Items</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => setSelectedOrder(so)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                          >
                            <Printer className="h-3.5 w-3.5 mr-1" />
                            View / Print DR
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    {salesOrders.length === 0
                      ? 'No active orders requiring delivery receipts.'
                      : 'No delivery receipts match your search.'}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter className="flex justify-between items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {salesOrders.length} order{salesOrders.length === 1 ? '' : 's'} available for delivery
          </p>
          <Button variant="outline" onClick={handleModalClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
