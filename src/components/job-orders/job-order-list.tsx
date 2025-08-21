
'use client'

import { useState } from 'react';
import { JobOrder } from '@/lib/types';
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

interface JobOrderListProps {
    jobOrders: JobOrder[];
    onEdit: (jobOrder: JobOrder) => void;
    onDelete: (jobOrderId: string) => void;
}

export default function JobOrderList({ jobOrders, onEdit, onDelete }: JobOrderListProps) {
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
    
    const getStatusVariant = (status: JobOrder['status']) => {
        switch (status) {
            case 'Completed': return 'default';
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
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
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
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(jobOrder)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500" onClick={() => openDeleteAlert(jobOrder)}>
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
