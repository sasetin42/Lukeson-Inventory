
'use client';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface StockMovementTrendChartProps {
    dateRange: number;
}

// Mock data generation for stock movement
const generateStockMovementData = (days: number) => {
    const data = [];
    let date = new Date();
    date.setDate(date.getDate() - days);
    for (let i = 0; i < days; i++) {
        date.setDate(date.getDate() + 1);
        data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            inbound: 100 + Math.floor(Math.random() * 150),
            outbound: 80 + Math.floor(Math.random() * 150),
        });
    }
    return data;
};

export default function StockMovementTrendChart({ dateRange }: StockMovementTrendChartProps) {
  const stockMovementData = generateStockMovementData(dateRange);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Movement Trend</CardTitle>
        <CardDescription>Daily inbound vs. outbound stock volume.</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stockMovementData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value} units`}
            />
            <Tooltip
                contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                }}
            />
            <Legend wrapperStyle={{fontSize: "14px"}}/>
            <Line type="monotone" dataKey="inbound" name="Inbound" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="outbound" name="Outbound" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
