
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Quotation } from '@/lib/types';
import QuotationForm from './quotation-form';

interface QuotationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  onSave: (quotationData: Omit<Quotation, 'id'> & {id?: string}) => void;
}

export default function QuotationFormModal({ 
    isOpen, 
    onClose, 
    quotation, 
    onSave,
}: QuotationFormModalProps) {

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>{quotation ? 'Edit Quotation' : 'Add New Quotation'}</DialogTitle>
            <DialogDescription>
                {quotation ? 'Update the details of this quotation.' : 'Fill in the details below to add a new quotation.'}
            </DialogDescription>
            </DialogHeader>
            <QuotationForm quotation={quotation} onSuccess={onSave} onCancel={onClose}/>
        </DialogContent>
        </Dialog>
    );
}
