
'use client'

import { useState } from 'react';
import { JobOrder } from '@/lib/types';
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

interface JobOrderListProps {
    jobOrders: JobOrder[];
    onEdit: (jobOrder: JobOrder) => void;
    onDelete: (jobOrderId: string) => void;
    onView: (jobOrder: JobOrder) => void;
}

export default function JobOrderList({ jobOrders, onEdit, onDelete, onView }: JobOrderListProps) {
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [jobOrderToDelete, setJobOrderToDelete] = useState<JobOrder | null>(null);

    const openDeleteAlert = (jobOrder: JobOrder) => {
        setJobOrderToDelete(jobOrder);
        setIsDeleteAlertOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (jobOrderToDelete) {
            onDelete(jobOrderToDelete.id);
            setIsDeleteAlertOpen(false);
            setJobOrderToDelete(null);
        }
    };
    
    const getStatusVariant = (status: JobOrder['status']): "success" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'Completed': return 'success';
            case 'In Progress':
            case 'Scheduled':
                return 'secondary';
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
                    <CardTitle>Job Orders</CardTitle>
                    <CardDescription>A list of all your job orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Job Order Date</TableHead>
                                <TableHead>Completion Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px] text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TooltipProvider>
                                {jobOrders.map((jobOrder) => (
                                    <TableRow key={jobOrder.id}>
                                        <TableCell className="font-medium">{jobOrder.id}</TableCell>
                                        <TableCell>{jobOrder.customerName}</TableCell>
                                        <TableCell>{formatDate(jobOrder.jobOrderDate)}</TableCell>
                                        <TableCell>{formatDate(jobOrder.expectedCompletionDate)}</TableCell>
                                        <TableCell>₱{jobOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(jobOrder.status)}>{jobOrder.status}</Badge>
                                        </TableCell>
                                        <TableCell className="flex items-center justify-center gap-1">
                                             <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => onView(jobOrder)}>
                                                        <Eye className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>View Job Order</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => onView(jobOrder)}>
                                                        <Edit className="h-4 w-4 text-green-500" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>View Job Order</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => openDeleteAlert(jobOrder)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Delete</TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TooltipProvider>
                        </TableBody>
                    </Table>
                    {jobOrders.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            No job orders found.
                        </div>
                    )}
                </CardContent>
            </Card>
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the job order.
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
