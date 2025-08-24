
import { Invoice } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, CheckCircle, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

interface InvoiceListProps {
    invoices: Invoice[];
    onView: (invoice: Invoice) => void;
    onMarkAsPaid: (invoice: Invoice) => void;
    onDelete: (invoiceId: string) => void;
}

export default function InvoiceList({ invoices, onView, onMarkAsPaid, onDelete }: InvoiceListProps) {
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

    const getStatusVariant = (status: string): "success" | "secondary" | "destructive" | "outline" | "posted" => {
        switch (status) {
            case 'Paid':
                return 'success';
            case 'Posted':
                return 'posted';
            case 'Pending':
                return 'secondary';
            case 'Overdue':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatDate = (date: any): string => {
        if (!date) return 'N/A';
        if (date.toDate) { // Firestore Timestamp
            return format(date.toDate(), 'PP');
        }
        if (typeof date === 'string' || date instanceof Date) {
            return format(new Date(date), 'PP');
        }
        return 'Invalid Date';
    };

    const openDeleteDialog = (invoice: Invoice) => {
        setInvoiceToDelete(invoice);
        setIsDeleteAlertOpen(true);
    }
  
    return (
        <>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{formatDate(invoice.date)}</TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell>₱{invoice.amount.toFixed(2)}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onView(invoice)}>
                                        <Eye className="mr-2 h-4 w-4 text-blue-500" />
                                        View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onMarkAsPaid(invoice)} disabled={invoice.status === 'Paid'}>
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                        Mark as Paid
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openDeleteDialog(invoice)} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
                {invoices.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                            No invoices found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the invoice.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setInvoiceToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        if (invoiceToDelete) {
                            onDelete(invoiceToDelete.id);
                            setIsDeleteAlertOpen(false);
                            setInvoiceToDelete(null);
                        }
                    }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
