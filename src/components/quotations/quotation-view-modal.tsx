'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Quotation, Product, SalesOrder } from '@/lib/types';
import { Button } from '../ui/button';
import QuotationView from './quotation-view';
import { Printer, Edit, ShoppingCart } from 'lucide-react';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useAuth } from '@/context/auth-context';

interface QuotationViewModalProps {
  quotation: Quotation | null;
  products?: Product[];
  salesOrders?: SalesOrder[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (quotation: Quotation) => void;
}

export default function QuotationViewModal({
  quotation,
  products = [],
  salesOrders = [],
  isOpen,
  onClose,
  onEdit,
}: QuotationViewModalProps) {
  const printableRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { hasWriteAccess } = useAuth();
  const canWriteQuotations = hasWriteAccess('Quotations');
  const canWriteSales = hasWriteAccess('Sales Orders');

  if (!quotation) return null;

  const handlePrint = () => {
    const printContent = printableRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Quotation - ' + quotation.id + '</title>');

        const headElements = document.querySelectorAll('head > link[rel="stylesheet"], head > style');
        headElements.forEach((el) => {
          printWindow.document.head.appendChild(el.cloneNode(true));
        });

        const printStyles = printWindow.document.createElement('style');
        printStyles.innerHTML = `
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
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

  const handleCreateSalesOrder = () => {
    const quotationData = encodeURIComponent(JSON.stringify(quotation));
    router.push('/sales-orders?fromQuotation=' + quotationData);
    onClose();
  };

  const handleEditClick = () => {
    onClose();
    onEdit(quotation);
  };

  const hasSalesOrder = salesOrders.some((so) => so.quotationId === quotation.id);
  const isCreateSODisabled = quotation.status !== 'Accepted' || hasSalesOrder || !canWriteSales;

  let tooltipMessage = '';
  if (quotation.status !== 'Accepted') {
    tooltipMessage = 'Sales Order can only be created from an "Accepted" quotation.';
  } else if (hasSalesOrder) {
    tooltipMessage = 'A Sales Order for this quotation already exists.';
  } else if (!canWriteSales) {
    tooltipMessage = "You don't have permission to create Sales Orders.";
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                Quotation Preview: <span className="font-semibold text-primary">{quotation.id}</span>
              </DialogTitle>
              <DialogDescription>Review and print the formal customer quotation below.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1">
          <div ref={printableRef}>
            <QuotationView quotation={quotation} products={products} />
          </div>
        </div>
        <DialogFooter className="sm:justify-between pt-3 border-t">
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div tabIndex={isCreateSODisabled ? 0 : -1}>
                    <Button
                      onClick={handleCreateSalesOrder}
                      disabled={isCreateSODisabled}
                      style={isCreateSODisabled ? { pointerEvents: 'none' } : {}}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Create Sales Order
                    </Button>
                  </div>
                </TooltipTrigger>
                {isCreateSODisabled && (
                  <TooltipContent>
                    <p>{tooltipMessage}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleEditClick}
              className="bg-[#2C2C2C] text-white hover:bg-[#151515] hover:text-white"
              disabled={!canWriteQuotations}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="bg-[#FF9D00] text-white hover:bg-[#FF9D00]/90"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Quotation
            </Button>
            <Button onClick={onClose} className="bg-[#588B00] text-white hover:bg-[#588B00]/90">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
