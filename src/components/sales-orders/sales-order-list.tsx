
'use client'

import { useState } from 'react';
import { SalesOrder, Quotation, JobOrder } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye, AlertCircle } from "lucide-react";
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
    jobOrders: JobOrder[];
    onDelete: (salesOrderId: string) => void;
    onView: (salesOrder: SalesOrder) => void;
    onViewJobOrder: (jobOrder: JobOrder) => void;
}

export default function SalesOrderList({ salesOrders, quotations, jobOrders, onDelete, onView, onViewJobOrder }: SalesOrderListProps) {
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
    
    const getStatusVariant = (status: SalesOrder['status']): "default" | "secondary" | "destructive" | "outline" | "success" | "confirmed" => {
        switch (status) {
            case 'Fulfilled':
                return 'default';
            case 'Confirmed':
                return 'confirmed';
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

    const getJobOrderStatusVariant = (status?: JobOrder['status']): "success" | "secondary" | "destructive" | "outline" | "inProgress" => {
        if (!status) return 'outline';
        switch (status) {
            case 'Completed': return 'success';
            case 'In Progress': return 'inProgress';
            case 'Scheduled': return 'secondary';
            case 'Draft':
            case 'On Hold':
                return 'outline';
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
                    <CardTitle>Sales Orders</CardTitle>
                    <CardDescription>A list of all your sales orders. (e.g. SO-2025-001)</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table className="min-w-[800px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sales Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Sales Order Status</TableHead>
                                <TableHead>Job Order Status</TableHead>
                                <TableHead className="w-[150px] text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TooltipProvider>
                                {salesOrders.map((salesOrder) => {
                                    const quotation = salesOrder.quotationId ? quotations.find(q => q.id === salesOrder.quotationId) : null;
                                    const jobOrder = jobOrders.find(jo => jo.salesOrderId === salesOrder.id);
                                    return (
                                        <TableRow key={salesOrder.id}>
                                            <TableCell>
                                                <div className="font-medium">{salesOrder.id}</div>
                                                {salesOrder.quotationId && (
                                                    <div className="text-muted-foreground" style={{fontSize: '12px'}}>
                                                        {salesOrder.quotationId}
                                                    </div>
                                                )}
                                            </TableCell>
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
                                            <TableCell>
                                                {jobOrder ? (
                                                    <Button variant="link" className="p-0 h-auto" onClick={() => onViewJobOrder(jobOrder)}>
                                                        <Badge variant={getJobOrderStatusVariant(jobOrder.status)} className="cursor-pointer">{jobOrder.status}</Badge>
                                                    </Button>
                                                ) : (
                                                    <Badge variant="outline">N/A</Badge>
                                                )}
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
