
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RecentTransaction } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

interface RecentTransactionsProps {
    transactions: RecentTransaction[];
}

const getStatusVariant = (doc: any, type: 'quotation' | 'salesOrder' | 'jobOrder' | 'invoice') => {
    if (!doc) return 'outline';
    
    switch (type) {
        case 'quotation':
            switch (doc.status as string) {
                case 'Accepted': return 'success';
                case 'Sent': return 'secondary';
                case 'Draft': return 'outline';
                case 'Expired': return 'destructive';
                default: return 'outline';
            }
        case 'salesOrder':
            switch (doc.status as string) {
                case 'Fulfilled': return 'default';
                case 'Confirmed': return 'confirmed';
                case 'Draft': return 'outline';
                case 'Cancelled': return 'destructive';
                case 'Invoiced': return 'destructive';
                default: return 'outline';
            }
        case 'jobOrder':
             switch (doc.status as string) {
                case 'Completed': return 'success';
                case 'In Progress':
                case 'Scheduled':
                    return 'secondary';
                case 'Draft': 
                case 'On Hold': 
                    return 'outline';
                case 'Cancelled': return 'destructive';
                default: return 'outline';
            }
        case 'invoice':
             switch (doc.status as string) {
                case 'Paid': return 'success';
                case 'Posted': return 'posted';
                case 'Pending': return 'secondary';
                case 'Overdue': return 'destructive';
                default: return 'outline';
            }
        default:
            return 'outline';
    }
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
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
                    <Badge variant={getStatusVariant(quotation, 'quotation')}>
                        {quotation?.status || 'N/A'}
                    </Badge>
                </TableCell>
                <TableCell>
                    <Badge variant={getStatusVariant(salesOrder, 'salesOrder')}>
                        {salesOrder.status}
                    </Badge>
                </TableCell>
                <TableCell>
                    <Badge variant={getStatusVariant(jobOrder, 'jobOrder')}>
                        {jobOrder?.status || 'N/A'}
                    </Badge>
                </TableCell>
                <TableCell>
                    <Badge variant={getStatusVariant(invoice, 'invoice')}>
                        {invoice?.id ? 'Created' : 'N/A'}
                    </Badge>
                </TableCell>
                 <TableCell>
                    <Badge variant={getStatusVariant(invoice, 'invoice')}>
                        {invoice?.status || 'N/A'}
                    </Badge>
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
