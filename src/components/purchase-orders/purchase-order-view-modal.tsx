

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PurchaseOrder } from '@/lib/types';
import { Button } from '../ui/button';
import PurchaseOrderView from './purchase-order-view';
import { Printer, Mail, Edit, Loader2, CheckCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface PurchaseOrderViewModalProps {
  purchaseOrder: PurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (purchaseOrder: PurchaseOrder) => void;
}

export default function PurchaseOrderViewModal({
  purchaseOrder,
  isOpen,
  onClose,
  onEdit,
}: PurchaseOrderViewModalProps) {
  const printableRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  if (!purchaseOrder) return null;

  const handlePrint = () => {
    const printContent = printableRef.current;
    if (printContent) {
        const printWindow = window.open('', '_blank', 'height=800,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Purchase Order</title>');
            
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

  const handleEmail = async () => {
    if (!purchaseOrder.supplierEmail) return;

    setIsSending(true);
    const { id, update } = toast({
      title: "Sending Email...",
      description: `Preparing to send PO ${purchaseOrder.id} to ${purchaseOrder.supplierEmail}`,
      variant: 'default',
      icon: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    });

    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update PO status to 'Sent' in Firestore
      const poRef = doc(db, 'purchaseOrders', purchaseOrder.id);
      await updateDoc(poRef, { status: 'Sent' });

      update({
        id,
        title: "Email Sent Successfully",
        description: `PO ${purchaseOrder.id} has been sent. Status updated to 'Sent'.`,
        variant: 'success',
        icon: <CheckCircle className="h-5 w-5" />
      });

    } catch (error) {
       update({
        id,
        title: "Error Sending Email",
        description: "Could not update the purchase order status.",
        variant: 'destructive',
      });
      console.error("Failed to update PO status:", error);
    } finally {
        setIsSending(false);
    }
  }

  const handleEditClick = () => {
    if(purchaseOrder) {
        onEdit(purchaseOrder);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
            <DialogTitle>Purchase Order</DialogTitle>
            <DialogDescription>
                Viewing purchase order <span className="font-semibold text-primary">{purchaseOrder.id}</span>
            </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1">
          <div ref={printableRef}>
            <PurchaseOrderView purchaseOrder={purchaseOrder} />
          </div>
        </div>
        <DialogFooter className="justify-between">
            <div>
                 <Button variant="outline" onClick={handleEmail} disabled={!purchaseOrder.supplierEmail || isSending}>
                    {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    {isSending ? 'Sending...' : 'Send to Supplier'}
                </Button>
            </div>
            <div className='flex gap-2'>
                 <Button
                    variant="outline"
                    onClick={handleEditClick}
                    className="bg-[#2C2C2C] text-white hover:bg-[#151515] hover:text-white"
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
