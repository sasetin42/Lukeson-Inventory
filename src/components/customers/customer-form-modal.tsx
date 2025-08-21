
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Customer } from '@/lib/types';
import CustomerForm from './customer-form';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSave: (customerData: Omit<Customer, 'id'> & {id?: string}) => void;
}

export default function CustomerFormModal({ 
    isOpen, 
    onClose, 
    customer, 
    onSave,
}: CustomerFormModalProps) {

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
            <DialogDescription>
                {customer ? 'Update the details of this customer.' : 'Fill in the details below to add a new customer.'}
            </DialogDescription>
            </DialogHeader>
            <CustomerForm customer={customer} onSuccess={onSave} onCancel={onClose}/>
        </DialogContent>
        </Dialog>
    );
}
