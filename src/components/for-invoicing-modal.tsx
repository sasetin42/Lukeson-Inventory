
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { SalesOrder } from '@/lib/types';
import { Button } from './ui/button';
import { FileText, Calendar, User, DollarSign, ChevronRight } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface ForInvoicingModalProps {
  salesOrders: SalesOrder[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ForInvoicingModal({
  salesOrders,
  isOpen,
  onClose,
}: ForInvoicingModalProps) {
  const router = useRouter();

  const handleCreateInvoice = (salesOrder: SalesOrder) => {
    const soData = encodeURIComponent(JSON.stringify(salesOrder));
    router.push(`/invoices?fromSalesOrder=${soData}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-md">
                <FileText className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
                <DialogTitle>Sales Orders Ready for Invoicing</DialogTitle>
                <DialogDescription>
                    Review the fulfilled orders below and create invoices.
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 p-1">
                {salesOrders.length > 0 ? (
                    salesOrders.map(so => (
                        <div key={so.id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 text-sm">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground"/>
                                    <span className="font-semibold">{so.id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground"/>
                                    <span>{so.customerName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground"/>
                                    <span>{format((so.orderDate as any).toDate(), 'PP')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground"/>
                                    <span className="font-semibold">₱{so.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                            </div>
                            <Button size="sm" onClick={() => handleCreateInvoice(so)}>
                                Create Invoice <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        No orders are currently ready for invoicing.
                    </div>
                )}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
