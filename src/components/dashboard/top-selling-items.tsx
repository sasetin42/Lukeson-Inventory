'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlatSale, Product } from "@/lib/types";
import { TrendingUpIcon } from "../icons/trending-up";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";
import Link from 'next/link';
import ProductImage from "../products/product-image";

interface TopSellingItemsProps {
    sales: FlatSale[];
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5 text-green-500 shrink-0" />
                <CardTitle className="text-base font-semibold">Top-Selling Items</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" asChild>
                <Link href="/products">
                    View All
                    <ChevronRight className="h-3.5 w-3.5" />
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topSelling.map((item) => (
            <div key={item!.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card/60 hover:bg-muted/50 transition-colors">
              <div className="h-12 w-12 rounded-md border bg-muted flex items-center justify-center p-1 shrink-0 overflow-hidden">
                <ProductImage
                  path={item!.productImage}
                  alt={item!.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                  data-ai-hint="product image"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate text-foreground" title={item!.name}>{item!.name}</p>
                <p className="text-xs text-muted-foreground">{item!.unitsSold} units sold</p>
              </div>
              <p className="text-sm font-bold text-emerald-600 shrink-0 whitespace-nowrap">₱{item!.revenue.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
