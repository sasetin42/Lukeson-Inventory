
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { sales, products } from '@/lib/data';
import Image from 'next/image';

export default function TopSellingItems() {
  const salesByProduct = sales.reduce((acc, sale) => {
    acc[sale.productName] = (acc[sale.productName] || 0) + sale.quantity;
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(salesByProduct)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([productName, quantitySold]) => ({
      product: products.find(p => p.name === productName),
      quantitySold,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Items</CardTitle>
        <CardDescription>Your best-performing products this month.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {topProducts.map(({ product, quantitySold }) => product && (
          <div key={product.id} className="flex items-center gap-4">
            <Image 
                src={product.image || "https://placehold.co/40x40.png"} 
                alt={product.name} 
                width={40} 
                height={40} 
                className="rounded-md object-cover"
                data-ai-hint="product image"
            />
            <div className="grid gap-1 flex-1">
              <p className="text-sm font-medium leading-none truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.category}</p>
            </div>
            <div className="font-medium">{quantitySold} sold</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
