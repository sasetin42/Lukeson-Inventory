import { invoices } from '@/lib/data';
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

export default function InvoiceList() {
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Paid':
                return 'default';
            case 'Pending':
                return 'secondary';
            case 'Overdue':
                return 'destructive';
            default:
                return 'outline';
        }
    };
  
    return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {invoices.map((invoice) => (
        <Card key={invoice.id}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="grid gap-1">
                <CardTitle className="text-lg">{invoice.id}</CardTitle>
                <CardDescription>{invoice.customerName}</CardDescription>
            </div>
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
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Due Date: {invoice.date}</span>
              <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
            </div>
            <div className="text-xl font-semibold text-right">
              ${invoice.amount.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
