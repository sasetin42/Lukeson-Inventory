
'use client'

import { useState } from 'react';
import { PurchaseOrder } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';

interface PurchaseOrderListProps {
    purchaseOrders: PurchaseOrder[];
    onEdit: (purchaseOrder: PurchaseOrder) => void;
    onDelete: (purchaseOrderId: string) => void;
}

export default function PurchaseOrderList({ purchaseOrders, onEdit, onDelete }: PurchaseOrderListProps) {
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [purchaseOrderToDelete, setPurchaseOrderToDelete] = useState<PurchaseOrder | null>(null);

    const openDeleteAlert = (purchaseOrder: PurchaseOrder) => {
        setPurchaseOrderToDelete(purchaseOrder);
        setIsDeleteAlertOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (purchaseOrderToDelete) {
            onDelete(purchaseOrderToDelete.id);
            setIsDeleteAlertOpen(false);
            setPurchaseOrderToDelete(null);
        }
    };
    
    const getStatusVariant = (status: PurchaseOrder['status']) => {
        switch (status) {
            case 'Received': return 'default';
            case 'Sent':
            case 'Confirmed':
                return 'secondary';
            case 'Draft': return 'outline';
            case 'Cancelled': return 'destructive';
            default: return 'outline';
        }
    };
    
    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        return format(date.toDate ? date.toDate() : new Date(date), 'PP');
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Purchase Orders</CardTitle>
                    <CardDescription>A list of all your purchase orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Order Date</TableHead>
                                <TableHead>Expected Delivery</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchaseOrders.map((purchaseOrder) => (
                                <TableRow key={purchaseOrder.id}>
                                    <TableCell className="font-medium">{purchaseOrder.id}</TableCell>
                                    <TableCell>{purchaseOrder.supplierName}</TableCell>
                                    <TableCell>{formatDate(purchaseOrder.orderDate)}</TableCell>
                                    <TableCell>{formatDate(purchaseOrder.expectedDeliveryDate)}</TableCell>
                                    <TableCell>₱{purchaseOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(purchaseOrder.status)}>{purchaseOrder.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(purchaseOrder)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => openDeleteAlert(purchaseOrder)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {purchaseOrders.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            No purchase orders found.
                        </div>
                    )}
                </CardContent>
            </Card>
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the purchase order.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
