
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Invoice } from '@/lib/types';
import InvoiceForm from './invoice-form';
import { useState } from "react";

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSave: (invoiceData: Omit<Invoice, 'id'> & {id?: string}) => void;
}

export default function InvoiceFormModal({ 
    isOpen, 
    onClose, 
    invoice, 
    onSave,
}: InvoiceFormModalProps) {
    const [invoiceId, setInvoiceId] = useState<string | null>(null);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>{invoice ? 'Edit Invoice' : 'Create New Invoice'} {invoiceId && <span className="text-primary font-mono">{invoiceId}</span>}</DialogTitle>
            <DialogDescription>
                {invoice ? 'Update the details of this invoice.' : 'Select a customer and sales order to generate an invoice.'}
            </DialogDescription>
            </DialogHeader>
            <InvoiceForm 
                invoice={invoice} 
                onSuccess={onSave} 
                onCancel={onClose}
                onIdGenerated={setInvoiceId}
            />
        </DialogContent>
        </Dialog>
    );
}
