
'use client'

import { useState } from 'react';
import { Quotation, Customer, SalesOrder } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye, CheckCircle, User, Search, PlusCircle } from "lucide-react";
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
import Link from 'next/link';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface QuotationListProps {
    quotations: Quotation[];
    customers: Customer[];
    salesOrders: SalesOrder[];
    onView: (quotation: Quotation) => void;
    onEdit: (quotation: Quotation) => void;
    onCreate: () => void;
    onDelete: (quotationId: string) => void;
    onApprove: (quotation: Quotation) => void;
    onViewCustomer: (customer: Customer) => void;
    onViewSalesOrder: (salesOrder: SalesOrder) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
}

export default function QuotationList({ 
    quotations, 
    customers, 
    salesOrders, 
    onView, 
    onEdit, 
    onCreate,
    onDelete, 
    onApprove, 
    onViewCustomer, 
    onViewSalesOrder,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter
}: QuotationListProps) {
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null);
    const [isApproveAlertOpen, setIsApproveAlertOpen] = useState(false);
    const [quotationToApprove, setQuotationToApprove] = useState<Quotation | null>(null);

    const openDeleteAlert = (quotation: Quotation) => {
        setQuotationToDelete(quotation);
        setIsDeleteAlertOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (quotationToDelete) {
            onDelete(quotationToDelete.id);
            setIsDeleteAlertOpen(false);
            setQuotationToDelete(null);
        }
    };
    
    const openApproveAlert = (quotation: Quotation) => {
        setQuotationToApprove(quotation);
        setIsApproveAlertOpen(true);
    };

    const handleApproveConfirm = () => {
        if (quotationToApprove) {
            onApprove(quotationToApprove);
            setIsApproveAlertOpen(false);
            setQuotationToApprove(null);
        }
    };

    const getStatusVariant = (status: Quotation['status']): "default" | "secondary" | "destructive" | "outline" | "success" | "draft" | "quotation" => {
        switch (status) {
            case 'Accepted':
                return 'success';
            case 'Sent':
                return 'quotation';
            case 'Draft':
                return 'draft';
            case 'Expired':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getSalesOrderStatusVariant = (status?: SalesOrder['status']): "fulfilled" | "secondary" | "destructive" | "outline" | "success" | "confirmed" | "draft" => {
        if (!status) return 'outline';
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
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Quotations</CardTitle>
                            <CardDescription>A list of all your quotations.</CardDescription>
                        </div>
                        <Button onClick={onCreate}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Quotation
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 pt-4">
                        <div className="relative w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Quotation ID or Customer..."
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
                                <SelectItem value="Sent">Sent</SelectItem>
                                <SelectItem value="Accepted">Accepted</SelectItem>
                                <SelectItem value="Expired">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <TooltipProvider>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quotation ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Quotation Status</TableHead>
                                <TableHead>Sales Order Status</TableHead>
                                <TableHead className="w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotations.map((quotation) => {
                                const linkedSO = salesOrders.find(so => so.quotationId === quotation.id);
                                return (
                                <TableRow key={quotation.id}>
                                    <TableCell className="font-medium">{quotation.id}</TableCell>
                                    <TableCell>
                                        <Button className="bg-[#2463EB] text-white hover:bg-[#2463EB]/90 px-2 py-1 h-auto text-sm" onClick={() => handleViewCustomer(quotation.customerId)}>
                                            <User className="h-4 w-4 mr-2" />
                                            {quotation.customerName || quotation.customerId}
                                        </Button>
                                    </TableCell>
                                    <TableCell>{formatDate(quotation.qtnDate)}</TableCell>
                                    <TableCell>₱{quotation.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(quotation.status)}>{quotation.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {linkedSO ? (
                                            <Button variant="link" className="p-0 h-auto" onClick={() => onViewSalesOrder(linkedSO)}>
                                                <Badge variant={getSalesOrderStatusVariant(linkedSO.status)} className="cursor-pointer">{linkedSO.status}</Badge>
                                            </Button>
                                        ) : (
                                            <Badge variant="outline">N/A</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="flex items-center gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => onView(quotation)}>
                                                    <Eye className="h-4 w-4 text-blue-500" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>View Details</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => openApproveAlert(quotation)} disabled={quotation.status === 'Accepted'}>
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Mark as Accepted</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => openDeleteAlert(quotation)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete</TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                    </TooltipProvider>
                    {quotations.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            No quotations found.
                        </div>
                    )}
                </CardContent>
            </Card>
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the quotation.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isApproveAlertOpen} onOpenChange={setIsApproveAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to accept this quotation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will mark the quotation as 'Accepted' and it cannot be reverted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApproveConfirm}>Accept</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
