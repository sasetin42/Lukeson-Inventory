
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { products } from "@/lib/products-data";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

export default function LowStockAlerts() {
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.reOrderLevel);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <CardTitle>Low Stock Alerts</CardTitle>
            </div>
            <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
        <CardDescription>
          These items are running low. Create purchase orders to restock.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockProducts.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-500">{item.stock} units</p>
                <p className="text-xs text-muted-foreground">Re-order: {item.reOrderLevel}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
