
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
import { Printer } from 'lucide-react';
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
      const originalContents = document.body.innerHTML;
      const printContents = printContent.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

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
