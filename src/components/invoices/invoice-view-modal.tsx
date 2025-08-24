
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Invoice } from '@/lib/types';
import { Button } from '../ui/button';
import InvoiceView from './invoice-view';
import { Printer } from 'lucide-react';
import { useRef } from 'react';
import { Badge } from '../ui/badge';

interface InvoiceViewModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceViewModal({
  invoice,
  isOpen,
  onClose,
}: InvoiceViewModalProps) {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const handlePrint = () => {
    const printContent = printableRef.current;
    if (printContent) {
        const printWindow = window.open('', '_blank', 'height=800,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Invoice</title>');
            
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

  const getStatusVariant = (status: string): "success" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Paid':
            return 'success';
        case 'Pending':
        case 'Posted':
            return 'secondary';
        case 'Overdue':
            return 'destructive';
        default:
            return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
            <div className="flex items-center justify-between">
                <DialogTitle>Invoice Details: <span className="font-semibold text-primary">{invoice.id}</span></DialogTitle>
                <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
            </div>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1">
          <div ref={printableRef}>
            <InvoiceView invoice={invoice} />
          </div>
        </div>
        <DialogFooter className="justify-end">
            <div className='flex gap-2'>
                <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="bg-[#FF9D00] text-white hover:bg-[#FF9D00]/90"
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
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
