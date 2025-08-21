
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PurchaseOrder } from '@/lib/types';
import PurchaseOrderForm from './purchase-order-form';

interface PurchaseOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder | null;
  onSave: (purchaseOrderData: Omit<PurchaseOrder, 'id'> & {id?: string}) => void;
}

export default function PurchaseOrderFormModal({ 
    isOpen, 
    onClose, 
    purchaseOrder, 
    onSave,
}: PurchaseOrderFormModalProps) {

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>{purchaseOrder ? 'Edit Purchase Order' : 'Add New Purchase Order'}</DialogTitle>
            <DialogDescription>
                {purchaseOrder ? 'Update the details of this purchase order.' : 'Fill in the details below to add a new purchase order.'}
            </DialogDescription>
            </DialogHeader>
            <PurchaseOrderForm purchaseOrder={purchaseOrder} onSuccess={onSave} onCancel={onClose}/>
        </DialogContent>
        </Dialog>
    );
}
