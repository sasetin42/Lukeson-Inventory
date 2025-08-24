
'use client'

import { useState } from 'react';
import { JobOrder, SalesOrder, Customer } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye, User, Search } from "lucide-react";
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
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface JobOrderListProps {
    jobOrders: JobOrder[];
    salesOrders: SalesOrder[];
    customers: Customer[];
    onEdit: (jobOrder: JobOrder) => void;
    onDelete: (jobOrderId: string) => void;
    onView: (jobOrder: JobOrder) => void;
    onViewCustomer: (customer: Customer) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
}

export default function JobOrderList({ 
    jobOrders, 
    salesOrders, 
    customers, 
    onEdit, 
    onDelete, 
    onView, 
    onViewCustomer,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter
}: JobOrderListProps) {
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
    
    const getStatusVariant = (status: JobOrder['status']): "completed" | "secondary" | "destructive" | "outline" | "inProgress" | "draft" => {
        switch (status) {
            case 'Completed': return 'completed';
            case 'In Progress': return 'inProgress';
            case 'Scheduled':
                return 'secondary';
            case 'Draft': 
                return 'draft';
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

    const handleViewCustomer = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            onViewCustomer(customer);
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Job Orders</CardTitle>
                    <CardDescription>A list of all your job orders.</CardDescription>
                     <div className="flex items-center gap-2 pt-4">
                        <div className="relative w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Job Order ID or Customer..."
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
                                <SelectItem value="Scheduled">Scheduled</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="On Hold">On Hold</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Job Order Date</TableHead>
                                <TableHead>Completion Date</TableHead>
                                <TableHead>SO Delivery Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px] text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TooltipProvider>
                                {jobOrders.map((jobOrder) => {
                                    const salesOrder = salesOrders.find(so => so.id === jobOrder.salesOrderId);
                                    return (
                                    <TableRow key={jobOrder.id}>
                                        <TableCell className="font-medium">{jobOrder.id}</TableCell>
                                        <TableCell>
                                            <Button className="bg-[#2463EB] text-white hover:bg-[#2463EB]/90 px-2 py-1 h-auto text-sm" onClick={() => handleViewCustomer(jobOrder.customerId)}>
                                                <User className="h-4 w-4 mr-2" />
                                                {jobOrder.customerName}
                                            </Button>
                                        </TableCell>
                                        <TableCell>{formatDate(jobOrder.jobOrderDate)}</TableCell>
                                        <TableCell>{formatDate(jobOrder.expectedCompletionDate)}</TableCell>
                                        <TableCell>{salesOrder ? formatDate(salesOrder.deliveryDate) : 'N/A'}</TableCell>
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
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => openDeleteAlert(jobOrder)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Delete</TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                )})}
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
