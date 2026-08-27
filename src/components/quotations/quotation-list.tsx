'use client'

import { useState } from 'react';
import { Quotation, Customer, SalesOrder } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, Eye, CheckCircle, User, Search, PlusCircle, Printer, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '@/context/auth-context';
import { getQuotationStatusVariant, getSalesOrderStatusVariant } from '../badge-variants';

interface QuotationListProps {
    quotations: Quotation[];
    customers: Customer[];
    salesOrders: SalesOrder[];
    onView: (quotation: Quotation) => void;
    onPrintPreview: (quotation: Quotation) => void;
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
    onPrintPreview,
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
    const { hasWriteAccess } = useAuth();
    const canWrite = hasWriteAccess('Quotations');

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
                        <Button onClick={onCreate} disabled={!canWrite}>
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
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quotation ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Quotation Status</TableHead>
                                <TableHead>Sales Order Status</TableHead>
                                <TableHead className="w-[100px] text-center">Actions</TableHead>
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
                                        <Badge variant={getQuotationStatusVariant(quotation.status)}>{quotation.status}</Badge>
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
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onPrintPreview(quotation)}>
                                                    <Printer className="mr-2 h-4 w-4 text-orange-500" />
                                                    Print Preview
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onView(quotation)}>
                                                    <Eye className="mr-2 h-4 w-4 text-blue-500" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onEdit(quotation)} disabled={!canWrite}>
                                                    <Edit className="mr-2 h-4 w-4 text-green-500" />
                                                    Edit Quotation
                                                </DropdownMenuItem>
                                                {quotation.status !== 'Accepted' && (
                                                    <DropdownMenuItem onClick={() => openApproveAlert(quotation)} disabled={!canWrite}>
                                                        <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                                                        Mark as Accepted
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={() => openDeleteAlert(quotation)} 
                                                    disabled={!canWrite}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
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
                            This action cannot be undone. This will permanently delete quotation <span className="font-semibold">{quotationToDelete?.id}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isApproveAlertOpen} onOpenChange={setIsApproveAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Accept Quotation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will mark quotation <span className="font-semibold">{quotationToApprove?.id}</span> as 'Accepted', allowing you to generate a Sales Order.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApproveConfirm} className="bg-emerald-600 hover:bg-emerald-700">Accept Quotation</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
