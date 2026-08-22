'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product, FlatSale } from "@/lib/types";
import { TrendingDownIcon } from "../icons/trending-down";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";
import Link from 'next/link';
import ProductImage from "../products/product-image";

interface SlowMovingItemsProps {
    products: Product[];
    sales: FlatSale[];
}

export default function SlowMovingItems({ products, sales }: SlowMovingItemsProps) {
  const salesLast90Days = sales.filter(s => {
      const saleDate = (s.date as any).toDate ? (s.date as any).toDate() : new Date(s.date as string);
      return saleDate > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  });
  const soldProductIds = new Set(salesLast90Days.map(s => s.productId));
  const slowMovingProducts = products
    .filter(p => !soldProductIds.has(p.id) && p.stock > 0)
    .slice(0, 3)
    .map(p => {
        const createdAtDate = p.createdAt ? ((p.createdAt as any).toDate ? (p.createdAt as any).toDate() : new Date(p.createdAt as string)) : new Date(0);
        return {
            ...p,
            daysInStock: Math.floor((Date.now() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24))
        };
    });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <TrendingDownIcon className="h-5 w-5 text-red-500 shrink-0" />
                <CardTitle className="text-base font-semibold">Slow-Moving Items</CardTitle>
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
          {slowMovingProducts.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card/60 hover:bg-muted/50 transition-colors">
              <div className="h-12 w-12 rounded-md border bg-muted flex items-center justify-center p-1 shrink-0 overflow-hidden">
                <ProductImage
                  path={item.productImage}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                  data-ai-hint="product image"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate text-foreground" title={item.name}>{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.daysInStock} days in stock</p>
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0 whitespace-nowrap">{item.stock} units</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
