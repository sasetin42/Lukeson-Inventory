
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Invoice, RecentTransaction } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { getInvoiceStatusVariant, getJobOrderStatusVariant, getQuotationStatusVariant, getSalesOrderStatusVariant } from '../badge-variants';

interface RecentTransactionsProps {
    transactions: RecentTransaction[];
    onViewTransaction: (invoice: Invoice) => void;
}

export default function RecentTransactions({ transactions, onViewTransaction }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                <CardTitle>Recent Transactions</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
                <Link href="/sales-orders">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
            </Button>
        </div>
        <CardDescription>A list of the most recent sales transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Quotation</TableHead>
              <TableHead>Sales Order</TableHead>
              <TableHead>Job Order</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Payment Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.slice(0, 5).map(({ salesOrder, quotation, jobOrder, invoice }) => (
              <TableRow key={salesOrder.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarImage src={`https://placehold.co/40x40.png`} alt="Avatar" data-ai-hint="person avatar" />
                      <AvatarFallback>{salesOrder.customerName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{salesOrder.customerName}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">₱{salesOrder.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                    <Badge variant={getQuotationStatusVariant(quotation?.status)}>
                        {quotation?.status || 'N/A'}
                    </Badge>
                </TableCell>
                <TableCell>
                    <Badge variant={getSalesOrderStatusVariant(salesOrder.status)}>
                        {salesOrder.status}
                    </Badge>
                </TableCell>
                <TableCell>
                    <Badge variant={getJobOrderStatusVariant(jobOrder?.status || 'Draft')}>
                        {jobOrder?.status || 'N/A'}
                    </Badge>
                </TableCell>
                <TableCell>
                    <Badge variant={invoice?.id ? 'success' : 'outline'}>
                        {invoice?.id ? 'Created' : 'N/A'}
                    </Badge>
                </TableCell>
                 <TableCell>
                    {invoice && invoice.status === 'Paid' ? (
                        <Button variant="link" className="p-0 h-auto" onClick={() => onViewTransaction(invoice)}>
                             <Badge variant={getInvoiceStatusVariant(invoice?.status || 'Draft')}>
                                {invoice?.status || 'N/A'}
                            </Badge>
                        </Button>
                    ) : (
                        <Badge variant={getInvoiceStatusVariant(invoice?.status || 'Draft')}>
                            {invoice?.status || 'N/A'}
                        </Badge>
                    )}
                </TableCell>
              </TableRow>
            ))}
             {transactions.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        No recent transactions.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
