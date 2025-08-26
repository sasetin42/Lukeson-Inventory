
'use client'

import { useState } from 'react';
import { SalesOrder, Quotation, JobOrder } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye, AlertCircle, Search, PlusCircle } from "lucide-react";
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
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '@/context/auth-context';

interface SalesOrderListProps {
    salesOrders: SalesOrder[];
    quotations: Quotation[];
    jobOrders: JobOrder[];
    onCreate: () => void;
    onDelete: (salesOrderId: string) => void;
    onView: (salesOrder: SalesOrder) => void;
    onViewJobOrder: (jobOrder: JobOrder) => void;
    onViewQuotation: (quotation: Quotation) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
}

export default function SalesOrderList({ 
    salesOrders, 
    quotations, 
    jobOrders, 
    onCreate,
    onDelete, 
    onView, 
    onViewJobOrder, 
    onViewQuotation,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter
}: SalesOrderListProps) {
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [salesOrderToDelete, setSalesOrderToDelete] = useState<SalesOrder | null>(null);
    const { toast } = useToast();
    const { hasWriteAccess } = useAuth();
    const canWrite = hasWriteAccess('Sales Orders');

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
    
    const getStatusVariant = (status: SalesOrder['status']): "fulfilled" | "secondary" | "destructive" | "outline" | "success" | "confirmed" | "draft" => {
        switch (status) {
            case 'Fulfilled':
                return 'fulfilled';
            case 'Confirmed':
                return 'confirmed';
            case 'Draft':
                return 'draft';
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

    const getJobOrderStatusVariant = (status?: JobOrder['status']): "completed" | "secondary" | "destructive" | "outline" | "inProgress" => {
        if (!status) return 'outline';
        switch (status) {
            case 'Completed': return 'completed';
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
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Sales Orders</CardTitle>
                            <CardDescription>A list of all your sales orders. (e.g. SO-2025-001)</CardDescription>
                        </div>
                        <Button onClick={onCreate} disabled={!canWrite}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Sales Order
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 pt-4">
                        <div className="relative w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by SO ID, Quotation ID, or Customer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 sm:w-1/2"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                <SelectItem value="Fulfilled">Fulfilled</SelectItem>
                                <SelectItem value="Invoiced">Invoiced</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
                                                        <span>Quotation: 
                                                            <Button variant="link" className="p-0 h-auto ml-1" onClick={() => onViewQuotation(quotation)}>
                                                                <Badge variant={getQuotationStatusVariant(quotation.status)} className="text-[10px] px-1.5 py-0 cursor-pointer">{quotation.status}</Badge>
                                                            </Button>
                                                        </span>
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
                                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => openDeleteAlert(salesOrder)} disabled={!canWrite}>
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
