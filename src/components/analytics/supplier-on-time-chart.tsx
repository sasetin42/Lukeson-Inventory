
'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { suppliers } from '@/lib/data';

interface SupplierOnTimeChartProps {
    dateRange: number;
}

export default function SupplierOnTimeChart({ dateRange }: SupplierOnTimeChartProps) {
    // Mocking that performance might change slightly with date range
    const supplierPerformance = suppliers.map(s => ({
        name: s.name,
        onTimeRate: Math.floor(Math.random() * (5 + dateRange/30)) + (90 - dateRange/30), 
    })).sort((a, b) => b.onTimeRate - a.onTimeRate);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier On-Time Performance</CardTitle>
        <CardDescription>On-time delivery rates for top suppliers.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={supplierPerformance} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
               formatter={(value) => `${value}%`}
            />
            <Legend wrapperStyle={{fontSize: "14px"}}/>
            <Bar dataKey="onTimeRate" name="On-Time Rate" radius={[4, 4, 0, 0]}>
                {supplierPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
