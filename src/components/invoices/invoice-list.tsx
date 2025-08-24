
import { Invoice } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface InvoiceListProps {
    invoices: Invoice[];
}

export default function InvoiceList({ invoices }: InvoiceListProps) {
    const getStatusVariant = (status: string): "success" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'Paid':
                return 'success';
            case 'Pending':
            case 'Posted':
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
  
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
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
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                                    <DropdownMenuItem>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
                {invoices.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            No invoices found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
