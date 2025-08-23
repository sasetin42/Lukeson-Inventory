
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
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Sales Order</title>');
        const styles = Array.from(document.styleSheets)
          .map(styleSheet => {
            try {
              return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
            } catch (e) {
              console.warn('Could not read stylesheet rules', e);
              return '';
            }
          }).join('\n');
        printWindow.document.write(`<style>${styles}</style>`);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        // Use a small timeout to ensure content is loaded before printing
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
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
