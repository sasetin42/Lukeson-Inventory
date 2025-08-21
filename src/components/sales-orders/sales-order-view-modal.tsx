
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
  if (!salesOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
            <DialogTitle>Sales Order</DialogTitle>
            <DialogDescription>
                Viewing sales order <span className="font-semibold text-primary">{salesOrder.id}</span>
            </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1">
          <SalesOrderView salesOrder={salesOrder} />
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
