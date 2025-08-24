
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
import { Eye } from 'lucide-react';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
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
        <div className="py-4">
          {invoice.transactionProof ? (
            isPdf ? (
              <iframe src={invoice.transactionProof} className="w-full h-[60vh]" title="Transaction Proof"></iframe>
            ) : (
              <div className="relative w-full h-[60vh]">
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
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
