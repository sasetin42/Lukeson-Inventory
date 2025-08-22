
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <CardTitle>Low Stock Alerts</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
                <Link href="/stock-alerts">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
            </Button>
        </div>
        <CardDescription>
          These items are running low. Create purchase orders to restock.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockProducts.slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <ProductImage
                  path={item.productImage}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="rounded-md"
                  data-ai-hint="product image"
                />
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-red-500">{item.stock} units</p>
                  <p className="text-xs text-muted-foreground">Re-order: {item.reOrderLevel}</p>
                </div>
                <Button size="sm" variant="outline" className="h-8" onClick={() => onCreatePO(item)}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Order
                </Button>
              </div>
            </div>
          ))}
          {lowStockProducts.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No low stock items. Good job!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
