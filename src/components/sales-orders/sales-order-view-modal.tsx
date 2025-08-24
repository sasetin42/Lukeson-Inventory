
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { SalesOrder, JobOrder } from '@/lib/types';
import { Button } from '../ui/button';
import SalesOrderView from './sales-order-view';
import { Printer, PlusCircle } from 'lucide-react';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface SalesOrderViewModalProps {
  salesOrder: SalesOrder | null;
  jobOrders: JobOrder[];
  isOpen: boolean;
  onClose: () => void;
}

export default function SalesOrderViewModal({
  salesOrder,
  jobOrders,
  isOpen,
  onClose,
}: SalesOrderViewModalProps) {
  const printableRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  if (!salesOrder) return null;

  const handlePrint = () => {
    const printContent = printableRef.current;
    if (printContent) {
        const printWindow = window.open('', '_blank', 'height=800,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Sales Order</title>');
            
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
  };
  
  const hasJobOrder = jobOrders.some(jo => jo.salesOrderId === salesOrder.id);
  const isButtonDisabled = salesOrder.status !== 'Confirmed' || hasJobOrder;
  
  let tooltipMessage = '';
  if (salesOrder.status !== 'Confirmed') {
    tooltipMessage = 'Job Order can only be created from a "Confirmed" Sales Order.';
  } else if (hasJobOrder) {
    tooltipMessage = 'A Job Order for this Sales Order already exists.';
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
            <DialogTitle>Sales Order: <span className="font-semibold text-primary">{salesOrder.id}</span></DialogTitle>
            <DialogDescription>
                Review the details of the sales order below.
            </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1">
          <div ref={printableRef}>
            <SalesOrderView salesOrder={salesOrder} />
          </div>
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
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
