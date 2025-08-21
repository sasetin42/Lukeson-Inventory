
'use client'

import { useState } from 'react';
import { Quotation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye, CheckCircle } from "lucide-react";
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

interface QuotationListProps {
    quotations: Quotation[];
    onEdit: (quotation: Quotation) => void;
    onDelete: (quotationId: string) => void;
}

export default function QuotationList({ quotations, onEdit, onDelete }: QuotationListProps) {
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null);

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
    
    const getStatusVariant = (status: Quotation['status']) => {
        switch (status) {
            case 'Accepted':
                return 'default';
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

    const handleApprove = (quotation: Quotation) => {
        // Here you would typically update the quotation status to 'Accepted'
        console.log(`Approving quotation ${quotation.id}`);
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Quotations</CardTitle>
                    <CardDescription>A list of all your quotations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quotation ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Expiry Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotations.map((quotation) => (
                                <TableRow key={quotation.id}>
                                    <TableCell className="font-medium">{quotation.id}</TableCell>
                                    <TableCell>
                                        <Link href={`/customer?customerId=${quotation.customerId}`} className="text-blue-600 hover:underline">
                                            {quotation.customerName || quotation.customerId}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{formatDate(quotation.qtnDate)}</TableCell>
                                    <TableCell>{formatDate(quotation.expiryDate)}</TableCell>
                                    <TableCell>₱{quotation.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(quotation.status)}>{quotation.status}</Badge>
                                    </TableCell>
                                    <TableCell className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => onEdit(quotation)}>
                                            <Eye className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => onEdit(quotation)}>
                                            <Edit className="h-4 w-4 text-yellow-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleApprove(quotation)}>
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => openDeleteAlert(quotation)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
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
                            This action cannot be undone. This will permanently delete the quotation.
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
