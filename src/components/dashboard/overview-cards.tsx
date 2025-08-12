import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { products, suppliers, invoices } from '@/lib/data';
import { Package, Truck, Users, DollarSign, AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export default function OverviewCards() {
  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.status === 'Low Stock').length;
  const totalSuppliers = suppliers.length;
  const pendingInvoices = invoices.filter(i => i.status === 'Pending').reduce((acc, i) => acc + i.amount, 0);

  const cardData = [
    { title: 'Total Products', value: totalProducts, icon: Package },
    { title: 'Low Stock Items', value: lowStockItems, icon: AlertCircle, isWarning: lowStockItems > 0 },
    { title: 'Total Suppliers', value: totalSuppliers, icon: Truck },
    { title: 'Pending Invoices', value: `$${pendingInvoices.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map(({ title, value, icon: Icon, isWarning }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-4 w-4 text-muted-foreground ${isWarning ? 'text-destructive' : ''}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">
              {title === 'Low Stock Items' && lowStockItems > 0 ? `${lowStockItems} items need attention` : `As of today`}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
