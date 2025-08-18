
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sales, Product } from "@/lib/types";
import Image from "next/image";
import { TrendingUpIcon } from "../icons/trending-up";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";
import Link from 'next/link';

interface TopSellingItemsProps {
    sales: Sales[];
    products: Product[];
}

export default function TopSellingItems({ sales, products }: TopSellingItemsProps) {
  const productSales = sales.reduce((acc, sale) => {
    if (!acc[sale.productId]) {
      acc[sale.productId] = { revenue: 0, unitsSold: 0 };
    }
    acc[sale.productId].revenue += sale.total;
    acc[sale.productId].unitsSold += sale.quantity;
    return acc;
  }, {} as Record<string, { revenue: number, unitsSold: number }>);

  const topSelling = Object.entries(productSales)
    .map(([productId, data]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;
      return {
        ...product,
        ...data,
      }
    })
    .filter(p => p !== null)
    .sort((a, b) => b!.revenue - a!.revenue)
    .slice(0, 3);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5 text-green-500" />
                <CardTitle>Top-Selling Items</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
                <Link href="/products">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topSelling.map((item) => (
            <div key={item!.id} className="flex items-center gap-4">
              <Image
                src={item!.productImage || 'https://placehold.co/40x40.png'}
                alt={item!.name}
                width={40}
                height={40}
                className="rounded-md"
                data-ai-hint="product image"
              />
              <div className="flex-1">
                <p className="font-medium text-sm truncate">{item!.name}</p>
                <p className="text-xs text-muted-foreground">{item!.unitsSold} units sold</p>
              </div>
              <p className="text-sm font-semibold">₱{item!.revenue.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
