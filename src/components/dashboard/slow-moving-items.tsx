
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product, Sales } from "@/lib/types";
import Image from "next/image";
import { TrendingDownIcon } from "../icons/trending-down";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";
import Link from 'next/link';

interface SlowMovingItemsProps {
    products: Product[];
    sales: Sales[];
}

export default function SlowMovingItems({ products, sales }: SlowMovingItemsProps) {
  const salesLast90Days = sales.filter(s => new Date(s.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
  const soldProductIds = new Set(salesLast90Days.map(s => s.productId));
  const slowMovingProducts = products
    .filter(p => !soldProductIds.has(p.id) && p.stock > 0)
    .slice(0, 3)
    .map(p => ({
        ...p,
        daysInStock: p.createdAt ? Math.floor((Date.now() - (p.createdAt as any).toDate().getTime()) / (1000 * 60 * 60 * 24)) : 0
    }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <TrendingDownIcon className="h-5 w-5 text-red-500" />
                <CardTitle>Slow-Moving Items</CardTitle>
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
          {slowMovingProducts.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <Image
                src={item.productImage || 'https://placehold.co/40x40.png'}
                alt={item.name}
                width={40}
                height={40}
                className="rounded-md"
                data-ai-hint="product image"
              />
              <div className="flex-1">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.daysInStock} days in stock</p>
              </div>
              <p className="text-sm font-semibold">{item.stock} units</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
