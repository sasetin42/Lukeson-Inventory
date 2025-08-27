
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SalesOrder, JobOrder } from '@/lib/types';
import SalesOrderForm from './sales-order-form';
import { useState } from "react";

interface SalesOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesOrder: SalesOrder | null;
  onSave: (salesOrderData: Omit<SalesOrder, 'id'> & {id?: string}) => void;
  jobOrders: JobOrder[];
}

export default function SalesOrderFormModal({ 
    isOpen, 
    onClose, 
    salesOrder, 
    onSave,
    jobOrders,
}: SalesOrderFormModalProps) {
    const [salesOrderId, setSalesOrderId] = useState<string | null>(null);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>{salesOrder ? 'Edit Sales Order' : 'Add New Sales Order'} {salesOrderId && <span className="text-primary font-mono">{salesOrderId}</span>}</DialogTitle>
            <DialogDescription>
                {salesOrder ? 'Update the details of this sales order.' : 'Fill in the details below to add a new sales order.'}
            </DialogDescription>
            </DialogHeader>
            <SalesOrderForm 
                salesOrder={salesOrder} 
                onSuccess={onSave} 
                onCancel={onClose}
                onIdGenerated={setSalesOrderId}
                jobOrders={jobOrders}
            />
        </DialogContent>
        </Dialog>
    );
}

    
