
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SalesOrder } from '@/lib/types';
import SalesOrderForm from './sales-order-form';

interface SalesOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesOrder: SalesOrder | null;
  onSave: (salesOrderData: Omit<SalesOrder, 'id'> & {id?: string}) => void;
}

export default function SalesOrderFormModal({ 
    isOpen, 
    onClose, 
    salesOrder, 
    onSave,
}: SalesOrderFormModalProps) {

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>{salesOrder ? 'Edit Sales Order' : 'Add New Sales Order'}</DialogTitle>
            <DialogDescription>
                {salesOrder ? 'Update the details of this sales order.' : 'Fill in the details below to add a new sales order.'}
            </DialogDescription>
            </DialogHeader>
            <SalesOrderForm salesOrder={salesOrder} onSuccess={onSave} onCancel={onClose}/>
        </DialogContent>
        </Dialog>
    );
}
