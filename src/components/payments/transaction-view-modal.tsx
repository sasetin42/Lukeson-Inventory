
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
import Image from 'next/image';
import { Eye, User, Calendar, CreditCard, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

interface TransactionViewModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionViewModal({
  invoice,
  isOpen,
  onClose,
}: TransactionViewModalProps) {
  if (!invoice) return null;

  const isPdf = invoice.transactionProof?.startsWith('data:application/pdf');
  
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return format(date.toDate ? date.toDate() : new Date(date), 'PPp');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
            <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-md">
                    <Eye className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                    <DialogTitle>Transaction Proof</DialogTitle>
                    <DialogDescription>
                        Viewing proof for invoice <span className="font-semibold text-primary">{invoice.id}</span>
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-6 -mr-6">
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
                    <User className="h-5 w-5 text-purple-500"/>
                    <div>
                        <p className="text-xs text-muted-foreground">Customer</p>
                        <p className="font-semibold">{invoice.customerName}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
                    <Calendar className="h-5 w-5 text-blue-500"/>
                    <div>
                        <p className="text-xs text-muted-foreground">Payment Date</p>
                        <p className="font-semibold">{formatDate(invoice.paidDate)}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
                    <CreditCard className="h-5 w-5 text-orange-500"/>
                    <div>
                        <p className="text-xs text-muted-foreground">Payment Method</p>
                        <p className="font-semibold">{invoice.paymentMethod || 'N/A'}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
                    <DollarSign className="h-5 w-5 text-green-500"/>
                    <div>
                        <p className="text-xs text-muted-foreground">Amount Paid</p>
                        <p className="font-semibold">₱{invoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                </div>
            </div>
            <Separator />
          {invoice.transactionProof ? (
            isPdf ? (
              <iframe src={invoice.transactionProof} className="w-full h-[60vh] rounded-md border" title="Transaction Proof"></iframe>
            ) : (
              <div className="relative w-full h-[60vh] border rounded-md overflow-hidden">
                <Image
                  src={invoice.transactionProof}
                  alt="Transaction Proof"
                  layout="fill"
                  objectFit="contain"
                  data-ai-hint="receipt proof"
                />
              </div>
            )
          ) : (
            <div className="text-center text-muted-foreground py-10">
              No transaction proof was uploaded for this payment.
            </div>
          )}
        </div>
        </ScrollArea>
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
