

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PurchaseOrder } from '@/lib/types';
import { Button } from '../ui/button';
import PurchaseOrderView from './purchase-order-view';
import { Printer, Mail } from 'lucide-react';
import { useRef } from 'react';

interface PurchaseOrderViewModalProps {
  purchaseOrder: PurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PurchaseOrderViewModal({
  purchaseOrder,
  isOpen,
  onClose,
}: PurchaseOrderViewModalProps) {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!purchaseOrder) return null;

  const handlePrint = () => {
    const printContent = printableRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      printWindow?.document.write('<html><head><title>Print Purchase Order</title>');
      // You may need to link your stylesheet here for proper printing
      printWindow?.document.write('<link rel="stylesheet" href="/globals.css" type="text/css" />');
      printWindow?.document.write('</head><body>');
      printWindow?.document.write(printContent.innerHTML);
      printWindow?.document.write('</body></html>');
      printWindow?.document.close();
      printWindow?.focus();
      printWindow?.print();
    }
  };

  const handleEmail = () => {
    if (purchaseOrder.supplierEmail) {
        const subject = `Purchase Order from [Your Company Name]: ${purchaseOrder.id}`;
        const body = `Dear ${purchaseOrder.supplierName},\n\nPlease find our purchase order attached.\n\nThank you,\n[Your Name]`;
        window.location.href = `mailto:${purchaseOrder.supplierEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
            <DialogTitle>Purchase Order</DialogTitle>
            <DialogDescription>
                Viewing purchase order <span className="font-semibold text-primary">{purchaseOrder.id}</span>
            </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1">
          <div ref={printableRef}>
            <PurchaseOrderView purchaseOrder={purchaseOrder} />
          </div>
        </div>
        <DialogFooter className="justify-between">
            <div>
                 <Button variant="outline" onClick={handleEmail} disabled={!purchaseOrder.supplierEmail}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send to Supplier
                </Button>
            </div>
            <div className='flex gap-2'>
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
