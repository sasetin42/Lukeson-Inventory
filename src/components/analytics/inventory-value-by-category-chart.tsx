
'use client';
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { products } from '@/lib/products-data';

// This is a mock mapping. In a real app, this would come from your categories data.
const categoryMap: Record<string, string> = {
    "LED-HD-240-24": "LED Striplights",
    "LED-FLEX-120-12": "LED Striplights",
    "LED-DL-R-9W": "Downlights",
    "CTRL-RGB-REM": "Controllers",
    "LED-FL-50W": "Floodlights",
    "PL-COP-E27": "Fixtures",
    "PS-24-150-SL": "Power Supplies",
    "AP-R-2M": "Profiles",
    "AP-S-2M-BLK": "Profiles",
    "LED-Panel-6060": "Panel Lights",
};

export default function InventoryValueByCategoryChart() {
  const valueByCategory = products.reduce((acc, product) => {
    const category = categoryMap[product.sku] || 'Uncategorized';
    const value = product.cost * product.stock;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += value;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(valueByCategory).map(([name, value]) => ({ name, value }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Value by Category</CardTitle>
        <CardDescription>Total cost value of stock for each product category.</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                return (
                  <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
                contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                }}
                formatter={(value) => `₱${Number(value).toLocaleString()}`}
            />
            <Legend wrapperStyle={{fontSize: "14px"}}/>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
