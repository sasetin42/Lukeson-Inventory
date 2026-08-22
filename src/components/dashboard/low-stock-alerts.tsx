import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Product } from "@/lib/types";
import { AlertTriangle, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import ProductImage from "../products/product-image";

interface LowStockAlertsProps {
    products: Product[];
    onCreatePO: (product: Product) => void;
}

export default function LowStockAlerts({ products, onCreatePO }: LowStockAlertsProps) {
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.reOrderLevel);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                <CardTitle className="text-base font-semibold">Low Stock Alerts</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" asChild>
                <Link href="/stock-alerts">
                    View All
                    <ChevronRight className="h-3.5 w-3.5" />
                </Link>
            </Button>
        </div>
        <CardDescription className="text-xs">
          These items are running low. Create purchase orders to restock.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2.5">
          {lowStockProducts.slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg border bg-card/60 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
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
                  <p className="text-xs text-muted-foreground truncate">SKU: {item.sku}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="font-bold text-sm text-red-500 whitespace-nowrap">{item.stock} units</p>
                  <p className="text-[11px] text-muted-foreground whitespace-nowrap">Re-order: {item.reOrderLevel}</p>
                </div>
                <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs shrink-0" onClick={() => onCreatePO(item)}>
                  <ShoppingCart className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  Order
                </Button>
              </div>
            </div>
          ))}
          {lowStockProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No low stock items. Good job!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
