
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
import { Printer, Edit, FileText } from 'lucide-react';
import { useRef } from 'react';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/navigation';

interface JobOrderViewModalProps {
  jobOrder: JobOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (jobOrder: JobOrder) => void;
}

export default function JobOrderViewModal({
  jobOrder,
  isOpen,
  onClose,
  onEdit,
}: JobOrderViewModalProps) {
  const printableRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  if (!jobOrder) return null;
  
  const getStatusVariant = (status: JobOrder['status']): "success" | "secondary" | "destructive" | "outline" | "inProgress" => {
    switch (status) {
        case 'Completed': return 'success';
        case 'In Progress': return 'inProgress';
        case 'Scheduled':
            return 'secondary';
        case 'Draft': 
        case 'On Hold': 
            return 'outline';
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
  };


  const handlePrint = () => {
    const printContent = printableRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Job Order</title>');
        const styles = Array.from(document.styleSheets)
          .map(styleSheet => {
            try {
              return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
            } catch (e) {
              console.warn('Could not read stylesheet rules', e);
              return '';
            }
          }).join('\n');
        printWindow.document.write(`<style>${styles}</style>`);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        // Use a small timeout to ensure content is loaded before printing
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
      }
    }
  };

  const handleEdit = () => {
    onClose();
    onEdit(jobOrder);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
               <div className="p-2 bg-orange-100 rounded-md">
                <FileText className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <DialogTitle>Job Order Details</DialogTitle>
                <DialogDescription>
                    Viewing job order <span className="font-semibold text-primary">{jobOrder.id}</span>
                </DialogDescription>
              </div>
            </div>
             <Badge variant={getStatusVariant(jobOrder.status)} className="capitalize h-fit">{jobOrder.status}</Badge>
          </div>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1">
          <JobOrderView jobOrder={jobOrder} />
        </div>
        <DialogFooter className="justify-between">
            <div>
                 <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </Button>
            </div>
            <div className='flex gap-2'>
                <Button variant="outline" onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Button>
                <Button onClick={onClose}>Close</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
