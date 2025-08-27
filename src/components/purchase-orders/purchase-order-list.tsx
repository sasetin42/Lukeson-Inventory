
'use client'

import { useState } from 'react';
import { PurchaseOrder } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye, File, Send, CheckCircle, XCircle, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
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
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const poStatuses: PurchaseOrder['status'][] = ['Draft', 'Sent', 'Received', 'Cancelled'];

interface PurchaseOrderListProps {
    purchaseOrders: PurchaseOrder[];
    onCreate: () => void;
    onEdit: (purchaseOrder: PurchaseOrder) => void;
    onDelete: (purchaseOrderId: string) => void;
    onView: (purchaseOrder: PurchaseOrder) => void;
    onStatusChange: (purchaseOrderId: string, newStatus: PurchaseOrder['status']) => void;
}

export default function PurchaseOrderList({ purchaseOrders, onCreate, onEdit, onDelete, onView, onStatusChange }: PurchaseOrderListProps) {
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [purchaseOrderToDelete, setPurchaseOrderToDelete] = useState<PurchaseOrder | null>(null);
    const { toast } = useToast();

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
            case 'Received': return 'received';
            case 'Sent': return 'sent';
            case 'Draft': return 'draft';
            case 'Cancelled': return 'destructive';
            default: return 'outline';
        }
    };
    
    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        return format(date.toDate ? date.toDate() : new Date(date), 'PP');
    }

    const statusIcons = {
        Draft: <File className="h-4 w-4 mr-2" style={{ color: '#2C2C2C' }} />,
        Sent: <Send className="h-4 w-4 mr-2" style={{ color: '#673DE6' }} />,
        Received: <CheckCircle className="h-4 w-4 mr-2" style={{ color: '#5F8400' }} />,
        Cancelled: <XCircle className="h-4 w-4 mr-2" style={{ color: '#EF4444' }} />,
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Purchase Orders</CardTitle>
                            <CardDescription>A list of all your purchase orders.</CardDescription>
                        </div>
                        <Button onClick={onCreate}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Purchase Order
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table className="min-w-[800px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Purchase Order ID</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Order Date</TableHead>
                                <TableHead>Expected Delivery</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[150px] text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TooltipProvider>
                            {purchaseOrders.map((purchaseOrder) => (
                                <TableRow key={purchaseOrder.id}>
                                    <TableCell className="font-medium">{purchaseOrder.id}</TableCell>
                                    <TableCell>{purchaseOrder.supplierName}</TableCell>
                                    <TableCell>{formatDate(purchaseOrder.orderDate)}</TableCell>
                                    <TableCell>{formatDate(purchaseOrder.expectedDeliveryDate)}</TableCell>
                                    <TableCell>₱{purchaseOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="p-0 h-auto">
                                                    <Badge variant={getStatusVariant(purchaseOrder.status)} className="cursor-pointer">{purchaseOrder.status}</Badge>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuRadioGroup 
                                                    value={purchaseOrder.status}
                                                    onValueChange={(newStatus) => onStatusChange(purchaseOrder.id, newStatus as PurchaseOrder['status'])}
                                                >
                                                    {poStatuses.map((status) => (
                                                        <DropdownMenuRadioItem key={status} value={status}>
                                                            {statusIcons[status as keyof typeof statusIcons]}
                                                            {status}
                                                        </DropdownMenuRadioItem>
                                                    ))}
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                    <TableCell className="flex items-center justify-center gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => onView(purchaseOrder)}>
                                                    <Eye className="h-4 w-4 text-blue-500" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>View PO</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => onEdit(purchaseOrder)}>
                                                    <Edit className="h-4 w-4 text-green-500" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit PO</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                             <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => openDeleteAlert(purchaseOrder)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete PO</TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            </TooltipProvider>
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
