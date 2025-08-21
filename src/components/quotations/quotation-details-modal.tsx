
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Quotation } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  User,
  Calendar,
  Hash,
  FileText,
  DollarSign,
  Edit,
  ShoppingCart
} from 'lucide-react';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from 'next/navigation';


interface QuotationDetailsModalProps {
  quotation: Quotation | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (quotation: Quotation) => void;
}

export default function QuotationDetailsModal({
  quotation,
  isOpen,
  onClose,
  onEdit,
}: QuotationDetailsModalProps) {
  const router = useRouter();

  if (!quotation) return null;

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    // Firestore timestamp
    if (date.toDate) return format(date.toDate(), 'PP');
    // String date
    return format(new Date(date), 'PP');
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Accepted': return 'default';
        case 'Sent': return 'secondary';
        case 'Draft': return 'outline';
        case 'Expired': return 'destructive';
        default: return 'outline';
    }
  };
  
  const handleEditClick = () => {
    onClose(); // Close this modal
    onEdit(quotation); // Open the edit modal
  }

  const handleCreateSalesOrder = () => {
    const quotationData = encodeURIComponent(JSON.stringify(quotation));
    router.push(`/sales-orders?fromQuotation=${quotationData}`);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
               <div className="p-2 bg-purple-100 rounded-md">
                <FileText className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <DialogTitle>Quotation Details</DialogTitle>
                <DialogDescription>
                    Viewing quotation <span className="font-semibold text-primary">{quotation.id}</span>
                </DialogDescription>
              </div>
            </div>
             <Badge variant={getStatusVariant(quotation.status)} className="capitalize h-fit">{quotation.status}</Badge>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            <div className="space-y-1">
                <h4 className="font-semibold flex items-center gap-2 text-sm"><User className="h-4 w-4 text-blue-500" /> Customer</h4>
                <p className="text-muted-foreground pl-6">{quotation.customerName}</p>
            </div>
             <div className="space-y-1">
                <h4 className="font-semibold flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-green-500" /> Quotation Date</h4>
                <p className="text-muted-foreground pl-6">{formatDate(quotation.qtnDate)}</p>
            </div>
             <div className="space-y-1">
                <h4 className="font-semibold flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-red-500" /> Expiry Date</h4>
                <p className="text-muted-foreground pl-6">{formatDate(quotation.expiryDate)}</p>
            </div>
        </div>
        <Separator />
         <div className="space-y-2 py-2">
            <h4 className="font-semibold">Line Items</h4>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">UOM</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Tax</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quotation.lines.map((line, index) => (
                            <TableRow key={index}>
                                <TableCell>{line.description}</TableCell>
                                <TableCell className="text-right">{line.quantity}</TableCell>
                                <TableCell className="text-right">{line.uom}</TableCell>
                                <TableCell className="text-right">₱{line.unitPrice.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{(line.taxRate * 100).toFixed(0)}%</TableCell>
                                <TableCell className="text-right">₱{line.total.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
        {quotation.notes && (
            <>
                <Separator />
                <div className="space-y-2 py-2">
                    <h4 className="font-semibold">Notes</h4>
                    <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">{quotation.notes}</p>
                </div>
            </>
        )}
        <Separator />
        <div className="flex justify-end items-center gap-4">
             <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <h3 className="text-2xl font-bold">₱{quotation.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
             </div>
        </div>
        <DialogFooter className="sm:justify-between">
            <div>
                {quotation.status === 'Accepted' && (
                    <Button onClick={handleCreateSalesOrder}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Create Sales Order
                    </Button>
                )}
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleEditClick}>
                <Edit className="h-4 w-4 mr-2 text-blue-500" />
                Edit Quotation
                </Button>
                <Button variant="default" onClick={onClose}>
                Close
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
