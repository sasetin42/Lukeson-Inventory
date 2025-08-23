
'use client'

import { useState } from 'react';
import { SalesOrder, Quotation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface SalesOrderListProps {
    salesOrders: SalesOrder[];
    quotations: Quotation[];
    onEdit: (salesOrder: SalesOrder) => void;
    onDelete: (salesOrderId: string) => void;
    onView: (salesOrder: SalesOrder) => void;
}

export default function SalesOrderList({ salesOrders, quotations, onEdit, onDelete, onView }: SalesOrderListProps) {
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [salesOrderToDelete, setSalesOrderToDelete] = useState<SalesOrder | null>(null);
    const { toast } = useToast();

    const openDeleteAlert = (salesOrder: SalesOrder) => {
        setSalesOrderToDelete(salesOrder);
        setIsDeleteAlertOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (salesOrderToDelete) {
            onDelete(salesOrderToDelete.id);
            setIsDeleteAlertOpen(false);
            setSalesOrderToDelete(null);
        }
    };
    
    const getStatusVariant = (status: SalesOrder['status']): "default" | "secondary" | "destructive" | "outline" | "success" => {
        switch (status) {
            case 'Fulfilled':
                return 'default';
            case 'Confirmed':
                return 'success';
            case 'Draft':
                return 'outline';
            case 'Cancelled':
                return 'destructive';
            case 'Invoiced':
                 return 'destructive';
            default:
                return 'outline';
        }
    };

    const getQuotationStatusVariant = (status?: Quotation['status']): "default" | "secondary" | "destructive" | "outline" | "success" => {
        if (!status) return 'outline';
        switch (status) {
            case 'Accepted':
                return 'success';
            case 'Sent':
                return 'secondary';
            case 'Draft':
                return 'outline';
            case 'Expired':
                return 'destructive';
            default:
                return 'outline';
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
                    <CardTitle>Sales Orders</CardTitle>
                    <CardDescription>A list of all your sales orders. (e.g. SO-2025-001)</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sales Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[150px] text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TooltipProvider>
                                {salesOrders.map((salesOrder) => {
                                    const quotation = salesOrder.quotationId ? quotations.find(q => q.id === salesOrder.quotationId) : null;
                                    return (
                                        <TableRow key={salesOrder.id}>
                                            <TableCell className="font-medium">{salesOrder.id}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{salesOrder.customerName}</div>
                                                <div className="text-muted-foreground" style={{fontSize: '12px'}}>
                                                    {quotation ? (
                                                        <span>Quotation: <Badge variant={getQuotationStatusVariant(quotation.status)} className="text-[10px] px-1.5 py-0">{quotation.status}</Badge></span>
                                                    ) : (
                                                        <span>No linked quotation</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatDate(salesOrder.orderDate)}</TableCell>
                                            <TableCell>₱{salesOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(salesOrder.status)}>{salesOrder.status}</Badge>
                                            </TableCell>
                                            <TableCell className="flex justify-center items-center gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => onView(salesOrder)}>
                                                            <Eye className="h-4 w-4 text-blue-500" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>View Sales Order</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => onEdit(salesOrder)}>
                                                            <Edit className="h-4 w-4 text-green-500" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Edit Sales Order</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                         <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => openDeleteAlert(salesOrder)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Delete Sales Order</TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TooltipProvider>
                        </TableBody>
                    </Table>
                    {salesOrders.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            No sales orders found.
                        </div>
                    )}
                </CardContent>
            </Card>
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the sales order.
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
