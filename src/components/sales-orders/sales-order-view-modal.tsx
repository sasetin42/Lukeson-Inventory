
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { SalesOrder } from '@/lib/types';
import { Button } from '../ui/button';
import SalesOrderView from './sales-order-view';
import { Printer } from 'lucide-react';
import { useRef } from 'react';

interface SalesOrderViewModalProps {
  salesOrder: SalesOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SalesOrderViewModal({
  salesOrder,
  isOpen,
  onClose,
}: SalesOrderViewModalProps) {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!salesOrder) return null;

  const handlePrint = () => {
    const printContent = printableRef.current;
    if (printContent) {
        const printWindow = window.open('', '_blank', 'height=800,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Sales Order</title>');
            
            // Copy all style and link tags from the main document
            const headElements = document.querySelectorAll('head > link[rel="stylesheet"], head > style');
            headElements.forEach(el => {
                printWindow.document.head.appendChild(el.cloneNode(true));
            });

            // Add a print-specific style to ensure content fits
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

            // Use a small timeout to ensure all assets are loaded before printing
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 500);
        }
    }
};


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
        <DialogFooter>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
