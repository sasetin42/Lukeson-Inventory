
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Product, PurchaseOrder, SalesOrder, StockHistory } from '@/lib/types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '../ui/table';
import { ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo } from 'react';

interface StockHistoryModalProps {
  product: Product | null;
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  isOpen: boolean;
  onClose: () => void;
}

export default function StockHistoryModal({
  product,
  salesOrders,
  purchaseOrders,
  isOpen,
  onClose,
}: StockHistoryModalProps) {
  
  const stockHistory = useMemo(() => {
    if (!product) return [];
    
    const salesMovements: StockHistory[] = salesOrders
      .flatMap(so => so.lines.map(line => ({ ...line, date: so.orderDate, customerName: so.customerName, id: so.id })))
      .filter(line => line.itemId === product.id)
      .map(line => ({
        date: (line.date as any).toDate ? (line.date as any).toDate() : new Date(line.date as string),
        type: 'Sale',
        quantityChange: -line.quantity,
        newStock: 0, // Will be calculated later
        reference: line.id,
      }));

    const purchaseMovements: StockHistory[] = purchaseOrders
      .filter(po => po.status === 'Received')
      .flatMap(po => po.lines.map(line => ({ ...line, date: po.orderDate, id: po.id })))
      .filter(line => line.itemId === product.id)
      .map(line => ({
        date: (line.date as any).toDate ? (line.date as any).toDate() : new Date(line.date as string),
        type: 'Purchase',
        quantityChange: line.quantity,
        newStock: 0, // Will be calculated later
        reference: line.id,
      }));

    // Combine and sort by date
    const allMovements = [...salesMovements, ...purchaseMovements].sort((a,b) => a.date.getTime() - b.date.getTime());
    
    // Calculate running stock
    let runningStock = product.stock; // Start from current stock and work backwards
    const historyWithStock = allMovements.reverse().map(move => {
        const withStock = { ...move, newStock: runningStock };
        runningStock -= move.quantityChange;
        return withStock;
    }).reverse();

    return historyWithStock;
    
  }, [product, salesOrders, purchaseOrders]);

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-100 rounded-md">
              <History className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <DialogTitle>Stock History: {product.name}</DialogTitle>
              <DialogDescription>
                A log of all stock movements for this product.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <ScrollArea className="h-96 pr-4">
            <Table>
                <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Resulting Stock</TableHead>
                        <TableHead>Reference</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stockHistory.map((entry, index) => (
                        <TableRow key={index}>
                            <TableCell>{format(entry.date, 'PPp')}</TableCell>
                            <TableCell>
                                <Badge variant={entry.type === 'Sale' ? 'destructive' : 'success'}>
                                    {entry.type === 'Sale' 
                                        ? <ArrowUpRight className="h-3 w-3 mr-1" />
                                        : <ArrowDownLeft className="h-3 w-3 mr-1" />
                                    }
                                    {entry.type}
                                </Badge>
                            </TableCell>
                            <TableCell className={`font-semibold ${entry.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {entry.quantityChange > 0 ? '+' : ''}{entry.quantityChange}
                            </TableCell>
                            <TableCell>{entry.newStock}</TableCell>
                            <TableCell>{entry.reference}</TableCell>
                        </TableRow>
                    ))}
                    {stockHistory.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                No stock history found for this product.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
