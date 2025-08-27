
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Invoice } from "@/lib/types";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { Eye, FileText, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface PaymentListProps {
    invoices: Invoice[];
    onViewTransaction: (invoice: Invoice) => void;
    onViewSalesInvoice: (invoice: Invoice) => void;
    onViewCustomer: (invoice: Invoice) => void;
}

export default function PaymentList({ invoices, onViewTransaction, onViewSalesInvoice, onViewCustomer }: PaymentListProps) {
    
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
                            <TableHead>Transaction Proof</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TooltipProvider>
                            {invoices.map(invoice => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                    <TableCell>{invoice.customerName}</TableCell>
                                    <TableCell>{formatDate((invoice as any).paidDate || invoice.dueDate)}</TableCell>
                                    <TableCell>{invoice.paymentMethod || 'N/A'}</TableCell>
                                    <TableCell className="text-right">₱{invoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                                    <TableCell>
                                        {invoice.transactionProof ? (
                                            <Button variant="outline" size="sm" onClick={() => onViewTransaction(invoice)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View
                                            </Button>
                                        ) : (
                                            <span className="text-muted-foreground">N/A</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                       <div className="flex items-center justify-center gap-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => onViewSalesInvoice(invoice)}>
                                                        <FileText className="h-4 w-4 text-green-500" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>View Sales Invoice</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => onViewCustomer(invoice)}>
                                                        <User className="h-4 w-4 text-purple-500" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>View Customer Details</TooltipContent>
                                            </Tooltip>
                                       </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TooltipProvider>
                         {invoices.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
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
