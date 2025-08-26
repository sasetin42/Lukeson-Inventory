
'use client';
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PurchaseOrder } from '@/lib/types';

interface PurchaseStatusChartProps {
    purchases: PurchaseOrder[];
}

export default function PurchaseStatusChart({ purchases }: PurchaseStatusChartProps) {
  const statusCounts = purchases.reduce((acc, purchase) => {
    const status = purchase.status || 'Unknown';
    if (!acc[status]) {
      acc[status] = 0;
    }
    acc[status]++;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const COLORS = {
    'Draft': '#A0A0A0',
    'Sent': '#3B82F6',
    'Confirmed': '#8B5CF6',
    'Received': '#22C55E',
    'Billed': '#F97316',
    'Cancelled': '#EF4444',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Order Status</CardTitle>
        <CardDescription>Distribution of current purchase order statuses.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={(COLORS as any)[entry.name] || '#8884d8'} />
              ))}
            </Pie>
            <Tooltip
                contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                }}
            />
            <Legend wrapperStyle={{fontSize: "14px"}}/>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
