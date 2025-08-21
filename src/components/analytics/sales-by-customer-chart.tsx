
'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SalesOrder } from '@/lib/types';

interface SalesByCustomerChartProps {
    dateRange: number;
    sales: SalesOrder[];
}

export default function SalesByCustomerChart({ dateRange, sales }: SalesByCustomerChartProps) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - dateRange);

  const filteredSales = sales.filter(s => {
    const saleDate = (s.orderDate as any).toDate ? (s.orderDate as any).toDate() : new Date(s.orderDate as string);
    return saleDate >= cutoffDate;
  });
  
  const salesByCustomer = filteredSales.reduce((acc, sale) => {
    if (!acc[sale.customerName!]) {
      acc[sale.customerName!] = 0;
    }
    acc[sale.customerName!] += sale.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(salesByCustomer)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Customer</CardTitle>
        <CardDescription>Top 6 customers by revenue.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              stroke="#888888"
              fontSize={12}
              width={80}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Legend />
            <Bar dataKey="total" fill="hsl(var(--primary))" name="Revenue" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
