
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { slowMovingItems } from "@/lib/dashboard-data";
import Image from "next/image";
import { TrendingDownIcon } from "../icons/trending-down";

export default function SlowMovingItems() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <TrendingDownIcon className="h-5 w-5 text-red-500" />
            <CardTitle>Slow-Moving Items</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {slowMovingItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <Image
                src={item.imageUrl}
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

