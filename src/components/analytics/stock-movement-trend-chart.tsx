
'use client';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Mock data for stock movement
const stockMovementData = [
  { date: 'May 20', inbound: 120, outbound: 90 },
  { date: 'May 21', inbound: 150, outbound: 110 },
  { date: 'May 22', inbound: 80, outbound: 130 },
  { date: 'May 23', inbound: 200, outbound: 150 },
  { date: 'May 24', inbound: 180, outbound: 160 },
  { date: 'May 25', inbound: 130, outbound: 140 },
  { date: 'May 26', inbound: 250, outbound: 180 },
  { date: 'May 27', inbound: 190, outbound: 200 },
  { date: 'May 28', inbound: 220, outbound: 210 },
  { date: 'May 29', inbound: 160, outbound: 170 },
];

export default function StockMovementTrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Movement Trend</CardTitle>
        <CardDescription>Daily inbound vs. outbound stock volume over the last 10 days.</CardDescription>
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
