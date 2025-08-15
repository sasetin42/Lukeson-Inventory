
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { products } from '@/lib/data';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { differenceInDays, parseISO } from 'date-fns';

export default function SlowMovingItems() {
  const slowMovingProducts = products
    .filter(p => p.lastSoldDate)
    .map(p => ({
        ...p,
        daysSinceLastSale: differenceInDays(new Date(), parseISO(p.lastSoldDate!))
    }))
    .sort((a, b) => b.daysSinceLastSale - a.daysSinceLastSale)
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slow Moving Items</CardTitle>
        <CardDescription>Products that have not sold recently.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {slowMovingProducts.map((product) => (
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
              <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
            </div>
            <Badge variant="outline">{product.daysSinceLastSale} days</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
