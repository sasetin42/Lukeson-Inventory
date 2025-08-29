
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JobOrder } from '@/lib/types';
import JobOrderForm from './job-order-form';
import { useState } from "react";

interface JobOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobOrder: JobOrder | null;
  onSave: (jobOrderData: Omit<JobOrder, 'id'> & {id?: string}) => void;
}

export default function JobOrderFormModal({ 
    isOpen, 
    onClose, 
    jobOrder, 
    onSave,
}: JobOrderFormModalProps) {
    const [jobOrderId, setJobOrderId] = useState<string | null>(null);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>{jobOrder ? 'Edit Job Order' : 'Add New Job Order'} {jobOrderId && <span className="text-primary font-mono">{jobOrderId}</span>}</DialogTitle>
            <DialogDescription>
                {jobOrder ? 'Update the details of this job order.' : 'Fill in the details below to add a new job order.'}
            </DialogDescription>
            </DialogHeader>
            <JobOrderForm 
                jobOrder={jobOrder} 
                onSuccess={onSave} 
                onCancel={onClose}
                onIdGenerated={setJobOrderId}
            />
        </DialogContent>
        </Dialog>
    );
}
