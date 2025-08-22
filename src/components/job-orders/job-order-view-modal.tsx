
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { JobOrder } from '@/lib/types';
import { Button } from '../ui/button';
import JobOrderView from './job-order-view';
import { Printer } from 'lucide-react';
import { useRef } from 'react';

interface JobOrderViewModalProps {
  jobOrder: JobOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function JobOrderViewModal({
  jobOrder,
  isOpen,
  onClose,
}: JobOrderViewModalProps) {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!jobOrder) return null;

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
            <DialogTitle>Job Order</DialogTitle>
            <DialogDescription>
                Viewing job order <span className="font-semibold text-primary">{jobOrder.id}</span>
            </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1">
          <div ref={printableRef}>
            <JobOrderView jobOrder={jobOrder} />
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
