
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sales } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

interface RecentTransactionsProps {
    sales: Sales[];
}

export default function RecentTransactions({ sales }: RecentTransactionsProps) {
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
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.slice(0, 5).map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarImage src={`https://placehold.co/40x40.png`} alt="Avatar" data-ai-hint="person avatar" />
                      <AvatarFallback>{sale.customerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{sale.customerName}</div>
                  </div>
                </TableCell>
                <TableCell>{sale.productName}</TableCell>
                <TableCell className="text-right">₱{sale.total.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                    <Badge variant="default">Paid</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
