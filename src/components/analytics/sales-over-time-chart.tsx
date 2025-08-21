
'use client';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sales } from '@/lib/types';
import { format } from 'date-fns';

interface SalesOverTimeChartProps {
    dateRange: number;
    sales: Sales[];
}

export default function SalesOverTimeChart({ dateRange, sales }: SalesOverTimeChartProps) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - dateRange);
  
  const filteredSales = sales.filter(s => {
    const saleDate = (s.date as any).toDate ? (s.date as any).toDate() : new Date(s.date as string);
    return saleDate >= cutoffDate;
  });

  const salesByDate = filteredSales.reduce((acc, sale) => {
    const saleDate = (sale.date as any).toDate ? (sale.date as any).toDate() : new Date(sale.date as string);
    const date = format(saleDate, 'MMM d');
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += sale.total;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(salesByDate)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => new Date(a.date + `, ${new Date().getFullYear()}`).getTime() - new Date(b.date + `, ${new Date().getFullYear()}`).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Over Time</CardTitle>
        <CardDescription>Daily sales revenue for the selected period.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₱${Number(value) / 1000}k`}
            />
            <Tooltip
                contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                }}
            />
            <Legend wrapperStyle={{fontSize: "14px"}}/>
            <Line type="monotone" dataKey="total" name="Revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
