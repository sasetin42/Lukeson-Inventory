

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quickStats } from "@/lib/dashboard-data";
import { Zap } from "lucide-react";
import Link from 'next/link';

export default function QuickStats() {
  const statLinks = {
    "New Customers": "/customer",
    "Pending Orders": "/sales-orders",
    "Open Invoices": "/invoices",
    "Fulfilled Orders": "/sales-orders"
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <CardTitle>Quick Stats</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {quickStats.map((stat) => (
            <Link href={statLinks[stat.label as keyof typeof statLinks] || '#'} key={stat.label}>
                <div className="p-4 rounded-lg bg-muted/50 flex flex-col items-center justify-center text-center hover:bg-muted transition-colors h-full">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
