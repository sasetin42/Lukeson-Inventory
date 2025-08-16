
'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { products } from '@/lib/products-data';
import { sales } from '@/lib/data';
import { categoryMap } from '@/lib/category-map';

interface InventoryTurnoverByCategoryChartProps {
    dateRange: number;
}

export default function InventoryTurnoverByCategoryChart({ dateRange }: InventoryTurnoverByCategoryChartProps) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - dateRange);

  const filteredSales = sales.filter(s => new Date(s.date) >= cutoffDate);
  
  const categoryCogs = filteredSales.reduce((acc, sale) => {
    const product = products.find(p => p.id === sale.productId);
    if (!product) return acc;
    
    const category = categoryMap[product.sku] || 'Uncategorized';
    const cost = product.cost * sale.quantity;

    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += cost;
    return acc;
  }, {} as Record<string, number>);

  const categoryInventoryValue = products.reduce((acc, product) => {
    const category = categoryMap[product.sku] || 'Uncategorized';
    const value = product.cost * product.stock;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += value;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(categoryCogs).map(category => {
    const cogs = categoryCogs[category];
    const avgInventory = categoryInventoryValue[category];
    // Scale COGS by the period to annualize it for a more standard turnover ratio
    const annualizationFactor = 365 / dateRange;
    const annualizedCogs = cogs * annualizationFactor;
    const turnover = avgInventory > 0 ? (annualizedCogs / avgInventory) : 0;
    return {
      name: category,
      turnover: parseFloat(turnover.toFixed(2)),
    }
  }).sort((a,b) => b.turnover - a.turnover);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Turnover by Category</CardTitle>
        <CardDescription>Rate at which stock is sold and replenished.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}x`} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Legend wrapperStyle={{fontSize: "14px"}}/>
            <Bar dataKey="turnover" fill="hsl(var(--chart-2))" name="Turnover Rate" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
