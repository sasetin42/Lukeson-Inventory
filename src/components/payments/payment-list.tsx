
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Invoice } from "@/lib/types";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";

interface PaymentListProps {
    invoices: Invoice[];
}

export default function PaymentList({ invoices }: PaymentListProps) {
    
    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        return format(date.toDate ? date.toDate() : new Date(date), 'PP');
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Payment History</CardTitle>
                        <CardDescription>A list of all successfully paid invoices.</CardDescription>
                    </div>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Record Payment
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Payment Date</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead className="text-right">Amount Paid</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map(invoice => (
                            <TableRow key={invoice.id}>
                                <TableCell className="font-medium">{invoice.id}</TableCell>
                                <TableCell>{invoice.customerName}</TableCell>
                                <TableCell>{formatDate((invoice as any).paidDate || invoice.dueDate)}</TableCell>
                                <TableCell>Bank Transfer</TableCell>
                                <TableCell className="text-right">₱{invoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                            </TableRow>
                        ))}
                         {invoices.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No payments recorded yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
