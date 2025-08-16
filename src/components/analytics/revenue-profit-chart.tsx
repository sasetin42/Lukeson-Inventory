'use client';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sales, Product } from '@/lib/types';
import { eachDayOfInterval, format, subDays } from 'date-fns';

interface RevenueProfitChartProps {
    dateRange: number;
    sales: Sales[];
    products: Product[];
}

export default function RevenueProfitChart({ dateRange, sales, products }: RevenueProfitChartProps) {
  const endDate = new Date();
  const startDate = subDays(endDate, dateRange);

  const filteredSales = sales.filter(s => {
    const saleDate = new Date(s.date);
    return saleDate >= startDate && saleDate <= endDate;
  });

  const dataByDay = eachDayOfInterval({ start: startDate, end: endDate }).map(day => {
    const formattedDate = format(day, 'MMM d');
    return {
      date: formattedDate,
      revenue: 0,
      profit: 0
    };
  });

  const dataMap = new Map(dataByDay.map(d => [d.date, d]));

  filteredSales.forEach(sale => {
    const formattedDate = format(new Date(sale.date), 'MMM d');
    const product = products.find(p => p.id === sale.productId);
    const cost = product ? product.cost * sale.quantity : 0;
    const profit = sale.total - cost;

    if (dataMap.has(formattedDate)) {
      const currentData = dataMap.get(formattedDate)!;
      currentData.revenue += sale.total;
      currentData.profit += profit;
    }
  });
  
  const chartData = Array.from(dataMap.values());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue & Profit Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
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
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
            <Area type="monotone" dataKey="profit" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorProfit)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
