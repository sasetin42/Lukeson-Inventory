
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { SalesOrder, JobOrder, Quotation, Product } from '@/lib/types';
import { Button } from '../ui/button';
import SalesOrderView from './sales-order-view';
import { Printer, PlusCircle, Edit, Truck } from 'lucide-react';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useAuth } from '@/context/auth-context';
import DeliveryReceiptView from '../delivery-receipts/delivery-receipt-view';

interface SalesOrderViewModalProps {
  salesOrder: SalesOrder | null;
  quotations: Quotation[];
  jobOrders: JobOrder[];
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (salesOrder: SalesOrder) => void;
}

export default function SalesOrderViewModal({
  salesOrder,
  quotations,
  jobOrders,
  products,
  isOpen,
  onClose,
  onEdit,
}: SalesOrderViewModalProps) {
  const printableRef = useRef<HTMLDivElement>(null);
  const drPrintableRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'salesOrder' | 'deliveryReceipt'>('salesOrder');
  const router = useRouter();
  const { hasWriteAccess } = useAuth();
  const canWriteSales = hasWriteAccess('Sales Orders');
  const canWriteJobs = hasWriteAccess('Job Order');

  if (!salesOrder) return null;

  const handlePrint = () => {
    const printContent = viewMode === 'deliveryReceipt' ? drPrintableRef.current : printableRef.current;
    if (printContent) {
        const printWindow = window.open('', '_blank', 'height=800,width=800');
        if (printWindow) {
            printWindow.document.write(`<html><head><title>Print ${viewMode === 'deliveryReceipt' ? 'Delivery Receipt' : 'Sales Order'}</title>`);
            
            const headElements = document.querySelectorAll('head > link[rel="stylesheet"], head > style');
            headElements.forEach(el => {
                printWindow.document.head.appendChild(el.cloneNode(true));
            });

            const printStyles = printWindow.document.createElement('style');
            printStyles.innerHTML = `
                @media print {
                    body {
                        -webkit-print-color-adjust: exact; /* Chrome, Safari */
                        color-adjust: exact; /* Firefox */
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
  
  const handleCreateJobOrder = () => {
    const salesOrderData = encodeURIComponent(JSON.stringify(salesOrder));
    router.push(`/job-orders?fromSalesOrder=${salesOrderData}`);
    onClose();
  };

  const handleEditClick = () => {
    onClose();
    onEdit(salesOrder);
  };
  
  const hasJobOrder = jobOrders.some(jo => jo.salesOrderId === salesOrder.id);
  const isButtonDisabled = salesOrder.status !== 'Confirmed' || hasJobOrder || !canWriteJobs;
  
  let tooltipMessage = '';
  if (salesOrder.status !== 'Confirmed') {
    tooltipMessage = 'Job Order can only be created from a "Confirmed" Sales Order.';
  } else if (hasJobOrder) {
    tooltipMessage = 'A Job Order for this Sales Order already exists.';
  } else if (!canWriteJobs) {
    tooltipMessage = "You don't have permission to create Job Orders.";
  }

  const quotation = quotations.find(q => q.id === salesOrder?.quotationId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) setViewMode('salesOrder'); onClose(); }}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <DialogTitle>
                  {viewMode === 'deliveryReceipt' ? 'Delivery Receipt: ' : 'Sales Order: '}
                  <span className="font-semibold text-primary">
                    {viewMode === 'deliveryReceipt' ? salesOrder.id.replace(/^SO-/, 'DR-') : salesOrder.id}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {viewMode === 'deliveryReceipt' ? 'Official delivery receipt document ready for dispatch and signing.' : 'Review the details of the sales order below.'}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-md border text-xs">
                <Button
                  size="sm"
                  variant={viewMode === 'salesOrder' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('salesOrder')}
                  className="h-7 text-xs px-2.5"
                >
                  Sales Order
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'deliveryReceipt' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('deliveryReceipt')}
                  className="h-7 text-xs px-2.5 bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Truck className="h-3.5 w-3.5 mr-1" />
                  Delivery Receipt
                </Button>
              </div>
            </div>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1">
          {viewMode === 'salesOrder' ? (
            <div ref={printableRef}>
              <SalesOrderView salesOrder={salesOrder} quotation={quotation} products={products} />
            </div>
          ) : (
            <div ref={drPrintableRef}>
              <DeliveryReceiptView salesOrder={salesOrder} products={products} />
            </div>
          )}
        </div>
        <DialogFooter className="justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div tabIndex={isButtonDisabled ? 0 : -1}>
                  <Button 
                    onClick={handleCreateJobOrder} 
                    disabled={isButtonDisabled}
                    className="bg-[#F97316] text-white hover:bg-[#F97316]/90"
                    style={isButtonDisabled ? { pointerEvents: 'none' } : {}}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Job Order
                  </Button>
                </div>
              </TooltipTrigger>
              {isButtonDisabled && (
                <TooltipContent>
                  <p>{tooltipMessage}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleEditClick}
              className="bg-[#2C2C2C] text-white hover:bg-[#151515] hover:text-white"
               disabled={!canWriteSales}
            >
                <Edit className="mr-2 h-4 w-4" />
                Edit
            </Button>
            <Button 
                variant="outline" 
                onClick={handlePrint}
                className="bg-[#FF9D00] text-white hover:bg-[#FF9D00]/90"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print {viewMode === 'deliveryReceipt' ? 'DR' : 'SO'}
            </Button>
            <Button 
                onClick={() => { setViewMode('salesOrder'); onClose(); }}
                className="bg-[#588B00] text-white hover:bg-[#588B00]/90"
            >
                Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
