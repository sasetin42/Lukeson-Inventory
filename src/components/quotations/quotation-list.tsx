
'use client'

import { useState } from 'react';
import { Quotation } from '@/lib/types';
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
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotations.map((quotation) => (
                                <TableRow key={quotation.id}>
                                    <TableCell className="font-medium">{quotation.id}</TableCell>
                                    <TableCell>{quotation.customerId}</TableCell>
                                    <TableCell>{formatDate(quotation.qtnDate)}</TableCell>
                                    <TableCell>{formatDate(quotation.expiryDate)}</TableCell>
                                    <TableCell>₱{quotation.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(quotation.status)}>{quotation.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(quotation)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => openDeleteAlert(quotation)}>
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
