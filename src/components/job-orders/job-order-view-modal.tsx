
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { JobOrder, Quotation, SalesOrder } from '@/lib/types';
import { Button } from '../ui/button';
import JobOrderView from './job-order-view';
import { Printer, Edit, FileText } from 'lucide-react';
import { useRef } from 'react';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/navigation';

interface JobOrderViewModalProps {
  jobOrder: JobOrder | null;
  salesOrder?: SalesOrder;
  quotation?: Quotation;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (jobOrder: JobOrder) => void;
}

export default function JobOrderViewModal({
  jobOrder,
  salesOrder,
  quotation,
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
        const printWindow = window.open('', '_blank', 'height=800,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Job Order</title>');
            
            const headElements = document.querySelectorAll('head > link[rel="stylesheet"], head > style');
            headElements.forEach(el => {
                printWindow.document.head.appendChild(el.cloneNode(true));
            });

            const printStyles = printWindow.document.createElement('style');
            printStyles.innerHTML = `
                @media print {
                    body {
                        -webkit-print-color-adjust: exact; /* Chrome, Safari */
                        color-adjust: exact; /* Firefox */
                    }
                    .print-container {
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }
                }
            `;
            printWindow.document.head.appendChild(printStyles);

            printWindow.document.write('</head><body><div class="print-container">');
            printWindow.document.write(printContent.innerHTML);
            printWindow.document.write('</div></body></html>');
            printWindow.document.close();

            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 500);
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
          <div ref={printableRef}>
            <JobOrderView jobOrder={jobOrder} salesOrder={salesOrder} quotation={quotation} />
          </div>
        </div>
        <DialogFooter className="justify-between">
            <div>
                 <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="bg-[#FF9D00] text-white hover:bg-[#FF9D00]/90"
                 >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </Button>
            </div>
            <div className='flex gap-2'>
                <Button
                    variant="outline"
                    onClick={handleEdit}
                    className="bg-[#2C2C2C] text-white hover:bg-[#2C2C2C]/90"
                >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Button>
                <Button
                    onClick={onClose}
                    className="bg-[#588B00] text-white hover:bg-[#588B00]/90"
                >
                    Close
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
